package com.salesmanagement.config;

import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.pgclient.PgConnectOptions;
import io.vertx.pgclient.PgPool;
import io.vertx.sqlclient.PoolOptions;

public class DatabaseConfig {
    private static final String DB_HOST = System.getenv().getOrDefault("DB_HOST", "localhost");
    private static final int DB_PORT = Integer.parseInt(System.getenv().getOrDefault("DB_PORT", "5432"));
    private static final String DB_NAME = System.getenv().getOrDefault("DB_NAME", "sales_management");
    private static final String DB_USER = System.getenv().getOrDefault("DB_USER", "postgres");
    private static final String DB_PASSWORD = System.getenv().getOrDefault("DB_PASSWORD", "postgres");
    private static final int POOL_SIZE = Integer.parseInt(System.getenv().getOrDefault("DB_POOL_SIZE", "10"));

    public static PgPool createPool(Vertx vertx) {
        PgConnectOptions connectOptions = new PgConnectOptions()
            .setHost(DB_HOST)
            .setPort(DB_PORT)
            .setDatabase(DB_NAME)
            .setUser(DB_USER)
            .setPassword(DB_PASSWORD);

        PoolOptions poolOptions = new PoolOptions()
            .setMaxSize(POOL_SIZE);

        return PgPool.pool(vertx, connectOptions, poolOptions);
    }
}
