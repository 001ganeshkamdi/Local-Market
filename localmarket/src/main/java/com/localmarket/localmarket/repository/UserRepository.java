package com.localmarket.localmarket.repository;

import com.localmarket.localmarket.model.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, String> {
    List<User> findAllByOrderByShopNameAsc();

    Optional<User> findByEmailIgnoreCase(String email);
}
