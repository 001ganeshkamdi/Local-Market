package com.localmarket.localmarket.service;

import com.localmarket.localmarket.dto.AssistantRequest;
import com.localmarket.localmarket.dto.AssistantResponse;
import com.localmarket.localmarket.dto.MatchingProductResponse;
import com.localmarket.localmarket.dto.ProductResponse;
import com.localmarket.localmarket.dto.ShopSearchResponse;
import com.localmarket.localmarket.model.Product;
import com.localmarket.localmarket.model.User;
import com.localmarket.localmarket.repository.ProductRepository;
import com.localmarket.localmarket.repository.UserRepository;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class MarketplaceAssistantService {

    private static final double DEFAULT_RADIUS_KM = 5.0;
    private static final int MAX_PRODUCTS = 8;
    private static final int MAX_SHOPS = 6;
    private static final Pattern PRICE_PATTERN = Pattern.compile(
        "(?:under|below|less than|upto|up to)\\s*(?:rs\\.?|inr|₹)?\\s*(\\d+(?:\\.\\d+)?)|" +
        "(?:rs\\.?|inr|₹)\\s*(\\d+(?:\\.\\d+)?)"
    );
    private static final Pattern RADIUS_PATTERN = Pattern.compile(
        "(?:within|inside|in)\\s*(\\d+(?:\\.\\d+)?)\\s*(?:km|kilometer|kilometers|kms)"
    );
    private static final Set<String> STOP_WORDS = Set.of(
        "a",
        "an",
        "and",
        "are",
        "at",
        "best",
        "cheap",
        "cheapest",
        "find",
        "for",
        "has",
        "have",
        "in",
        "is",
        "me",
        "near",
        "nearby",
        "nearest",
        "product",
        "products",
        "shop",
        "shops",
        "show",
        "store",
        "stores",
        "the",
        "to",
        "trending",
        "under",
        "which",
        "with",
        "within"
    );
    private static final Map<String, List<String>> CATEGORY_KEYWORDS = Map.of(
        "Electronics",
        List.of("electronics", "gadget", "gadgets", "keyboard", "headphone", "headphones", "mouse", "charger"),
        "Toys",
        List.of("toy", "toys", "teddy", "bear", "doll", "game"),
        "Stationery",
        List.of("stationery", "notebook", "notebooks", "pen", "pencil", "paper"),
        "Groceries",
        List.of("grocery", "groceries", "food", "snack", "snacks"),
        "Fashion",
        List.of("fashion", "shirt", "shoe", "shoes", "dress", "clothes")
    );

    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public MarketplaceAssistantService(
        ProductRepository productRepository,
        UserRepository userRepository
    ) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public AssistantResponse chat(AssistantRequest request) {
        QueryIntent intent = parseIntent(request);

        if (intent.message().isBlank()) {
            return new AssistantResponse(
                "Tell me what you want to find, for example: cheapest headphones near me or notebooks under ₹100.",
                List.of(),
                List.of()
            );
        }

        List<Product> candidates = findCandidateProducts(intent);
        Map<String, User> shopsById = getUsersById(candidates);

        List<ProductMatch> matches = candidates
            .stream()
            .map(product -> toProductMatch(product, shopsById.get(product.getUserId()), intent))
            .filter(match -> match.score() > 0 || intent.showTrending())
            .filter(match -> intent.maxPrice().isEmpty() || match.product().getPrice() <= intent.maxPrice().get())
            .filter(match -> !intent.hasRadiusFilter() || isWithinRadius(match.distanceKm(), intent.radiusKm()))
            .sorted(productComparator(intent))
            .toList();

        if (matches.isEmpty()) {
            return new AssistantResponse(
                buildEmptyResponse(intent),
                List.of(),
                List.of()
            );
        }

        List<ProductResponse> products = matches
            .stream()
            .limit(MAX_PRODUCTS)
            .map(ProductMatch::productResponse)
            .toList();

        List<ShopSearchResponse> shops = buildShopResults(matches)
            .stream()
            .limit(MAX_SHOPS)
            .toList();

        return new AssistantResponse(
            buildResponseText(intent, matches, shops),
            products,
            shops
        );
    }

    private QueryIntent parseIntent(AssistantRequest request) {
        String rawMessage = request != null && request.getMessage() != null
            ? request.getMessage().trim()
            : "";
        String message = rawMessage.toLowerCase(Locale.ROOT);
        Optional<Double> maxPrice = extractFirstNumber(PRICE_PATTERN, message);
        Optional<Double> requestedRadius = extractFirstNumber(RADIUS_PATTERN, message);
        Double radiusKm = firstPositive(request != null ? request.getRadiusKm() : null)
            .orElse(requestedRadius.orElse(DEFAULT_RADIUS_KM));

        List<String> tokens = tokenize(message);
        Optional<String> category = detectCategory(message, tokens);
        List<String> searchTerms = tokens
            .stream()
            .filter(token -> !STOP_WORDS.contains(token))
            .filter(token -> !token.matches("\\d+(?:\\.\\d+)?"))
            .toList();

        boolean cheapest = containsAny(message, "cheap", "cheapest", "lowest price", "budget", "affordable");
        boolean nearest = containsAny(message, "near me", "nearby", "nearest", "within");
        boolean shopsOnly = containsAny(message, "shop", "shops", "store", "stores");
        boolean showTrending = containsAny(message, "trending", "popular", "recommended");

        return new QueryIntent(
            rawMessage,
            message,
            searchTerms,
            category,
            maxPrice,
            request != null ? request.getLatitude() : null,
            request != null ? request.getLongitude() : null,
            radiusKm,
            requestedRadius.isPresent() || (request != null && request.getRadiusKm() != null),
            cheapest,
            nearest,
            shopsOnly,
            showTrending
        );
    }

    private List<Product> findCandidateProducts(QueryIntent intent) {
        if (intent.category().isPresent() && intent.maxPrice().isPresent()) {
            List<Product> products =
                productRepository.findByCategoryContainingIgnoreCaseAndPriceLessThanEqual(
                    intent.category().get(),
                    intent.maxPrice().get()
                );
            if (!products.isEmpty()) {
                return products;
            }
        }

        if (!intent.searchTerms().isEmpty()) {
            String query = String.join(" ", intent.searchTerms());
            List<Product> products =
                productRepository.findByNameContainingIgnoreCaseOrCategoryContainingIgnoreCase(
                    query,
                    query
                );
            if (!products.isEmpty()) {
                return products;
            }
        }

        if (intent.category().isPresent()) {
            List<Product> products = productRepository.findByCategoryContainingIgnoreCase(
                intent.category().get()
            );
            if (!products.isEmpty()) {
                return products;
            }
        }

        if (intent.maxPrice().isPresent()) {
            return productRepository.findByPriceLessThanEqual(intent.maxPrice().get());
        }

        return productRepository.findAllByOrderByNameAsc();
    }

    private ProductMatch toProductMatch(
        Product product,
        User shop,
        QueryIntent intent
    ) {
        Double distanceKm = calculateDistance(
            intent.latitude(),
            intent.longitude(),
            shop
        );
        int score = scoreProduct(product, shop, intent);
        ProductResponse productResponse = toProductResponse(product, shop, distanceKm);
        return new ProductMatch(product, shop, distanceKm, score, productResponse);
    }

    private int scoreProduct(Product product, User shop, QueryIntent intent) {
        int score = 0;
        String searchable = String.join(
            " ",
            safe(product.getName()),
            safe(product.getCategory()),
            safe(product.getType()),
            safe(product.getDescription()),
            shop != null ? safe(shop.getShopName()) : ""
        ).toLowerCase(Locale.ROOT);

        if (intent.category().isPresent() && categoryMatches(intent.category().get(), searchable)) {
            score += 4;
        }

        for (String term : intent.searchTerms()) {
            if (searchable.contains(term)) {
                score += 3;
            } else if (fuzzyContains(searchable, term)) {
                score += 1;
            }
        }

        if (intent.maxPrice().isPresent() && product.getPrice() <= intent.maxPrice().get()) {
            score += 2;
        }

        if (intent.showTrending()) {
            score += 1;
        }

        return score;
    }

    private Comparator<ProductMatch> productComparator(QueryIntent intent) {
        Comparator<ProductMatch> comparator = Comparator.comparingInt(ProductMatch::score)
            .reversed();

        if (intent.cheapest()) {
            comparator = comparator.thenComparing(match -> match.product().getPrice());
        }

        if (intent.nearest() || intent.hasRadiusFilter()) {
            comparator = comparator.thenComparing(
                ProductMatch::distanceKm,
                Comparator.nullsLast(Double::compareTo)
            );
        }

        return comparator
            .thenComparing(match -> match.product().getPrice())
            .thenComparing(match -> safe(match.product().getName()), String.CASE_INSENSITIVE_ORDER);
    }

    private List<ShopSearchResponse> buildShopResults(List<ProductMatch> matches) {
        Map<String, List<ProductMatch>> grouped = matches
            .stream()
            .filter(match -> match.shop() != null)
            .collect(
                Collectors.groupingBy(
                    match -> match.shop().getId(),
                    LinkedHashMap::new,
                    Collectors.toList()
                )
            );

        return grouped
            .values()
            .stream()
            .map(this::toShopSearchResponse)
            .filter(Objects::nonNull)
            .sorted(
                Comparator.comparing(
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
                    )
            )
            .toList();
    }

    private ShopSearchResponse toShopSearchResponse(List<ProductMatch> matches) {
        if (matches.isEmpty() || matches.get(0).shop() == null) {
            return null;
        }

        User shop = matches.get(0).shop();
        List<MatchingProductResponse> products = matches
            .stream()
            .sorted(
                Comparator.comparing((ProductMatch match) -> match.product().getPrice())
                    .thenComparing(match -> safe(match.product().getName()), String.CASE_INSENSITIVE_ORDER)
            )
            .map(match -> toMatchingProductResponse(match.product()))
            .toList();
        Double lowestPrice = products
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
            matches.get(0).distanceKm(),
            lowestPrice,
            products
        );
    }

    private String buildResponseText(
        QueryIntent intent,
        List<ProductMatch> matches,
        List<ShopSearchResponse> shops
    ) {
        ProductMatch best = matches.get(0);
        StringBuilder response = new StringBuilder();
        response
            .append("I found ")
            .append(matches.size())
            .append(matches.size() == 1 ? " matching product" : " matching products");

        if (!shops.isEmpty()) {
            response
                .append(" across ")
                .append(shops.size())
                .append(shops.size() == 1 ? " shop" : " shops");
        }

        intent.category().ifPresent(category ->
            response.append(" in ").append(category.toLowerCase(Locale.ROOT))
        );

        if (intent.maxPrice().isPresent()) {
            response.append(" under ₹").append(formatPrice(intent.maxPrice().get()));
        }

        response.append(". ");

        if (intent.cheapest()) {
            response.append("Cheapest starts at ₹").append(formatPrice(best.product().getPrice()));
        } else {
            response.append("Best match is ").append(best.product().getName()).append(" at ₹").append(formatPrice(best.product().getPrice()));
        }

        if (best.shop() != null) {
            response.append(" at ").append(best.shop().getShopName());
        }

        if (best.distanceKm() != null) {
            response.append(", ").append(best.distanceKm()).append(" km away");
        } else if (intent.nearest()) {
            response.append(". Add your location to rank the nearest shops");
        }

        response.append(".");
        return response.toString();
    }

    private String buildEmptyResponse(QueryIntent intent) {
        String target = !intent.searchTerms().isEmpty()
            ? String.join(" ", intent.searchTerms())
            : intent.category().orElse("that");
        if (intent.hasRadiusFilter()) {
            return "I couldn't find " + target + " within " + intent.radiusKm() + " km. Try a broader radius or a simpler product name.";
        }
        return "I couldn't find matching nearby results for " + target + ". Try another product name, category, or price range.";
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

    private Optional<Double> extractFirstNumber(Pattern pattern, String message) {
        Matcher matcher = pattern.matcher(message);
        if (!matcher.find()) {
            return Optional.empty();
        }

        for (int group = 1; group <= matcher.groupCount(); group++) {
            String value = matcher.group(group);
            if (value != null) {
                return firstPositive(Double.valueOf(value));
            }
        }

        return Optional.empty();
    }

    private Optional<Double> firstPositive(Double value) {
        return value != null && value > 0 ? Optional.of(value) : Optional.empty();
    }

    private Optional<String> detectCategory(String message, List<String> tokens) {
        return CATEGORY_KEYWORDS
            .entrySet()
            .stream()
            .filter(entry ->
                entry
                    .getValue()
                    .stream()
                    .anyMatch(keyword -> message.contains(keyword) || tokens.contains(keyword))
            )
            .map(Map.Entry::getKey)
            .findFirst();
    }

    private boolean categoryMatches(String category, String value) {
        String normalizedValue = value.toLowerCase(Locale.ROOT);
        if (normalizedValue.contains(category.toLowerCase(Locale.ROOT))) {
            return true;
        }

        return CATEGORY_KEYWORDS
            .getOrDefault(category, List.of())
            .stream()
            .anyMatch(normalizedValue::contains);
    }

    private List<String> tokenize(String message) {
        Matcher matcher = Pattern.compile("[a-z0-9]+").matcher(message);
        List<String> tokens = new ArrayList<>();
        while (matcher.find()) {
            tokens.add(matcher.group());
        }
        return tokens;
    }

    private boolean containsAny(String value, String... needles) {
        for (String needle : needles) {
            if (value.contains(needle)) {
                return true;
            }
        }
        return false;
    }

    private boolean fuzzyContains(String searchable, String term) {
        if (term.length() < 4) {
            return false;
        }

        return tokenize(searchable)
            .stream()
            .anyMatch(token -> levenshteinDistance(token, term) <= 2);
    }

    private int levenshteinDistance(String left, String right) {
        int[] costs = new int[right.length() + 1];
        for (int index = 0; index <= right.length(); index++) {
            costs[index] = index;
        }

        for (int leftIndex = 1; leftIndex <= left.length(); leftIndex++) {
            int previous = costs[0];
            costs[0] = leftIndex;

            for (int rightIndex = 1; rightIndex <= right.length(); rightIndex++) {
                int current = costs[rightIndex];
                int substitutionCost = left.charAt(leftIndex - 1) == right.charAt(rightIndex - 1)
                    ? previous
                    : previous + 1;
                costs[rightIndex] = Math.min(
                    Math.min(costs[rightIndex] + 1, costs[rightIndex - 1] + 1),
                    substitutionCost
                );
                previous = current;
            }
        }

        return costs[right.length()];
    }

    private boolean isWithinRadius(Double distanceKm, double radiusKm) {
        return distanceKm == null || distanceKm <= radiusKm;
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

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private String formatPrice(double value) {
        if (value == Math.rint(value)) {
            return String.valueOf((long) value);
        }
        return String.format(Locale.ROOT, "%.2f", value);
    }

    private record QueryIntent(
        String rawMessage,
        String message,
        List<String> searchTerms,
        Optional<String> category,
        Optional<Double> maxPrice,
        Double latitude,
        Double longitude,
        double radiusKm,
        boolean hasRadiusFilter,
        boolean cheapest,
        boolean nearest,
        boolean shopsOnly,
        boolean showTrending
    ) {}

    private record ProductMatch(
        Product product,
        User shop,
        Double distanceKm,
        int score,
        ProductResponse productResponse
    ) {}
}
