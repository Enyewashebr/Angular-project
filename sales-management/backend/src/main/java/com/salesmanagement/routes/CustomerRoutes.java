package com.salesmanagement.routes;

import com.salesmanagement.models.Customer;
import com.salesmanagement.repositories.CustomerRepository;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.pgclient.PgPool;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class CustomerRoutes {
    private static final Logger logger = LoggerFactory.getLogger(CustomerRoutes.class);
    private final CustomerRepository customerRepository;

    public CustomerRoutes(Router router, PgPool db) {
        this.customerRepository = new CustomerRepository(db);

        router.get("/api/customers").handler(this::getAll);
        router.get("/api/customers/:id").handler(this::getById);
        router.post("/api/customers").handler(this::create);
        router.put("/api/customers/:id").handler(this::update);
        router.delete("/api/customers/:id").handler(this::delete);
    }

    private void getAll(RoutingContext ctx) {
        customerRepository.findAll()
            .onSuccess(customers -> {
                io.vertx.core.json.JsonArray jsonArray = new io.vertx.core.json.JsonArray();
                for (Customer customer : customers) {
                    jsonArray.add(toJson(customer));
                }
                ctx.response()
                    .putHeader("Content-Type", "application/json")
                    .end(jsonArray.encode());
            })
            .onFailure(err -> {
                logger.error("Error fetching customers", err);
                ctx.response()
                    .setStatusCode(500)
                    .putHeader("Content-Type", "application/json")
                    .end(new JsonObject().put("error", "Failed to fetch customers").encode());
            });
    }

    private void getById(RoutingContext ctx) {
        Integer id = Integer.parseInt(ctx.pathParam("id"));
        customerRepository.findById(id)
            .onSuccess(customer -> {
                if (customer == null) {
                    ctx.response()
                        .setStatusCode(404)
                        .putHeader("Content-Type", "application/json")
                        .end(new JsonObject().put("error", "Customer not found").encode());
                } else {
                    ctx.response()
                        .putHeader("Content-Type", "application/json")
                        .end(toJson(customer).encode());
                }
            })
            .onFailure(err -> {
                logger.error("Error fetching customer", err);
                ctx.response()
                    .setStatusCode(500)
                    .putHeader("Content-Type", "application/json")
                    .end(new JsonObject().put("error", "Failed to fetch customer").encode());
            });
    }

    private void create(RoutingContext ctx) {
        JsonObject body = ctx.body().asJsonObject();
        Customer customer = fromJson(body);

        if (customer.getName() == null || customer.getEmail() == null) {
            ctx.response()
                .setStatusCode(400)
                .putHeader("Content-Type", "application/json")
                .end(new JsonObject().put("error", "Name and email are required").encode());
            return;
        }

        customerRepository.create(customer)
            .onSuccess(created -> {
                ctx.response()
                    .setStatusCode(201)
                    .putHeader("Content-Type", "application/json")
                    .end(toJson(created).encode());
            })
            .onFailure(err -> {
                logger.error("Error creating customer", err);
                ctx.response()
                    .setStatusCode(500)
                    .putHeader("Content-Type", "application/json")
                    .end(new JsonObject().put("error", "Failed to create customer").encode());
            });
    }

    private void update(RoutingContext ctx) {
        Integer id = Integer.parseInt(ctx.pathParam("id"));
        JsonObject body = ctx.body().asJsonObject();
        Customer customer = fromJson(body);

        customerRepository.update(id, customer)
            .onSuccess(updated -> {
                if (updated == null) {
                    ctx.response()
                        .setStatusCode(404)
                        .putHeader("Content-Type", "application/json")
                        .end(new JsonObject().put("error", "Customer not found").encode());
                } else {
                    ctx.response()
                        .putHeader("Content-Type", "application/json")
                        .end(toJson(updated).encode());
                }
            })
            .onFailure(err -> {
                logger.error("Error updating customer", err);
                ctx.response()
                    .setStatusCode(500)
                    .putHeader("Content-Type", "application/json")
                    .end(new JsonObject().put("error", "Failed to update customer").encode());
            });
    }

    private void delete(RoutingContext ctx) {
        Integer id = Integer.parseInt(ctx.pathParam("id"));
        customerRepository.delete(id)
            .onSuccess(v -> {
                ctx.response()
                    .setStatusCode(204)
                    .end();
            })
            .onFailure(err -> {
                logger.error("Error deleting customer", err);
                ctx.response()
                    .setStatusCode(500)
                    .putHeader("Content-Type", "application/json")
                    .end(new JsonObject().put("error", "Failed to delete customer").encode());
            });
    }

    private JsonObject toJson(Customer customer) {
        JsonObject json = new JsonObject()
            .put("id", customer.getId())
            .put("name", customer.getName())
            .put("email", customer.getEmail())
            .put("phone", customer.getPhone())
            .put("createdAt", customer.getCreatedAt() != null ? customer.getCreatedAt().toString() : null);
        
        if (customer.getCompany() != null) {
            json.put("company", customer.getCompany());
        }
        
        return json;
    }

    private Customer fromJson(JsonObject json) {
        Customer customer = new Customer();
        if (json.containsKey("name")) customer.setName(json.getString("name"));
        if (json.containsKey("email")) customer.setEmail(json.getString("email"));
        if (json.containsKey("phone")) customer.setPhone(json.getString("phone"));
        if (json.containsKey("company")) customer.setCompany(json.getString("company"));
        return customer;
    }
}
