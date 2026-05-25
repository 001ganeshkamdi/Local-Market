package com.localmarket.localmarket.dto;

public class ShopkeeperLoginResponse {
    private final String role;
    private final String id;
    private final String ownerName;
    private final String email;
    private final String shopName;
    private final String shopLocation;
    private final Double latitude;
    private final Double longitude;

    public ShopkeeperLoginResponse(
        String role,
        String id,
        String ownerName,
        String email,
        String shopName,
        String shopLocation,
        Double latitude,
        Double longitude
    ) {
        this.role = role;
        this.id = id;
        this.ownerName = ownerName;
        this.email = email;
        this.shopName = shopName;
        this.shopLocation = shopLocation;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public String getRole() {
        return role;
    }

    public String getId() {
        return id;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public String getEmail() {
        return email;
    }

    public String getShopName() {
        return shopName;
    }

    public String getShopLocation() {
        return shopLocation;
    }

    public Double getLatitude() {
        return latitude;
    }

    public Double getLongitude() {
        return longitude;
    }
}
