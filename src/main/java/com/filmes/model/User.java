package com.filmes.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {
    private String username;
    private String password;
    
    @Override
    public String toString() {
        return username + "|" + password;
    }

    public static User fromString(String line) {
        String[] parts = line.split("\\|");
        if (parts.length != 2) return null;
        return new User(parts[0], parts[1]);
    }
}
