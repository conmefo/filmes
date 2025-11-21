package com.filmes.config;

import java.util.HashSet;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.filmes.repository.DataRepository;
import com.filmes.enums.Role;
import com.filmes.model.User;

@Configuration
public class ApplicationInitConfig {
    @Autowired
    PasswordEncoder passwordEncoder;

    @Bean
    ApplicationRunner applicationRunner(DataRepository dataRepository) {
        return args -> {
            if (dataRepository.findUserByUsername("admin") == null) {
                HashSet<String> roles = new HashSet<String>();
                roles.add(Role.ADMIN.name());

                User user = User.builder()
                        .username("admin")
                        .password(passwordEncoder.encode("admin"))
                        .roles(roles)
                        .build();

                dataRepository.saveUser(user);
            }
        };
    }
}
