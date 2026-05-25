package com.localmarket.localmarket.dto;

import java.util.List;
import java.util.Map;

public class ProductResponse {
    private final String productId;
    private final String productName;
    private final double price;
    private final Double originalPrice;
    private final String currency;
    private final String description;
    private final String category;
    private final String userId;
    private final String type;
    private final Map<String, Object> attributes;
    private final List<String> images;
    private final String shopId;
    private final String shopName;
    private final String location;
    private final Double latitude;
    private final Double longitude;
    private final Double distanceKm;

    public ProductResponse(
        String productId,
        String productName,
        double price,
        Double originalPrice,
        String currency,
        String description,
        String category,
        String userId,
        String type,
        Map<String, Object> attributes,
        List<String> images,
        String shopId,
        String shopName,
        String location,
        Double latitude,
        Double longitude,
        Double distanceKm
    ) {
        this.productId = productId;
        this.productName = productName;
        this.price = price;
        this.originalPrice = originalPrice;
        this.currency = currency;
        this.description = description;
        this.category = category;
        this.userId = userId;
        this.type = type;
        this.attributes = attributes;
        this.images = images;
        this.shopId = shopId;
        this.shopName = shopName;
        this.location = location;
        this.latitude = latitude;
        this.longitude = longitude;
        this.distanceKm = distanceKm;
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

    public String getUserId() {
        return userId;
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

    public String getShopId() {
        return shopId;
    }

    public String getShopName() {
        return shopName;
    }

    public String getLocation() {
        return location;
    }

    public Double getLatitude() {
        return latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public Double getDistanceKm() {
        return distanceKm;
    }
}
