package com.voiceshield.ai.config;

import com.voiceshield.ai.entity.Role;
import com.voiceshield.ai.entity.User;
import com.voiceshield.ai.entity.enums.RoleType;
import com.voiceshield.ai.repository.RoleRepository;
import com.voiceshield.ai.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        Role adminRole = roleRepository.findByName(RoleType.ROLE_ADMIN)
                .orElseGet(() -> roleRepository.save(new Role(RoleType.ROLE_ADMIN, "System Administrator")));
        Role analystRole = roleRepository.findByName(RoleType.ROLE_ANALYST)
                .orElseGet(() -> roleRepository.save(new Role(RoleType.ROLE_ANALYST, "Security Analyst")));
        Role userRole = roleRepository.findByName(RoleType.ROLE_USER)
                .orElseGet(() -> roleRepository.save(new Role(RoleType.ROLE_USER, "Standard User")));

        if (!userRepository.existsByUsername("admin")) {
            User admin = new User("admin", "admin@voiceshield.ai", passwordEncoder.encode("AdminPass123!"), "System", "Admin");
            admin.setDepartment("CyberSecurity Core");
            admin.setRoles(Set.of(adminRole, analystRole, userRole));
            userRepository.save(admin);
            logger.info("Initialized default admin user");
        }

        if (!userRepository.existsByUsername("analyst")) {
            User analyst = new User("analyst", "analyst@voiceshield.ai", passwordEncoder.encode("AnalystPass123!"), "Alex", "Vance");
            analyst.setDepartment("SecOps Tier 2");
            analyst.setRoles(Set.of(analystRole, userRole));
            userRepository.save(analyst);
            logger.info("Initialized default analyst user");
        }

        if (!userRepository.existsByUsername("operator")) {
            User user = new User("operator", "operator@voiceshield.ai", passwordEncoder.encode("UserPass123!"), "Jordan", "Lee");
            user.setDepartment("Customer Operations");
            user.setRoles(Set.of(userRole));
            userRepository.save(user);
            logger.info("Initialized default operator user");
        }
    }
}
