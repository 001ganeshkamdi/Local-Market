package com.localmarket.localmarket.controller;

import com.localmarket.localmarket.dto.MatchingProductResponse;
import com.localmarket.localmarket.dto.ProductRequest;
import com.localmarket.localmarket.dto.ProductResponse;
import com.localmarket.localmarket.dto.ShopRequest;
import com.localmarket.localmarket.dto.ShopResponse;
import com.localmarket.localmarket.dto.ShopSearchResponse;
import com.localmarket.localmarket.dto.ShopkeeperLoginRequest;
import com.localmarket.localmarket.dto.ShopkeeperLoginResponse;
import com.localmarket.localmarket.model.Product;
import com.localmarket.localmarket.model.User;
import com.localmarket.localmarket.repository.ProductRepository;
import com.localmarket.localmarket.repository.UserRepository;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = { "http://localhost:5173", "http://127.0.0.1:5173" })
public class MarketplaceController {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    public MarketplaceController(
        UserRepository userRepository,
        ProductRepository productRepository,
        PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/health")
    public String health() {
        return "localmarket-ok";
    }

    @GetMapping("/shops")
    public List<ShopResponse> getAllShops() {
        return userRepository
            .findAllByOrderByShopNameAsc()
            .stream()
            .map(this::toShopResponse)
            .toList();
    }

    @GetMapping("/shops/{shopId}")
    public ShopResponse getShop(@PathVariable String shopId) {
        User shop = userRepository
            .findById(shopId)
            .orElseThrow(() ->
                new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Shop not found"
                )
            );

        return toShopResponse(shop);
    }

    @PostMapping("/shops")
    @ResponseStatus(HttpStatus.CREATED)
    public ShopResponse createShop(@RequestBody ShopRequest request) {
        String email = normalizeEmail(request.getEmail());
        String password =
            request.getPassword() == null ? "" : request.getPassword().trim();

        if (
            request.getOwnerName() == null || request.getOwnerName().isBlank()
        ) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Owner name is required"
            );
        }

        if (request.getShopName() == null || request.getShopName().isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Shop name is required"
            );
        }

        if (
            request.getShopLocation() == null ||
            request.getShopLocation().isBlank()
        ) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Shop location is required"
            );
        }

        if (email == null) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Email is required"
            );
        }

        if (password.length() < 8) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Password must be at least 8 characters"
            );
        }

        if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "A shop owner with this email already exists"
            );
        }

        User user = new User(
            request.getOwnerName().trim(),
            email,
            passwordEncoder.encode(password),
            request.getShopName().trim(),
            request.getShopLocation().trim(),
            request.getLatitude(),
            request.getLongitude()
        );

        return toShopResponse(userRepository.save(user));
    }

    @PostMapping("/auth/shopkeeper/login")
    public ShopkeeperLoginResponse loginShopkeeper(
        @RequestBody ShopkeeperLoginRequest request
    ) {
        String email = normalizeEmail(request.getEmail());
        String password =
            request.getPassword() == null ? "" : request.getPassword();

        if (email == null || password.isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Email and password are required"
            );
        }

        User user = userRepository
            .findByEmailIgnoreCase(email)
            .orElseThrow(() ->
                new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid shopkeeper credentials"
                )
            );

        if (
            user.getPasswordHash() == null ||
            !passwordEncoder.matches(password, user.getPasswordHash())
        ) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Invalid shopkeeper credentials"
            );
        }

        return new ShopkeeperLoginResponse(
            "shopkeeper",
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getShopName(),
            user.getShopLocation(),
            user.getLatitude(),
            user.getLongitude()
        );
    }

    @GetMapping("/products")
    public List<ProductResponse> getAllProducts() {
        List<Product> products = productRepository.findAllByOrderByNameAsc();
        Map<String, User> shopsById = getUsersById(products);
        return products
            .stream()
            .map(product ->
                toProductResponse(
                    product,
                    shopsById.get(product.getUserId()),
                    null
                )
            )
            .toList();
    }

    @GetMapping("/shops/{shopId}/products")
    public List<ProductResponse> getProductsByShop(
        @PathVariable String shopId
    ) {
        User shop = userRepository
            .findById(shopId)
            .orElseThrow(() ->
                new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Shop not found"
                )
            );

        return productRepository
            .findByUserIdOrderByNameAsc(shopId)
            .stream()
            .map(product -> toProductResponse(product, shop, null))
            .toList();
    }

    @PostMapping("/products")
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse createProduct(@RequestBody ProductRequest request) {
        Product product = productRepository.save(buildProduct(request, null));
        User shop = userRepository
            .findById(product.getUserId())
            .orElseThrow(() ->
                new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Shop owner not found"
                )
            );
        return toProductResponse(product, shop, null);
    }

    @PutMapping("/products/{productId}")
    public ProductResponse updateProduct(
        @PathVariable String productId,
        @RequestBody ProductRequest request
    ) {
        Product existingProduct = productRepository
            .findById(productId)
            .orElseThrow(() ->
                new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Product not found"
                )
            );

        Product updatedProduct = productRepository.save(
            buildProduct(request, existingProduct)
        );
        User shop = userRepository
            .findById(updatedProduct.getUserId())
            .orElseThrow(() ->
                new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Shop owner not found"
                )
            );
        return toProductResponse(updatedProduct, shop, null);
    }

    @DeleteMapping("/products/{productId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(@PathVariable String productId) {
        Product existingProduct = productRepository
            .findById(productId)
            .orElseThrow(() ->
                new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Product not found"
                )
            );

        productRepository.delete(existingProduct);
    }

    @GetMapping("/shops/search")
    public List<ShopSearchResponse> searchShops(
        @RequestParam String query,
        @RequestParam(required = false) Double latitude,
        @RequestParam(required = false) Double longitude
    ) {
        List<Product> matches =
            productRepository.findByNameContainingIgnoreCaseOrCategoryContainingIgnoreCase(
                query,
                query
            );

        Map<String, User> shopsById = getUsersById(matches);
        Map<String, List<Product>> groupedProducts = matches
            .stream()
            .filter(
                product ->
                    product.getUserId() != null &&
                    shopsById.containsKey(product.getUserId())
            )
            .collect(
                Collectors.groupingBy(
                    Product::getUserId,
                    LinkedHashMap::new,
                    Collectors.toList()
                )
            );

        Comparator<ShopSearchResponse> comparator = Comparator.comparing(
            ShopSearchResponse::getDistanceKm,
            Comparator.nullsLast(Double::compareTo)
        )
            .thenComparing(
                ShopSearchResponse::getLowestPrice,
                Comparator.nullsLast(Double::compareTo)
            )
            .thenComparing(
                ShopSearchResponse::getShopName,
                String.CASE_INSENSITIVE_ORDER
            );

        return groupedProducts
            .entrySet()
            .stream()
            .map(entry ->
                toShopSearchResponse(
                    entry.getValue(),
                    shopsById.get(entry.getKey()),
                    latitude,
                    longitude
                )
            )
            .filter(Objects::nonNull)
            .sorted(comparator)
            .toList();
    }

    @GetMapping("/products/search")
    public List<ProductResponse> searchProducts(
        @RequestParam String query,
        @RequestParam(required = false) Double latitude,
        @RequestParam(required = false) Double longitude
    ) {
        List<Product> products =
            productRepository.findByNameContainingIgnoreCaseOrCategoryContainingIgnoreCase(
                query,
                query
            );
        Map<String, User> shopsById = getUsersById(products);

        return products
            .stream()
            .map(product -> {
                User shop = shopsById.get(product.getUserId());
                return toProductResponse(
                    product,
                    shop,
                    calculateDistance(latitude, longitude, shop)
                );
            })
            .sorted(
                Comparator.comparing(
                    ProductResponse::getDistanceKm,
                    Comparator.nullsLast(Double::compareTo)
                )
                    .thenComparing(ProductResponse::getPrice)
                    .thenComparing(
                        ProductResponse::getShopName,
                        String.CASE_INSENSITIVE_ORDER
                    )
            )
            .toList();
    }

    private ShopResponse toShopResponse(User user) {
        return new ShopResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getShopName(),
            user.getShopLocation(),
            user.getLatitude(),
            user.getLongitude()
        );
    }

    private ProductResponse toProductResponse(
        Product product,
        User shop,
        Double distanceKm
    ) {
        return new ProductResponse(
            product.getId(),
            product.getName(),
            product.getPrice(),
            product.getOriginalPrice(),
            product.getCurrency(),
            product.getDescription(),
            product.getCategory(),
            product.getUserId(),
            product.getType(),
            product.getAttributes(),
            product.getImages(),
            shop != null ? shop.getId() : null,
            shop != null ? shop.getShopName() : "Unknown shop",
            shop != null ? shop.getShopLocation() : null,
            shop != null ? shop.getLatitude() : null,
            shop != null ? shop.getLongitude() : null,
            distanceKm
        );
    }

    private ShopSearchResponse toShopSearchResponse(
        List<Product> productsByShop,
        User shop,
        Double latitude,
        Double longitude
    ) {
        if (shop == null || productsByShop.isEmpty()) {
            return null;
        }

        Double distanceKm = calculateDistance(latitude, longitude, shop);
        List<MatchingProductResponse> matchingProducts = new ArrayList<>(
            productsByShop
                .stream()
                .sorted(
                    Comparator.comparing(Product::getPrice).thenComparing(
                        Product::getName,
                        String.CASE_INSENSITIVE_ORDER
                    )
                )
                .map(this::toMatchingProductResponse)
                .toList()
        );

        Double lowestPrice = matchingProducts
            .stream()
            .map(MatchingProductResponse::getPrice)
            .min(Double::compareTo)
            .orElse(null);

        return new ShopSearchResponse(
            shop.getId(),
            shop.getShopName(),
            shop.getShopLocation(),
            shop.getLatitude(),
            shop.getLongitude(),
            distanceKm,
            lowestPrice,
            matchingProducts
        );
    }

    private MatchingProductResponse toMatchingProductResponse(Product product) {
        return new MatchingProductResponse(
            product.getId(),
            product.getName(),
            product.getPrice(),
            product.getOriginalPrice(),
            product.getCurrency(),
            product.getDescription(),
            product.getCategory(),
            product.getType(),
            product.getAttributes(),
            product.getImages()
        );
    }

    private Product buildProduct(
        ProductRequest request,
        Product existingProduct
    ) {
        if (request.getUserId() == null || request.getUserId().isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Shop owner is required"
            );
        }

        userRepository
            .findById(request.getUserId())
            .orElseThrow(() ->
                new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Shop owner not found"
                )
            );

        Product product =
            existingProduct != null ? existingProduct : new Product();
        product.setName(request.getName());
        product.setPrice(request.getPrice());
        product.setOriginalPrice(request.getOriginalPrice());
        product.setCurrency(request.getCurrency());
        product.setDescription(request.getDescription());
        product.setCategory(request.getCategory());
        product.setType(request.getType());
        product.setAttributes(request.getAttributes());
        product.setImages(request.getImages());
        product.setUserId(request.getUserId());
        return product;
    }

    private Map<String, User> getUsersById(Collection<Product> products) {
        Set<String> userIds = products
            .stream()
            .map(Product::getUserId)
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());

        if (userIds.isEmpty()) {
            return Map.of();
        }

        return userRepository
            .findAllById(userIds)
            .stream()
            .collect(Collectors.toMap(User::getId, user -> user));
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            return null;
        }

        return email.trim().toLowerCase();
    }

    private Double calculateDistance(
        Double latitude,
        Double longitude,
        User shop
    ) {
        if (
            latitude == null ||
            longitude == null ||
            shop == null ||
            shop.getLatitude() == null ||
            shop.getLongitude() == null
        ) {
            return null;
        }

        double earthRadiusKm = 6371.0;
        double latDistance = Math.toRadians(shop.getLatitude() - latitude);
        double lonDistance = Math.toRadians(shop.getLongitude() - longitude);
        double startLat = Math.toRadians(latitude);
        double endLat = Math.toRadians(shop.getLatitude());

        double haversine =
            Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
            Math.sin(lonDistance / 2) *
            Math.sin(lonDistance / 2) *
            Math.cos(startLat) *
            Math.cos(endLat);
        double angularDistance =
            2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
        double rawDistance = earthRadiusKm * angularDistance;

        return Math.round(rawDistance * 10.0) / 10.0;
    }
}
