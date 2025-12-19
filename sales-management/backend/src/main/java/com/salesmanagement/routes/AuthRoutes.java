package com.salesmanagement.routes;

import com.salesmanagement.repositories.UserRepository;
import com.salesmanagement.utils.AuthUtils;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.pgclient.PgPool;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class AuthRoutes {
    private static final Logger logger = LoggerFactory.getLogger(AuthRoutes.class);
    private final UserRepository userRepository;
    private final JWTAuth jwtAuth;

    public AuthRoutes(Router router, PgPool db) {
        this.userRepository = new UserRepository(db);
        this.jwtAuth = AuthUtils.createJwtAuth();

        router.post("/api/auth/signup").handler(this::signup);
        router.post("/api/auth/login").handler(this::login);
    }

    private void signup(RoutingContext ctx) {
        JsonObject body = ctx.body().asJsonObject();
        String name = body.getString("name");
        String email = body.getString("email");
        String password = body.getString("password");

        if (name == null || name.trim().isEmpty()) {
            ctx.response()
                .setStatusCode(400)
                .putHeader("Content-Type", "application/json")
                .end(new JsonObject().put("error", "Name is required").encode());
            return;
        }

        if (email == null || email.trim().isEmpty()) {
            ctx.response()
                .setStatusCode(400)
                .putHeader("Content-Type", "application/json")
                .end(new JsonObject().put("error", "Email is required").encode());
            return;
        }

        if (password == null || password.length() < 6) {
            ctx.response()
                .setStatusCode(400)
                .putHeader("Content-Type", "application/json")
                .end(new JsonObject().put("error", "Password must be at least 6 characters").encode());
            return;
        }

        userRepository.findByEmail(email.toLowerCase())
            .compose(existingUser -> {
                if (existingUser != null) {
                    return io.vertx.core.Future.failedFuture("Email already exists");
                }
                String passwordHash = AuthUtils.hashPassword(password);
                return userRepository.create(name.trim(), email.toLowerCase().trim(), passwordHash);
            })
            .onSuccess(user -> {
                String token = AuthUtils.generateToken(user.getId(), user.getEmail());
                JsonObject response = new JsonObject()
                    .put("token", token)
                    .put("user", new JsonObject()
                        .put("id", user.getId())
                        .put("name", user.getName())
                        .put("email", user.getEmail()));
                
                ctx.response()
                    .setStatusCode(201)
                    .putHeader("Content-Type", "application/json")
                    .end(response.encode());
            })
            .onFailure(err -> {
                logger.error("Signup error", err);
                String errorMessage = err.getMessage();
                int statusCode = errorMessage.contains("already exists") ? 409 : 500;
                
                ctx.response()
                    .setStatusCode(statusCode)
                    .putHeader("Content-Type", "application/json")
                    .end(new JsonObject().put("error", errorMessage).encode());
            });
    }

    private void login(RoutingContext ctx) {
        JsonObject body = ctx.body().asJsonObject();
        String email = body.getString("email");
        String password = body.getString("password");

        if (email == null || password == null) {
            ctx.response()
                .setStatusCode(400)
                .putHeader("Content-Type", "application/json")
                .end(new JsonObject().put("error", "Email and password are required").encode());
            return;
        }

        userRepository.findByEmail(email.toLowerCase())
            .onSuccess(user -> {
                if (user == null || !AuthUtils.verifyPassword(password, user.getPasswordHash())) {
                    ctx.response()
                        .setStatusCode(401)
                        .putHeader("Content-Type", "application/json")
                        .end(new JsonObject().put("error", "Invalid email or password").encode());
                    return;
                }

                String token = AuthUtils.generateToken(user.getId(), user.getEmail());
                JsonObject response = new JsonObject()
                    .put("token", token)
                    .put("user", new JsonObject()
                        .put("id", user.getId())
                        .put("name", user.getName())
                        .put("email", user.getEmail()));
                
                ctx.response()
                    .setStatusCode(200)
                    .putHeader("Content-Type", "application/json")
                    .end(response.encode());
            })
            .onFailure(err -> {
                logger.error("Login error", err);
                ctx.response()
                    .setStatusCode(500)
                    .putHeader("Content-Type", "application/json")
                    .end(new JsonObject().put("error", "Internal server error").encode());
            });
    }
}
