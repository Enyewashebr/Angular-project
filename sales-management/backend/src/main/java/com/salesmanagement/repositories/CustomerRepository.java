package com.salesmanagement.repositories;

import com.salesmanagement.models.Customer;
import io.vertx.core.Future;
import io.vertx.pgclient.PgPool;
import io.vertx.sqlclient.Row;
import io.vertx.sqlclient.Tuple;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class CustomerRepository {
    private final PgPool db;

    public CustomerRepository(PgPool db) {
        this.db = db;
    }

    public Future<List<Customer>> findAll() {
        return db.query("SELECT id, name, email, phone, company, created_at FROM customers ORDER BY created_at DESC")
            .execute()
            .map(rows -> {
                List<Customer> customers = new ArrayList<>();
                for (Row row : rows) {
                    customers.add(mapRow(row));
                }
                return customers;
            });
    }

    public Future<Customer> findById(Integer id) {
        return db.preparedQuery("SELECT id, name, email, phone, company, created_at FROM customers WHERE id = $1")
            .execute(Tuple.of(id))
            .map(rows -> {
                if (rows.iterator().hasNext()) {
                    return mapRow(rows.iterator().next());
                }
                return null;
            });
    }

    public Future<Customer> create(Customer customer) {
        return db.preparedQuery(
            "INSERT INTO customers (name, email, phone, company, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, company, created_at")
            .execute(Tuple.of(customer.getName(), customer.getEmail(), customer.getPhone(), 
                customer.getCompany(), LocalDateTime.now()))
            .map(rows -> mapRow(rows.iterator().next()));
    }

    public Future<Customer> update(Integer id, Customer customer) {
        return db.preparedQuery(
            "UPDATE customers SET name = $1, email = $2, phone = $3, company = $4 WHERE id = $5 RETURNING id, name, email, phone, company, created_at")
            .execute(Tuple.of(customer.getName(), customer.getEmail(), customer.getPhone(), 
                customer.getCompany(), id))
            .map(rows -> {
                if (rows.iterator().hasNext()) {
                    return mapRow(rows.iterator().next());
                }
                return null;
            });
    }

    public Future<Void> delete(Integer id) {
        return db.preparedQuery("DELETE FROM customers WHERE id = $1")
            .execute(Tuple.of(id))
            .map(rows -> null);
    }

    private Customer mapRow(Row row) {
        return new Customer(
            row.getInteger("id"),
            row.getString("name"),
            row.getString("email"),
            row.getString("phone"),
            row.getString("company"),
            row.getLocalDateTime("created_at")
        );
    }
}
