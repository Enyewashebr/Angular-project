package com.salesmanagement.routes;

import com.salesmanagement.models.Product;
import com.salesmanagement.repositories.ProductRepository;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.pgclient.PgPool;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ProductRoutes {
    private static final Logger logger = LoggerFactory.getLogger(ProductRoutes.class);
    private final ProductRepository productRepository;

    public ProductRoutes(Router router, PgPool db) {
        this.productRepository = new ProductRepository(db);

        router.get("/api/products").handler(this::getAll);
        router.get("/api/products/:id").handler(this::getById);
        router.post("/api/products").handler(this::create);
        router.put("/api/products/:id").handler(this::update);
        router.delete("/api/products/:id").handler(this::delete);
    }

    private void getAll(RoutingContext ctx) {
        productRepository.findAll()
            .onSuccess(products -> {
                io.vertx.core.json.JsonArray jsonArray = new io.vertx.core.json.JsonArray();
                for (Product product : products) {
                    jsonArray.add(toJson(product));
                }
                ctx.response()
                    .putHeader("Content-Type", "application/json")
                    .end(jsonArray.encode());
            })
            .onFailure(err -> {
                logger.error("Error fetching products", err);
                ctx.response()
                    .setStatusCode(500)
                    .putHeader("Content-Type", "application/json")
                    .end(new JsonObject().put("error", "Failed to fetch products").encode());
            });
    }

    private void getById(RoutingContext ctx) {
        Integer id = Integer.parseInt(ctx.pathParam("id"));
        productRepository.findById(id)
            .onSuccess(product -> {
                if (product == null) {
                    ctx.response()
                        .setStatusCode(404)
                        .putHeader("Content-Type", "application/json")
                        .end(new JsonObject().put("error", "Product not found").encode());
                } else {
                    ctx.response()
                        .putHeader("Content-Type", "application/json")
                        .end(toJson(product).encode());
                }
            })
            .onFailure(err -> {
                logger.error("Error fetching product", err);
                ctx.response()
                    .setStatusCode(500)
                    .putHeader("Content-Type", "application/json")
                    .end(new JsonObject().put("error", "Failed to fetch product").encode());
            });
    }

    private void create(RoutingContext ctx) {
        JsonObject body = ctx.body().asJsonObject();
        Product product = fromJson(body);

        if (product.getName() == null || product.getPrice() == null) {
            ctx.response()
                .setStatusCode(400)
                .putHeader("Content-Type", "application/json")
                .end(new JsonObject().put("error", "Name and price are required").encode());
            return;
        }

        productRepository.create(product)
            .onSuccess(created -> {
                ctx.response()
                    .setStatusCode(201)
                    .putHeader("Content-Type", "application/json")
                    .end(toJson(created).encode());
            })
            .onFailure(err -> {
                logger.error("Error creating product", err);
                ctx.response()
                    .setStatusCode(500)
                    .putHeader("Content-Type", "application/json")
                    .end(new JsonObject().put("error", "Failed to create product").encode());
            });
    }

    private void update(RoutingContext ctx) {
        Integer id = Integer.parseInt(ctx.pathParam("id"));
        JsonObject body = ctx.body().asJsonObject();
        Product product = fromJson(body);

        productRepository.update(id, product)
            .onSuccess(updated -> {
                if (updated == null) {
                    ctx.response()
                        .setStatusCode(404)
                        .putHeader("Content-Type", "application/json")
                        .end(new JsonObject().put("error", "Product not found").encode());
                } else {
                    ctx.response()
                        .putHeader("Content-Type", "application/json")
                        .end(toJson(updated).encode());
                }
            })
            .onFailure(err -> {
                logger.error("Error updating product", err);
                ctx.response()
                    .setStatusCode(500)
                    .putHeader("Content-Type", "application/json")
                    .end(new JsonObject().put("error", "Failed to update product").encode());
            });
    }

    private void delete(RoutingContext ctx) {
        Integer id = Integer.parseInt(ctx.pathParam("id"));
        productRepository.delete(id)
            .onSuccess(v -> {
                ctx.response()
                    .setStatusCode(204)
                    .end();
            })
            .onFailure(err -> {
                logger.error("Error deleting product", err);
                ctx.response()
                    .setStatusCode(500)
                    .putHeader("Content-Type", "application/json")
                    .end(new JsonObject().put("error", "Failed to delete product").encode());
            });
    }

    private JsonObject toJson(Product product) {
        return new JsonObject()
            .put("id", product.getId())
            .put("name", product.getName())
            .put("category", product.getCategory())
            .put("price", product.getPrice())
            .put("stock", product.getStock())
            .put("description", product.getDescription());
    }

    private Product fromJson(JsonObject json) {
        Product product = new Product();
        if (json.containsKey("name")) product.setName(json.getString("name"));
        if (json.containsKey("category")) product.setCategory(json.getString("category"));
        if (json.containsKey("price")) product.setPrice(json.getDouble("price"));
        if (json.containsKey("stock")) product.setStock(json.getInteger("stock"));
        if (json.containsKey("description")) product.setDescription(json.getString("description"));
        return product;
    }
}
