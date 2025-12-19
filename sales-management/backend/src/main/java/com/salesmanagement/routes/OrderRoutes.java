package com.salesmanagement.routes;

import com.salesmanagement.models.Order;
import com.salesmanagement.models.Order.OrderItem;
import com.salesmanagement.repositories.OrderRepository;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.pgclient.PgPool;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

public class OrderRoutes {
    private static final Logger logger = LoggerFactory.getLogger(OrderRoutes.class);
    private final OrderRepository orderRepository;

    public OrderRoutes(Router router, PgPool db) {
        this.orderRepository = new OrderRepository(db);

        router.get("/api/orders").handler(this::getAll);
        router.get("/api/orders/:id").handler(this::getById);
        router.post("/api/orders").handler(this::create);
        router.delete("/api/orders/:id").handler(this::delete);
    }

    private void getAll(RoutingContext ctx) {
        orderRepository.findAll()
            .onSuccess(orders -> {
                JsonArray jsonArray = new JsonArray();
                for (Order order : orders) {
                    jsonArray.add(toJson(order));
                }
                ctx.response()
                    .putHeader("Content-Type", "application/json")
                    .end(jsonArray.encode());
            })
            .onFailure(err -> {
                logger.error("Error fetching orders", err);
                ctx.response()
                    .setStatusCode(500)
                    .putHeader("Content-Type", "application/json")
                    .end(new JsonObject().put("error", "Failed to fetch orders").encode());
            });
    }

    private void getById(RoutingContext ctx) {
        Integer id = Integer.parseInt(ctx.pathParam("id"));
        orderRepository.findById(id)
            .onSuccess(order -> {
                if (order == null) {
                    ctx.response()
                        .setStatusCode(404)
                        .putHeader("Content-Type", "application/json")
                        .end(new JsonObject().put("error", "Order not found").encode());
                } else {
                    ctx.response()
                        .putHeader("Content-Type", "application/json")
                        .end(toJson(order).encode());
                }
            })
            .onFailure(err -> {
                logger.error("Error fetching order", err);
                ctx.response()
                    .setStatusCode(500)
                    .putHeader("Content-Type", "application/json")
                    .end(new JsonObject().put("error", "Failed to fetch order").encode());
            });
    }

    private void create(RoutingContext ctx) {
        JsonObject body = ctx.body().asJsonObject();
        Order order = fromJson(body);

        if (order.getCustomerId() == null || order.getItems() == null || order.getItems().isEmpty()) {
            ctx.response()
                .setStatusCode(400)
                .putHeader("Content-Type", "application/json")
                .end(new JsonObject().put("error", "Customer ID and items are required").encode());
            return;
        }

        // Calculate total
        double total = order.getItems().stream()
            .mapToDouble(item -> item.getUnitPrice() * item.getQuantity())
            .sum();
        order.setTotal(total);

        // Calculate line totals
        for (OrderItem item : order.getItems()) {
            item.setLineTotal(item.getUnitPrice() * item.getQuantity());
        }

        orderRepository.create(order)
            .onSuccess(created -> {
                ctx.response()
                    .setStatusCode(201)
                    .putHeader("Content-Type", "application/json")
                    .end(toJson(created).encode());
            })
            .onFailure(err -> {
                logger.error("Error creating order", err);
                ctx.response()
                    .setStatusCode(500)
                    .putHeader("Content-Type", "application/json")
                    .end(new JsonObject().put("error", "Failed to create order").encode());
            });
    }

    private void delete(RoutingContext ctx) {
        Integer id = Integer.parseInt(ctx.pathParam("id"));
        orderRepository.delete(id)
            .onSuccess(v -> {
                ctx.response()
                    .setStatusCode(204)
                    .end();
            })
            .onFailure(err -> {
                logger.error("Error deleting order", err);
                ctx.response()
                    .setStatusCode(500)
                    .putHeader("Content-Type", "application/json")
                    .end(new JsonObject().put("error", "Failed to delete order").encode());
            });
    }

    private JsonObject toJson(Order order) {
        JsonArray itemsArray = new JsonArray();
        for (OrderItem item : order.getItems()) {
            itemsArray.add(new JsonObject()
                .put("productId", item.getProductId())
                .put("productName", item.getProductName())
                .put("unitPrice", item.getUnitPrice())
                .put("quantity", item.getQuantity())
                .put("lineTotal", item.getLineTotal()));
        }

        JsonObject json = new JsonObject()
            .put("id", order.getId())
            .put("createdAt", order.getCreatedAt() != null ? order.getCreatedAt().toString() : null)
            .put("customerId", order.getCustomerId())
            .put("customerName", order.getCustomerName())
            .put("items", itemsArray)
            .put("total", order.getTotal());

        if (order.getCustomerEmail() != null) {
            json.put("customerEmail", order.getCustomerEmail());
        }

        return json;
    }

    private Order fromJson(JsonObject json) {
        Order order = new Order();
        
        if (json.containsKey("customerId")) {
            order.setCustomerId(json.getInteger("customerId"));
        }
        if (json.containsKey("customerName")) {
            order.setCustomerName(json.getString("customerName"));
        }
        if (json.containsKey("customerEmail")) {
            order.setCustomerEmail(json.getString("customerEmail"));
        }

        if (json.containsKey("items")) {
            JsonArray itemsArray = json.getJsonArray("items");
            List<OrderItem> items = new ArrayList<>();
            for (int i = 0; i < itemsArray.size(); i++) {
                JsonObject itemJson = itemsArray.getJsonObject(i);
                OrderItem item = new OrderItem();
                item.setProductId(itemJson.getInteger("productId"));
                item.setProductName(itemJson.getString("productName"));
                item.setUnitPrice(itemJson.getDouble("unitPrice"));
                item.setQuantity(itemJson.getInteger("quantity"));
                items.add(item);
            }
            order.setItems(items);
        }

        return order;
    }
}
