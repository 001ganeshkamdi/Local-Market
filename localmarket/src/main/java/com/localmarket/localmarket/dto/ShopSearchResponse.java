package com.localmarket.localmarket.dto;

import java.util.List;

public class ShopSearchResponse {
    private final String shopId;
    private final String shopName;
    private final String location;
    private final Double latitude;
    private final Double longitude;
    private final Double distanceKm;
    private final Double lowestPrice;
    private final List<MatchingProductResponse> products;

    public ShopSearchResponse(
        String shopId,
        String shopName,
        String location,
        Double latitude,
        Double longitude,
        Double distanceKm,
        Double lowestPrice,
        List<MatchingProductResponse> products
    ) {
        this.shopId = shopId;
        this.shopName = shopName;
        this.location = location;
        this.latitude = latitude;
        this.longitude = longitude;
        this.distanceKm = distanceKm;
        this.lowestPrice = lowestPrice;
        this.products = products;
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

    public Double getLowestPrice() {
        return lowestPrice;
    }

    public List<MatchingProductResponse> getProducts() {
        return products;
    }
}
