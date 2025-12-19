package com.salesmanagement.repositories;

import com.salesmanagement.models.Order;
import com.salesmanagement.models.Order.OrderItem;
import io.vertx.core.Future;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.pgclient.PgPool;
import io.vertx.sqlclient.Row;
import io.vertx.sqlclient.Tuple;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class OrderRepository {
    private final PgPool db;

    public OrderRepository(PgPool db) {
        this.db = db;
    }

    public Future<List<Order>> findAll() {
        return db.query("SELECT id, created_at, customer_id, customer_name, customer_email, items, total FROM orders ORDER BY created_at DESC")
            .execute()
            .map(rows -> {
                List<Order> orders = new ArrayList<>();
                for (Row row : rows) {
                    orders.add(mapRow(row));
                }
                return orders;
            });
    }

    public Future<Order> findById(Integer id) {
        return db.preparedQuery("SELECT id, created_at, customer_id, customer_name, customer_email, items, total FROM orders WHERE id = $1")
            .execute(Tuple.of(id))
            .map(rows -> {
                if (rows.iterator().hasNext()) {
                    return mapRow(rows.iterator().next());
                }
                return null;
            });
    }

    public Future<Order> create(Order order) {
        JsonArray itemsJson = new JsonArray();
        for (OrderItem item : order.getItems()) {
            itemsJson.add(new JsonObject()
                .put("productId", item.getProductId())
                .put("productName", item.getProductName())
                .put("unitPrice", item.getUnitPrice())
                .put("quantity", item.getQuantity())
                .put("lineTotal", item.getLineTotal()));
        }

        return db.preparedQuery(
            "INSERT INTO orders (created_at, customer_id, customer_name, customer_email, items, total) VALUES ($1, $2, $3, $4, $5::jsonb, $6) RETURNING id, created_at, customer_id, customer_name, customer_email, items, total")
            .execute(Tuple.of(LocalDateTime.now(), order.getCustomerId(), order.getCustomerName(), 
                order.getCustomerEmail(), itemsJson.toString(), order.getTotal()))
            .map(rows -> mapRow(rows.iterator().next()));
    }

    public Future<Void> delete(Integer id) {
        return db.preparedQuery("DELETE FROM orders WHERE id = $1")
            .execute(Tuple.of(id))
            .map(rows -> null);
    }

    private Order mapRow(Row row) {
        JsonArray itemsJson = row.get(JsonArray.class, row.getColumnIndex("items"));
        List<OrderItem> items = new ArrayList<>();
        
        if (itemsJson != null) {
            for (int i = 0; i < itemsJson.size(); i++) {
                JsonObject itemJson = itemsJson.getJsonObject(i);
                items.add(new OrderItem(
                    itemJson.getInteger("productId"),
                    itemJson.getString("productName"),
                    itemJson.getDouble("unitPrice"),
                    itemJson.getInteger("quantity"),
                    itemJson.getDouble("lineTotal")
                ));
            }
        }

        return new Order(
            row.getInteger("id"),
            row.getLocalDateTime("created_at"),
            row.getInteger("customer_id"),
            row.getString("customer_name"),
            row.getString("customer_email"),
            items,
            row.getDouble("total")
        );
    }
}
