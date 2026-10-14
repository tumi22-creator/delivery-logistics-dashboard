
package com.deliverylogistics.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;

@Configuration
public class AdminUserConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService(
            @Value("${ADMIN_EMAIL}") String adminEmail,
            @Value("${ADMIN_PASSWORD}") String adminPassword,
            PasswordEncoder passwordEncoder) {

        if (adminPassword == null || adminPassword.isBlank()) {
            throw new IllegalStateException(
                    "ADMIN_PASSWORD must be configured"
            );
        }

        var admin = User.withUsername(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .roles("ADMIN")
                .build();

        return new InMemoryUserDetailsManager(admin);
    }
}
