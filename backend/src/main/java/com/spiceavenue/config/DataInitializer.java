package com.spiceavenue.config;

import com.spiceavenue.auth.entity.User;
import com.spiceavenue.auth.repository.UserRepository;
import com.spiceavenue.branch.entity.Branch;
import com.spiceavenue.branch.entity.DeliveryArea;
import com.spiceavenue.branch.repository.BranchRepository;
import com.spiceavenue.common.enums.EntityStatus;
import com.spiceavenue.common.enums.RiderStatus;
import com.spiceavenue.common.enums.UserRole;
import com.spiceavenue.menu.entity.Category;
import com.spiceavenue.menu.entity.MenuItem;
import com.spiceavenue.menu.repository.CategoryRepository;
import com.spiceavenue.menu.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
    private final CategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${spiceavenue.seed-data.enabled:true}")
    private boolean seedDataEnabled;

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedDataEnabled) {
            log.info("Database Seeding is DISABLED (spiceavenue.seed-data.enabled=false). Skipping initial seed data.");
            return;
        }

        log.info("Database Seeding is ENABLED (spiceavenue.seed-data.enabled=true). Checking initial data...");

        // 1. Seed System Users if table is empty
        if (userRepository.count() == 0) {
            log.info("Seeding default user accounts into MySQL database...");
            String defaultPassword = passwordEncoder.encode("Password123!");

            List<User> initialUsers = List.of(
                    User.builder()
                            .fullName("System Admin")
                            .email("admin@spiceavenue.com")
                            .password(defaultPassword)
                            .phoneNumber("0770000001")
                            .role(UserRole.ADMIN)
                            .status(EntityStatus.ACTIVE)
                            .riderStatus(RiderStatus.OFFLINE)
                            .build(),
                    User.builder()
                            .fullName("Operations Manager")
                            .email("ops@spiceavenue.com")
                            .password(defaultPassword)
                            .phoneNumber("0770000002")
                            .role(UserRole.OPS_MANAGER)
                            .status(EntityStatus.ACTIVE)
                            .riderStatus(RiderStatus.OFFLINE)
                            .build(),
                    User.builder()
                            .fullName("Kasun Perera")
                            .email("manager.colombo@spiceavenue.com")
                            .password(defaultPassword)
                            .phoneNumber("0770000003")
                            .role(UserRole.BRANCH_MANAGER)
                            .status(EntityStatus.ACTIVE)
                            .riderStatus(RiderStatus.OFFLINE)
                            .build(),
                    User.builder()
                            .fullName("Dinesh Silva")
                            .email("manager.negombo@spiceavenue.com")
                            .password(defaultPassword)
                            .phoneNumber("0770000004")
                            .role(UserRole.BRANCH_MANAGER)
                            .status(EntityStatus.ACTIVE)
                            .riderStatus(RiderStatus.OFFLINE)
                            .build(),
                    User.builder()
                            .fullName("Nuwan Fernando")
                            .email("manager.kandy@spiceavenue.com")
                            .password(defaultPassword)
                            .phoneNumber("0770000005")
                            .role(UserRole.BRANCH_MANAGER)
                            .status(EntityStatus.ACTIVE)
                            .riderStatus(RiderStatus.OFFLINE)
                            .build(),
                    User.builder()
                            .fullName("Priyantha Bandara")
                            .email("manager.galle@spiceavenue.com")
                            .password(defaultPassword)
                            .phoneNumber("0770000006")
                            .role(UserRole.BRANCH_MANAGER)
                            .status(EntityStatus.ACTIVE)
                            .riderStatus(RiderStatus.OFFLINE)
                            .build(),
                    User.builder()
                            .fullName("Kamal Fernando")
                            .email("rider.kamal@spiceavenue.com")
                            .password(defaultPassword)
                            .phoneNumber("0770000007")
                            .role(UserRole.RIDER)
                            .status(EntityStatus.ACTIVE)
                            .riderStatus(RiderStatus.AVAILABLE)
                            .build(),
                    User.builder()
                            .fullName("Nimal Bandara")
                            .email("rider.nimal@spiceavenue.com")
                            .password(defaultPassword)
                            .phoneNumber("0770000008")
                            .role(UserRole.RIDER)
                            .status(EntityStatus.ACTIVE)
                            .riderStatus(RiderStatus.BUSY)
                            .build(),
                    User.builder()
                            .fullName("Sarah Jayasinghe")
                            .email("supervisor@spiceavenue.com")
                            .password(defaultPassword)
                            .phoneNumber("0770000009")
                            .role(UserRole.SUPERVISOR)
                            .status(EntityStatus.ACTIVE)
                            .riderStatus(RiderStatus.OFFLINE)
                            .build(),
                    User.builder()
                            .fullName("John Doe")
                            .email("customer.john@gmail.com")
                            .password(defaultPassword)
                            .phoneNumber("0771234567")
                            .role(UserRole.CUSTOMER)
                            .status(EntityStatus.ACTIVE)
                            .riderStatus(RiderStatus.OFFLINE)
                            .build()
            );

            userRepository.saveAll(initialUsers);
            log.info("Successfully seeded {} user accounts into MySQL.", initialUsers.size());
        }

        // 2. Seed Branches if table is empty
        if (branchRepository.count() == 0) {
            log.info("Seeding default branches into MySQL database...");
            User managerColombo = userRepository.findByEmail("manager.colombo@spiceavenue.com").orElse(null);
            User managerNegombo = userRepository.findByEmail("manager.negombo@spiceavenue.com").orElse(null);

            Branch b1 = Branch.builder()
                    .branchName("Spice Avenue - Colombo Main")
                    .streetAddress("123 Galle Road, Colombo 03")
                    .contactNumber("0112345678")
                    .email("colombo@spiceavenue.com")
                    .openingTime(LocalTime.of(9, 0))
                    .closingTime(LocalTime.of(23, 0))
                    .manager(managerColombo)
                    .status(EntityStatus.ACTIVE)
                    .build();

            DeliveryArea a1 = DeliveryArea.builder()
                    .areaName("Colombo 03 (Kollupitiya)")
                    .deliveryFee(new BigDecimal("150.00"))
                    .branch(b1)
                    .status(EntityStatus.ACTIVE)
                    .build();

            DeliveryArea a2 = DeliveryArea.builder()
                    .areaName("Colombo 07 (Cinnamon Gardens)")
                    .deliveryFee(new BigDecimal("200.00"))
                    .branch(b1)
                    .status(EntityStatus.ACTIVE)
                    .build();

            b1.getDeliveryAreas().add(a1);
            b1.getDeliveryAreas().add(a2);

            Branch b2 = Branch.builder()
                    .branchName("Spice Avenue - Negombo Coastal")
                    .streetAddress("45 Lewis Place, Negombo")
                    .contactNumber("0312233445")
                    .email("negombo@spiceavenue.com")
                    .openingTime(LocalTime.of(10, 0))
                    .closingTime(LocalTime.of(22, 30))
                    .manager(managerNegombo)
                    .status(EntityStatus.ACTIVE)
                    .build();

            branchRepository.saveAll(List.of(b1, b2));

            // Link branch_id FK on seeded managers and riders
            if (managerColombo != null) {
                managerColombo.setBranch(b1);
                userRepository.save(managerColombo);
            }
            if (managerNegombo != null) {
                managerNegombo.setBranch(b2);
                userRepository.save(managerNegombo);
            }

            User riderKamal = userRepository.findByEmail("rider.kamal@spiceavenue.com").orElse(null);
            User riderNimal = userRepository.findByEmail("rider.nimal@spiceavenue.com").orElse(null);
            if (riderKamal != null) {
                riderKamal.setBranch(b1);
                userRepository.save(riderKamal);
            }
            if (riderNimal != null) {
                riderNimal.setBranch(b1);
                userRepository.save(riderNimal);
            }

            log.info("Successfully seeded default branches and delivery areas into MySQL.");
        }

        // 3. Seed Menu Categories & Items if table is empty
        if (categoryRepository.count() == 0) {
            log.info("Seeding default menu categories and items into MySQL database...");
            Branch colomboBranch = branchRepository.findAll().stream().findFirst().orElse(null);

            if (colomboBranch != null) {
                Category c1 = Category.builder()
                        .branch(colomboBranch)
                        .categoryName("Artisan Woodfired Pizzas")
                        .description("Handcrafted Neapolitan pizzas baked at 450C in woodfired stone ovens")
                        .status(EntityStatus.ACTIVE)
                        .build();

                Category c2 = Category.builder()
                        .branch(colomboBranch)
                        .categoryName("Gourmet Smash Burgers")
                        .description("Fresh ground beef smash burgers served with house seasoned crinkle fries")
                        .status(EntityStatus.ACTIVE)
                        .build();

                categoryRepository.saveAll(List.of(c1, c2));

                MenuItem item1 = MenuItem.builder()
                        .branch(colomboBranch)
                        .category(c1)
                        .foodName("Spicy BBQ Chicken Pizza")
                        .description("Woodfired crust topped with smoky BBQ chicken, caramelised onions & mozzarella")
                        .basePrice(new BigDecimal("1850.00"))
                        .available(true)
                        .status(EntityStatus.ACTIVE)
                        .build();

                MenuItem item2 = MenuItem.builder()
                        .branch(colomboBranch)
                        .category(c2)
                        .foodName("Double Cheese Beef Smash Burger")
                        .description("Double smash patties, melted cheddar, pickles & special house sauce")
                        .basePrice(new BigDecimal("1650.00"))
                        .available(true)
                        .status(EntityStatus.ACTIVE)
                        .build();

                menuItemRepository.saveAll(List.of(item1, item2));
                log.info("Successfully seeded default menu categories and items into MySQL.");
            }
        }
    }
}
