package com.filmes.model;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {
    private String username;
    private String password;
    private Set<String> roles;
    
    @Override
    public String toString() {
        String rolesStr = (roles != null && !roles.isEmpty()) ? String.join(",", roles) : "";
        return username + "|" + password + "|" + rolesStr;
    }

    public static User fromString(String line) {
        if (line == null || line.isEmpty()) return null;

        String[] parts = line.split("\\|");
        if (parts.length < 2) return null; 

        String username = parts[0];
        String password = parts[1];

        Set<String> roles = new HashSet<>();
        if (parts.length > 2 && !parts[2].isEmpty()) {
            roles.addAll(Arrays.asList(parts[2].split(",")));
        }

        return new User(username, password, roles);
    }
}
