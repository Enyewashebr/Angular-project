package com.salesmanagement.repositories;

import com.salesmanagement.models.Product;
import io.vertx.core.Future;
import io.vertx.pgclient.PgPool;
import io.vertx.sqlclient.Row;
import io.vertx.sqlclient.RowSet;
import io.vertx.sqlclient.Tuple;

import java.util.ArrayList;
import java.util.List;

public class ProductRepository {
    private final PgPool db;

    public ProductRepository(PgPool db) {
        this.db = db;
    }

    public Future<List<Product>> findAll() {
        return db.query("SELECT id, name, category, price, stock, description FROM products ORDER BY id")
            .execute()
            .map(rows -> {
                List<Product> products = new ArrayList<>();
                for (Row row : rows) {
                    products.add(mapRow(row));
                }
                return products;
            });
    }

    public Future<Product> findById(Integer id) {
        return db.preparedQuery("SELECT id, name, category, price, stock, description FROM products WHERE id = $1")
            .execute(Tuple.of(id))
            .map(rows -> {
                if (rows.iterator().hasNext()) {
                    return mapRow(rows.iterator().next());
                }
                return null;
            });
    }

    public Future<Product> create(Product product) {
        return db.preparedQuery(
            "INSERT INTO products (name, category, price, stock, description) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, category, price, stock, description")
            .execute(Tuple.of(product.getName(), product.getCategory(), product.getPrice(), 
                product.getStock(), product.getDescription()))
            .map(rows -> mapRow(rows.iterator().next()));
    }

    public Future<Product> update(Integer id, Product product) {
        return db.preparedQuery(
            "UPDATE products SET name = $1, category = $2, price = $3, stock = $4, description = $5 WHERE id = $6 RETURNING id, name, category, price, stock, description")
            .execute(Tuple.of(product.getName(), product.getCategory(), product.getPrice(), 
                product.getStock(), product.getDescription(), id))
            .map(rows -> {
                if (rows.iterator().hasNext()) {
                    return mapRow(rows.iterator().next());
                }
                return null;
            });
    }

    public Future<Void> delete(Integer id) {
        return db.preparedQuery("DELETE FROM products WHERE id = $1")
            .execute(Tuple.of(id))
            .map(rows -> null);
    }

    private Product mapRow(Row row) {
        return new Product(
            row.getInteger("id"),
            row.getString("name"),
            row.getString("category"),
            row.getDouble("price"),
            row.getInteger("stock"),
            row.getString("description")
        );
    }
}
