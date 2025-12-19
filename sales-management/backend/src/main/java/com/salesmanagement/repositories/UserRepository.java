package com.salesmanagement.repositories;

import com.salesmanagement.models.User;
import io.vertx.core.Future;
import io.vertx.pgclient.PgPool;
import io.vertx.sqlclient.Row;
import io.vertx.sqlclient.RowSet;
import io.vertx.sqlclient.Tuple;

import java.time.LocalDateTime;

public class UserRepository {
    private final PgPool db;

    public UserRepository(PgPool db) {
        this.db = db;
    }

    public Future<User> findByEmail(String email) {
        return db.preparedQuery("SELECT id, name, email, password_hash, created_at FROM users WHERE email = $1")
            .execute(Tuple.of(email))
            .map(rows -> {
                if (rows.iterator().hasNext()) {
                    return mapRow(rows.iterator().next());
                }
                return null;
            });
    }

    public Future<User> findById(Integer id) {
        return db.preparedQuery("SELECT id, name, email, password_hash, created_at FROM users WHERE id = $1")
            .execute(Tuple.of(id))
            .map(rows -> {
                if (rows.iterator().hasNext()) {
                    return mapRow(rows.iterator().next());
                }
                return null;
            });
    }

    public Future<User> create(String name, String email, String passwordHash) {
        return db.preparedQuery(
            "INSERT INTO users (name, email, password_hash, created_at) VALUES ($1, $2, $3, $4) RETURNING id, name, email, password_hash, created_at")
            .execute(Tuple.of(name, email, passwordHash, LocalDateTime.now()))
            .map(rows -> mapRow(rows.iterator().next()));
    }

    private User mapRow(Row row) {
        return new User(
            row.getInteger("id"),
            row.getString("name"),
            row.getString("email"),
            row.getString("password_hash"),
            row.getLocalDateTime("created_at")
        );
    }
}
