package com.localmarket.localmarket.dto;

import java.util.List;

public class AssistantResponse {

    private final String response;
    private final List<ProductResponse> products;
    private final List<ShopSearchResponse> shops;

    public AssistantResponse(String response) {
        this(response, List.of(), List.of());
    }

    public AssistantResponse(
        String response,
        List<ProductResponse> products,
        List<ShopSearchResponse> shops
    ) {
        this.response = response;
        this.products = products;
        this.shops = shops;
    }

    public String getResponse() {
        return response;
    }

    public List<ProductResponse> getProducts() {
        return products;
    }

    public List<ShopSearchResponse> getShops() {
        return shops;
    }
}
