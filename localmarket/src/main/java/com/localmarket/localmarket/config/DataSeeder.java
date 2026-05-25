package com.localmarket.localmarket.config;

import com.localmarket.localmarket.model.Product;
import com.localmarket.localmarket.model.User;
import com.localmarket.localmarket.repository.ProductRepository;
import com.localmarket.localmarket.repository.UserRepository;
import java.util.List;
import java.util.Map;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {
    @Bean
    CommandLineRunner seedMarketplace(
        UserRepository userRepository,
        ProductRepository productRepository,
        PasswordEncoder passwordEncoder
    ) {
        return args -> {
            if (userRepository.count() > 0) {
                return;
            }

            User spiceRoute = userRepository.save(new User(
                "Aarav Sharma",
                "spiceroute@localmarket.dev",
                passwordEncoder.encode("demo12345"),
                "Spice Route Kitchen",
                "JM Road, Pune",
                18.5207,
                73.8567
            ));

            User bakery = userRepository.save(new User(
                "Neha Joshi",
                "crumbsquare@localmarket.dev",
                passwordEncoder.encode("demo12345"),
                "Crumb Square Bakery",
                "Koregaon Park, Pune",
                18.5362,
                73.8945
            ));

            User grocery = userRepository.save(new User(
                "Imran Shaikh",
                "greenbasket@localmarket.dev",
                passwordEncoder.encode("demo12345"),
                "Green Basket Mart",
                "Baner, Pune",
                18.5590,
                73.7868
            ));

            productRepository.save(new Product(
                "Margherita Pizza",
                249.0,
                299.0,
                "INR",
                "Stone-baked pizza with tomato, mozzarella, and basil.",
                "Pizza",
                "food",
                Map.of("size", "medium", "vegetarian", true),
                List.of(
                    "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=900&q=80"
                ),
                spiceRoute.getId()
            ));

            productRepository.save(new Product(
                "Veg Burger",
                159.0,
                189.0,
                "INR",
                "Crisp veg patty with house sauce and lettuce.",
                "Burger",
                "food",
                Map.of("portion", "single", "vegetarian", true),
                List.of(
                    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80"
                ),
                spiceRoute.getId()
            ));

            productRepository.save(new Product(
                "Butter Croissant",
                89.0,
                null,
                "INR",
                "Flaky layered croissant baked fresh each morning.",
                "Bakery",
                "baked-good",
                Map.of("freshlyBaked", true),
                List.of(
                    "https://images.unsplash.com/photo-1555507036-ab794f4afe5b?auto=format&fit=crop&w=900&q=80"
                ),
                bakery.getId()
            ));

            productRepository.save(new Product(
                "Cold Coffee",
                120.0,
                140.0,
                "INR",
                "Chilled coffee with vanilla cream foam.",
                "Beverage",
                "drink",
                Map.of("servedCold", true, "size", "regular"),
                List.of(
                    "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80"
                ),
                bakery.getId()
            ));

            productRepository.save(new Product(
                "Organic Tomatoes",
                55.0,
                65.0,
                "INR",
                "Locally sourced tomatoes from nearby farms.",
                "Groceries",
                "produce",
                Map.of("unit", "kg", "organic", true),
                List.of(
                    "https://images.unsplash.com/photo-1546470427-e5e6d2b6d1a4?auto=format&fit=crop&w=900&q=80"
                ),
                grocery.getId()
            ));

            productRepository.save(new Product(
                "Paneer Tikka Wrap",
                199.0,
                229.0,
                "INR",
                "Paneer tikka wrap with mint chutney and onions.",
                "Wraps",
                "food",
                Map.of("spiceLevel", "medium", "vegetarian", true),
                List.of(
                    "https://images.unsplash.com/photo-1530469912745-a215c6b256ea?auto=format&fit=crop&w=900&q=80"
                ),
                grocery.getId()
            ));
        };
    }
}
