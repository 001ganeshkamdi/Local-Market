package com.localmarket.localmarket.dto;

import java.util.List;
import java.util.Map;

public class MatchingProductResponse {
    private final String productId;
    private final String productName;
    private final double price;
    private final Double originalPrice;
    private final String currency;
    private final String description;
    private final String category;
    private final String type;
    private final Map<String, Object> attributes;
    private final List<String> images;

    public MatchingProductResponse(
        String productId,
        String productName,
        double price,
        Double originalPrice,
        String currency,
        String description,
        String category,
        String type,
        Map<String, Object> attributes,
        List<String> images
    ) {
        this.productId = productId;
        this.productName = productName;
        this.price = price;
        this.originalPrice = originalPrice;
        this.currency = currency;
        this.description = description;
        this.category = category;
        this.type = type;
        this.attributes = attributes;
        this.images = images;
    }

    public String getProductId() {
        return productId;
    }

    public String getProductName() {
        return productName;
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
}
