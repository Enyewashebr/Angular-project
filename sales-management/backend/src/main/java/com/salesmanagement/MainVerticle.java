package com.salesmanagement;

import com.salesmanagement.config.DatabaseConfig;
import com.salesmanagement.routes.AuthRoutes;
import com.salesmanagement.routes.CustomerRoutes;
import com.salesmanagement.routes.OrderRoutes;
import com.salesmanagement.routes.ProductRoutes;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.BodyHandler;
import io.vertx.ext.web.handler.CorsHandler;
import io.vertx.pgclient.PgPool;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MainVerticle extends AbstractVerticle {
    private static final Logger logger = LoggerFactory.getLogger(MainVerticle.class);
    private PgPool db;

    @Override
    public void start(Promise<Void> startPromise) {
        // Initialize database connection pool
        db = DatabaseConfig.createPool(vertx);

        // Create router
        Router router = Router.router(vertx);

        // CORS configuration for Angular frontend
        router.route().handler(CorsHandler.create()
            .addOrigin("http://localhost:4200")
            .allowedMethods(io.vertx.core.http.HttpMethod.values())
            .allowedHeaders(java.util.Set.of(
                "Content-Type",
                "Authorization",
                "Accept",
                "Origin",
                "X-Requested-With"
            ))
            .allowCredentials(true));

        // Body handler for parsing JSON
        router.route().handler(BodyHandler.create());

        // Health check endpoint
        router.get("/health").handler(ctx -> {
            ctx.response()
                .putHeader("Content-Type", "application/json")
                .end(new JsonObject().put("status", "ok").encode());
        });

        // Register routes
        new AuthRoutes(router, db);
        new ProductRoutes(router, db);
        new CustomerRoutes(router, db);
        new OrderRoutes(router, db);

        // Start HTTP server
        int port = config().getInteger("http.port", 8080);
        vertx.createHttpServer()
            .requestHandler(router)
            .listen(port)
            .onSuccess(server -> {
                logger.info("HTTP server started on port {}", port);
                startPromise.complete();
            })
            .onFailure(startPromise::fail);
    }

    @Override
    public void stop(Promise<Void> stopPromise) {
        if (db != null) {
            db.close();
        }
        stopPromise.complete();
    }
}
