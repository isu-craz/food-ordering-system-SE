package com.spiceavenue;

import com.spiceavenue.auth.entity.User;
import com.spiceavenue.auth.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@SpringBootApplication
public class SpiceAvenueApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpiceAvenueApplication.class, args);
        System.out.println("\n=======================================================");
        System.out.println(" 🌶️  SPICE AVENUE BACKEND SERVER STARTED SUCCESSFULLY ");
        System.out.println(" 👉 API Documentation (Swagger): http://localhost:8080/swagger-ui.html");
        System.out.println("=======================================================\n");
    }

    @Bean
    CommandLineRunner syncSeedPasswords(UserRepository userRepository, PasswordEncoder passwordEncoder, JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE complaints MODIFY COLUMN status ENUM('PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED') NOT NULL DEFAULT 'PENDING'");
            } catch (Exception ignored) {
            }

            String defaultHash = passwordEncoder.encode("Password123!");
            List<User> users = userRepository.findAll();
            for (User user : users) {
                user.setPassword(defaultHash);
                userRepository.save(user);
            }
            System.out.println("🔑 Successfully synchronized 'Password123!' for all " + users.size() + " user accounts.");
        };
    }
}
