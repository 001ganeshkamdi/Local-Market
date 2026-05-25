package com.localmarket.localmarket.dto;

import java.util.List;
import java.util.Map;

public class ProductRequest {
    private String name;
    private double price;
    private Double originalPrice;
    private String currency;
    private String description;
    private String category;
    private String type;
    private Map<String, Object> attributes;
    private List<String> images;
    private String userId;

    public String getName() {
        return name;
    }

    public double getPrice() {
        return price;
    }

    public Double getOriginalPrice() {
        return originalPrice;
    }

    public String getCurrency() {
        return currency;
    }

    public String getDescription() {
        return description;
    }

    public String getCategory() {
        return category;
    }

    public String getType() {
        return type;
    }

    public Map<String, Object> getAttributes() {
        return attributes;
    }

    public List<String> getImages() {
        return images;
    }

    public String getUserId() {
        return userId;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public void setOriginalPrice(Double originalPrice) {
        this.originalPrice = originalPrice;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setAttributes(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    public void setImages(List<String> images) {
        this.images = images;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}
