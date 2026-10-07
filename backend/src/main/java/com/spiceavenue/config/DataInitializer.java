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
import com.spiceavenue.menu.entity.MenuVariation;
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
import java.util.ArrayList;
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
                            .fullName("System Administrator")
                            .email("admin@spiceavenue.com")
                            .password(defaultPassword)
                            .phoneNumber("0771110001")
                            .role(UserRole.ADMIN)
                            .status(EntityStatus.ACTIVE)
                            .riderStatus(RiderStatus.OFFLINE)
                            .build(),
                    User.builder()
                            .fullName("Operations Manager")
                            .email("ops@spiceavenue.com")
                            .password(defaultPassword)
                            .phoneNumber("0771110002")
                            .role(UserRole.OPS_MANAGER)
                            .status(EntityStatus.ACTIVE)
                            .riderStatus(RiderStatus.OFFLINE)
                            .build(),
                    User.builder()
                            .fullName("Kasun Perera (Colombo Manager)")
                            .email("manager.colombo@spiceavenue.com")
                            .password(defaultPassword)
                            .phoneNumber("0771110003")
                            .role(UserRole.BRANCH_MANAGER)
                            .status(EntityStatus.ACTIVE)
                            .riderStatus(RiderStatus.OFFLINE)
                            .build(),
                    User.builder()
                            .fullName("Dinesh Silva (Negombo Manager)")
                            .email("manager.negombo@spiceavenue.com")
                            .password(defaultPassword)
                            .phoneNumber("0771110004")
                            .role(UserRole.BRANCH_MANAGER)
                            .status(EntityStatus.ACTIVE)
                            .riderStatus(RiderStatus.OFFLINE)
                            .build(),
                    User.builder()
                            .fullName("Nuwan Fernando (Kandy Manager)")
                            .email("manager.kandy@spiceavenue.com")
                            .password(defaultPassword)
                            .phoneNumber("0771110011")
                            .role(UserRole.BRANCH_MANAGER)
                            .status(EntityStatus.ACTIVE)
                            .riderStatus(RiderStatus.OFFLINE)
                            .build(),
                    User.builder()
                            .fullName("Kamal Perera (Rider)")
                            .email("rider.kamal@spiceavenue.com")
                            .password(defaultPassword)
                            .phoneNumber("0771110005")
                            .role(UserRole.RIDER)
                            .status(EntityStatus.ACTIVE)
                            .riderStatus(RiderStatus.AVAILABLE)
                            .build(),
                    User.builder()
                            .fullName("Nimal Silva (Rider)")
                            .email("rider.nimal@spiceavenue.com")
                            .password(defaultPassword)
                            .phoneNumber("0771110006")
                            .role(UserRole.RIDER)
                            .status(EntityStatus.ACTIVE)
                            .riderStatus(RiderStatus.AVAILABLE)
                            .build(),
                    User.builder()
                            .fullName("Sunil Fernando (Rider)")
                            .email("rider.sunil@spiceavenue.com")
                            .password(defaultPassword)
                            .phoneNumber("0771110007")
                            .role(UserRole.RIDER)
                            .status(EntityStatus.ACTIVE)
                            .riderStatus(RiderStatus.BUSY)
                            .build(),
                    User.builder()
                            .fullName("Sarah Jayasinghe (Supervisor)")
                            .email("supervisor@spiceavenue.com")
                            .password(defaultPassword)
                            .phoneNumber("0771110008")
                            .role(UserRole.SUPERVISOR)
                            .status(EntityStatus.ACTIVE)
                            .riderStatus(RiderStatus.OFFLINE)
                            .build(),
                    User.builder()
                            .fullName("John Doe (Customer)")
                            .email("customer.john@gmail.com")
                            .password(defaultPassword)
                            .phoneNumber("0771110009")
                            .role(UserRole.CUSTOMER)
                            .status(EntityStatus.ACTIVE)
                            .riderStatus(RiderStatus.OFFLINE)
                            .build(),
                    User.builder()
                            .fullName("Jane Smith (Customer)")
                            .email("customer.jane@gmail.com")
                            .password(defaultPassword)
                            .phoneNumber("0771110010")
                            .role(UserRole.CUSTOMER)
                            .status(EntityStatus.ACTIVE)
                            .riderStatus(RiderStatus.OFFLINE)
                            .build(),
                    User.builder()
                            .fullName("Alex Rodrigo (Customer)")
                            .email("customer.alex@gmail.com")
                            .password(defaultPassword)
                            .phoneNumber("0771110012")
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
            User managerKandy = userRepository.findByEmail("manager.kandy@spiceavenue.com").orElse(null);

            Branch b1 = Branch.builder()
                    .branchName("Spice Avenue - Colombo Main")
                    .streetAddress("No. 120, Galle Road, Colombo 03")
                    .contactNumber("0112345678")
                    .email("colombo@spiceavenue.com")
                    .openingTime(LocalTime.of(8, 0))
                    .closingTime(LocalTime.of(23, 0))
                    .manager(managerColombo)
                    .status(EntityStatus.ACTIVE)
                    .build();

            DeliveryArea a1 = DeliveryArea.builder()
                    .areaName("Colombo 01 (Fort)")
                    .deliveryFee(new BigDecimal("250.00"))
                    .branch(b1)
                    .status(EntityStatus.ACTIVE)
                    .build();

            DeliveryArea a2 = DeliveryArea.builder()
                    .areaName("Colombo 03 (Kollupitiya)")
                    .deliveryFee(new BigDecimal("150.00"))
                    .branch(b1)
                    .status(EntityStatus.ACTIVE)
                    .build();

            DeliveryArea a3 = DeliveryArea.builder()
                    .areaName("Colombo 07 (Cinnamon Gardens)")
                    .deliveryFee(new BigDecimal("200.00"))
                    .branch(b1)
                    .status(EntityStatus.ACTIVE)
                    .build();

            b1.getDeliveryAreas().addAll(List.of(a1, a2, a3));

            Branch b2 = Branch.builder()
                    .branchName("Spice Avenue - Negombo Coastal")
                    .streetAddress("No. 45, Beach Road, Negombo")
                    .contactNumber("0312345678")
                    .email("negombo@spiceavenue.com")
                    .openingTime(LocalTime.of(9, 0))
                    .closingTime(LocalTime.of(22, 30))
                    .manager(managerNegombo)
                    .status(EntityStatus.ACTIVE)
                    .build();

            DeliveryArea a4 = DeliveryArea.builder()
                    .areaName("Negombo Town")
                    .deliveryFee(new BigDecimal("150.00"))
                    .branch(b2)
                    .status(EntityStatus.ACTIVE)
                    .build();

            b2.getDeliveryAreas().add(a4);

            Branch b3 = Branch.builder()
                    .branchName("Spice Avenue - Kandy Hills")
                    .streetAddress("No. 18, Dalada Veediya, Kandy")
                    .contactNumber("0812345678")
                    .email("kandy@spiceavenue.com")
                    .openingTime(LocalTime.of(9, 0))
                    .closingTime(LocalTime.of(22, 0))
                    .manager(managerKandy)
                    .status(EntityStatus.ACTIVE)
                    .build();

            branchRepository.saveAll(List.of(b1, b2, b3));

            if (managerColombo != null) {
                managerColombo.setBranch(b1);
                userRepository.save(managerColombo);
            }
            if (managerNegombo != null) {
                managerNegombo.setBranch(b2);
                userRepository.save(managerNegombo);
            }
            if (managerKandy != null) {
                managerKandy.setBranch(b3);
                userRepository.save(managerKandy);
            }

            User riderKamal = userRepository.findByEmail("rider.kamal@spiceavenue.com").orElse(null);
            User riderNimal = userRepository.findByEmail("rider.nimal@spiceavenue.com").orElse(null);
            User riderSunil = userRepository.findByEmail("rider.sunil@spiceavenue.com").orElse(null);
            if (riderKamal != null) {
                riderKamal.setBranch(b1);
                userRepository.save(riderKamal);
            }
            if (riderNimal != null) {
                riderNimal.setBranch(b1);
                userRepository.save(riderNimal);
            }
            if (riderSunil != null) {
                riderSunil.setBranch(b1);
                userRepository.save(riderSunil);
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
                        .categoryName("Woodfired Pizzas")
                        .description("Handcrafted stone oven Neapolitan pizzas with gourmet toppings")
                        .status(EntityStatus.ACTIVE)
                        .build();

                Category c2 = Category.builder()
                        .branch(colomboBranch)
                        .categoryName("Gourmet Burgers")
                        .description("Flame-grilled smash patties with melted cheeses in toasted brioche")
                        .status(EntityStatus.ACTIVE)
                        .build();

                Category c3 = Category.builder()
                        .branch(colomboBranch)
                        .categoryName("Rice & Wok Bowls")
                        .description("Authentic Asian wok fried rice, spicy devilled bowls and noodles")
                        .status(EntityStatus.ACTIVE)
                        .build();

                Category c4 = Category.builder()
                        .branch(colomboBranch)
                        .categoryName("Starters & Sides")
                        .description("Crispy wings, loaded fries, garlic bread, and appetizers")
                        .status(EntityStatus.ACTIVE)
                        .build();

                Category c5 = Category.builder()
                        .branch(colomboBranch)
                        .categoryName("Pastas & Grills")
                        .description("Creamy Italian pastas, lasagna, and charcoal grilled meats")
                        .status(EntityStatus.ACTIVE)
                        .build();

                Category c6 = Category.builder()
                        .branch(colomboBranch)
                        .categoryName("Beverages & Mocktails")
                        .description("Fresh tropical juices, artisan mocktails, smoothies and shakes")
                        .status(EntityStatus.ACTIVE)
                        .build();

                Category c7 = Category.builder()
                        .branch(colomboBranch)
                        .categoryName("Decadent Desserts")
                        .description("Molten lava cakes, cheesecakes, and gelato sundaes")
                        .status(EntityStatus.ACTIVE)
                        .build();

                categoryRepository.saveAll(List.of(c1, c2, c3, c4, c5, c6, c7));

                List<MenuItem> items = new ArrayList<>();

                // Item 1: Spicy Devilled Chicken Pizza
                MenuItem item1 = MenuItem.builder()
                        .branch(colomboBranch)
                        .category(c1)
                        .foodName("Spicy Devilled Chicken Pizza")
                        .description("Woodfired crust topped with spicy Sri Lankan devilled chicken, fiery capsicum, red onions and molten mozzarella.")
                        .basePrice(new BigDecimal("1850.00"))
                        .imageUrl("https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500")
                        .available(true)
                        .status(EntityStatus.ACTIVE)
                        .build();
                item1.getVariations().add(MenuVariation.builder().menuItem(item1).variationName("Small (6-inch)").additionalPrice(BigDecimal.ZERO).status(EntityStatus.ACTIVE).build());
                item1.getVariations().add(MenuVariation.builder().menuItem(item1).variationName("Medium (9-inch)").additionalPrice(new BigDecimal("600.00")).status(EntityStatus.ACTIVE).build());
                item1.getVariations().add(MenuVariation.builder().menuItem(item1).variationName("Large (12-inch)").additionalPrice(new BigDecimal("1200.00")).status(EntityStatus.ACTIVE).build());
                items.add(item1);

                // Item 2: Classic Margherita Rustica
                MenuItem item2 = MenuItem.builder()
                        .branch(colomboBranch)
                        .category(c1)
                        .foodName("Classic Margherita Rustica")
                        .description("Rich San Marzano tomato reduction, buffalo mozzarella, olive oil drizzle and fresh aromatic basil leaves.")
                        .basePrice(new BigDecimal("1500.00"))
                        .imageUrl("https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500")
                        .available(true)
                        .status(EntityStatus.ACTIVE)
                        .build();
                item2.getVariations().add(MenuVariation.builder().menuItem(item2).variationName("Small (6-inch)").additionalPrice(BigDecimal.ZERO).status(EntityStatus.ACTIVE).build());
                item2.getVariations().add(MenuVariation.builder().menuItem(item2).variationName("Medium (9-inch)").additionalPrice(new BigDecimal("500.00")).status(EntityStatus.ACTIVE).build());
                item2.getVariations().add(MenuVariation.builder().menuItem(item2).variationName("Large (12-inch)").additionalPrice(new BigDecimal("1000.00")).status(EntityStatus.ACTIVE).build());
                items.add(item2);

                // Item 3: Double Beef Smash Supreme
                MenuItem item3 = MenuItem.builder()
                        .branch(colomboBranch)
                        .category(c2)
                        .foodName("Double Beef Smash Supreme")
                        .description("Two 100% prime Angus beef smash patties, double aged cheddar, dill pickles and signature house glaze in brioche.")
                        .basePrice(new BigDecimal("1650.00"))
                        .imageUrl("https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500")
                        .available(true)
                        .status(EntityStatus.ACTIVE)
                        .build();
                item3.getVariations().add(MenuVariation.builder().menuItem(item3).variationName("Single Combo (with Fries & Drink)").additionalPrice(new BigDecimal("450.00")).status(EntityStatus.ACTIVE).build());
                items.add(item3);

                // Item 4: Crispy Hot Honey Chicken Burger
                MenuItem item4 = MenuItem.builder()
                        .branch(colomboBranch)
                        .category(c2)
                        .foodName("Crispy Hot Honey Chicken Burger")
                        .description("Crispy spiced buttermilk fried chicken fillet, spicy scotch bonnet honey drizzle, tangy slaw and creamy mayo.")
                        .basePrice(new BigDecimal("1450.00"))
                        .imageUrl("https://images.unsplash.com/photo-1521305916504-4a1121188589?w=500")
                        .available(true)
                        .status(EntityStatus.ACTIVE)
                        .build();
                items.add(item4);

                // Item 5: Indonesian Nasi Goreng
                MenuItem item5 = MenuItem.builder()
                        .branch(colomboBranch)
                        .category(c3)
                        .foodName("Signature Indonesian Nasi Goreng")
                        .description("Spicy wok tossed jasmine rice with chicken skewers, fried sunny-side egg, chili sambal and crispy prawn crackers.")
                        .basePrice(new BigDecimal("1400.00"))
                        .imageUrl("https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500")
                        .available(true)
                        .status(EntityStatus.ACTIVE)
                        .build();
                items.add(item5);

                // Item 6: Fiery Black Pepper Wok Noodles
                MenuItem item6 = MenuItem.builder()
                        .branch(colomboBranch)
                        .category(c3)
                        .foodName("Fiery Black Pepper Wok Noodles")
                        .description("Yellow egg noodles tossed with wok charred beef strips, crunchy bell peppers, scallions and cracked peppercorn sauce.")
                        .basePrice(new BigDecimal("1550.00"))
                        .imageUrl("https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500")
                        .available(true)
                        .status(EntityStatus.ACTIVE)
                        .build();
                items.add(item6);

                // Item 7: Buffalo Wings with Ranch Dip
                MenuItem item7 = MenuItem.builder()
                        .branch(colomboBranch)
                        .category(c4)
                        .foodName("Buffalo Wings with Ranch Dip")
                        .description("Six crispy chicken wings tossed in tangy cayenne pepper hot sauce served with house blue cheese dip.")
                        .basePrice(new BigDecimal("1100.00"))
                        .imageUrl("https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500")
                        .available(true)
                        .status(EntityStatus.ACTIVE)
                        .build();
                items.add(item7);

                // Item 8: Truffle & Parmesan Loaded Fries
                MenuItem item8 = MenuItem.builder()
                        .branch(colomboBranch)
                        .category(c4)
                        .foodName("Truffle & Parmesan Loaded Fries")
                        .description("Golden skin-on shoestring fries tossed in white truffle oil, grated aged parmesan and minced fresh parsley.")
                        .basePrice(new BigDecimal("850.00"))
                        .imageUrl("https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500")
                        .available(true)
                        .status(EntityStatus.ACTIVE)
                        .build();
                items.add(item8);

                // Item 9: Creamy Fettuccine Carbonara
                MenuItem item9 = MenuItem.builder()
                        .branch(colomboBranch)
                        .category(c5)
                        .foodName("Creamy Fettuccine Carbonara")
                        .description("Fresh fettuccine pasta in rich egg-yolk and parmesan cream sauce with crispy pancetta bacon.")
                        .basePrice(new BigDecimal("1750.00"))
                        .imageUrl("https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500")
                        .available(true)
                        .status(EntityStatus.ACTIVE)
                        .build();
                items.add(item9);

                // Item 10: Tropical Mango & Passion Cooler
                MenuItem item10 = MenuItem.builder()
                        .branch(colomboBranch)
                        .category(c6)
                        .foodName("Tropical Mango & Passion Cooler")
                        .description("Fresh blended ripe Alphonso mango and passion fruit nectar over crushed ice with mint sprig.")
                        .basePrice(new BigDecimal("650.00"))
                        .imageUrl("https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=500")
                        .available(true)
                        .status(EntityStatus.ACTIVE)
                        .build();
                item10.getVariations().add(MenuVariation.builder().menuItem(item10).variationName("Regular (350ml)").additionalPrice(BigDecimal.ZERO).status(EntityStatus.ACTIVE).build());
                item10.getVariations().add(MenuVariation.builder().menuItem(item10).variationName("Large (500ml)").additionalPrice(new BigDecimal("250.00")).status(EntityStatus.ACTIVE).build());
                items.add(item10);

                // Item 11: Molten Dark Chocolate Lava Cake
                MenuItem item11 = MenuItem.builder()
                        .branch(colomboBranch)
                        .category(c7)
                        .foodName("Molten Dark Chocolate Lava Cake")
                        .description("Warm molten Valrhona chocolate cake with a rich flowing center served with a scoop of vanilla bean gelato.")
                        .basePrice(new BigDecimal("850.00"))
                        .imageUrl("https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500")
                        .available(true)
                        .status(EntityStatus.ACTIVE)
                        .build();
                items.add(item11);

                // Item 12: New York Style Baked Cheesecake
                MenuItem item12 = MenuItem.builder()
                        .branch(colomboBranch)
                        .category(c7)
                        .foodName("New York Style Baked Cheesecake")
                        .description("Classic creamy baked vanilla cheesecake on a buttery graham cracker crust with wild berry compote.")
                        .basePrice(new BigDecimal("950.00"))
                        .imageUrl("https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500")
                        .available(true)
                        .status(EntityStatus.ACTIVE)
                        .build();
                items.add(item12);

                menuItemRepository.saveAll(items);
                log.info("Successfully seeded {} menu items with variations into MySQL.", items.size());
            }
        }
    }
}
