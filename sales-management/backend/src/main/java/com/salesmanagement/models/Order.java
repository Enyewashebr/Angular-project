package com.salesmanagement.models;

import java.time.LocalDateTime;
import java.util.List;

public class Order {
    private Integer id;
    private LocalDateTime createdAt;
    private Integer customerId;
    private String customerName;
    private String customerEmail;
    private List<OrderItem> items;
    private Double total;

    public Order() {
    }

    public Order(Integer id, LocalDateTime createdAt, Integer customerId, String customerName, 
                 String customerEmail, List<OrderItem> items, Double total) {
        this.id = id;
        this.createdAt = createdAt;
        this.customerId = customerId;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.items = items;
        this.total = total;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Integer getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Integer customerId) {
        this.customerId = customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
    }

    public Double getTotal() {
        return total;
    }

    public void setTotal(Double total) {
        this.total = total;
    }

    public static class OrderItem {
        private Integer productId;
        private String productName;
        private Double unitPrice;
        private Integer quantity;
        private Double lineTotal;

        public OrderItem() {
        }

        public OrderItem(Integer productId, String productName, Double unitPrice, Integer quantity, Double lineTotal) {
            this.productId = productId;
            this.productName = productName;
            this.unitPrice = unitPrice;
            this.quantity = quantity;
            this.lineTotal = lineTotal;
        }

        // Getters and Setters
        public Integer getProductId() {
            return productId;
        }

        public void setProductId(Integer productId) {
            this.productId = productId;
        }

        public String getProductName() {
            return productName;
        }

        public void setProductName(String productName) {
            this.productName = productName;
        }

        public Double getUnitPrice() {
            return unitPrice;
        }

        public void setUnitPrice(Double unitPrice) {
            this.unitPrice = unitPrice;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }

        public Double getLineTotal() {
            return lineTotal;
        }

        public void setLineTotal(Double lineTotal) {
            this.lineTotal = lineTotal;
        }
    }
}
