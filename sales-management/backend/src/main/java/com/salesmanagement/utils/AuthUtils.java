package com.salesmanagement.utils;

import io.vertx.core.json.JsonObject;
import io.vertx.ext.auth.JWTOptions;
import io.vertx.ext.auth.PubSecKeyOptions;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.auth.jwt.JWTAuthOptions;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

public class AuthUtils {
    private static final String SECRET_KEY = System.getenv().getOrDefault("JWT_SECRET", "your-secret-key-change-in-production");
    private static final long TOKEN_EXPIRY = 86400000L; // 24 hours

    public static JWTAuth createJwtAuth() {
        return JWTAuth.create(null, new JWTAuthOptions()
            .addPubSecKey(new PubSecKeyOptions()
                .setAlgorithm("HS256")
                .setBuffer(SECRET_KEY)));
    }

    public static String generateToken(Integer userId, String email) {
        JWTAuth jwtAuth = createJwtAuth();
        JsonObject claims = new JsonObject()
            .put("sub", userId.toString())
            .put("email", email);
        
        return jwtAuth.generateToken(claims, new JWTOptions().setExpiresInSeconds(TOKEN_EXPIRY / 1000));
    }

    public static String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }

    public static boolean verifyPassword(String password, String hash) {
        String passwordHash = hashPassword(password);
        return passwordHash.equals(hash);
    }
}
