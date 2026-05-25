package com.localmarket.localmarket.repository;

import com.localmarket.localmarket.model.Product;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ProductRepository extends MongoRepository<Product, String> {
    List<Product> findAllByOrderByNameAsc();

    List<Product> findByNameContainingIgnoreCase(String name);

    List<Product> findByCategoryContainingIgnoreCase(String category);

    List<Product> findByPriceLessThanEqual(double price);

    List<Product> findByCategoryContainingIgnoreCaseAndPriceLessThanEqual(
        String category,
        double price
    );

    List<Product> findByNameContainingIgnoreCaseOrCategoryContainingIgnoreCase(String name, String category);

    List<Product> findByUserIdOrderByNameAsc(String userId);
}
