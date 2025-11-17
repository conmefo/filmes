package com.filmes.repository;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.stereotype.Repository;

import com.filmes.model.Table;
import com.filmes.model.User;

@Repository
public class DataRepository {
    
    public File createTable(String name) {
        Path databaseDir = Paths.get("database");

        if (!Files.exists(databaseDir)) {
            try {
                Files.createDirectories(databaseDir);
            } catch (IOException e) {
                e.printStackTrace();
                return null;
            }
        }

        String fileName = name + ".txt";
        Path tableFile = databaseDir.resolve(fileName);

        if (!Files.exists(tableFile)) {
            try {
                Files.createFile(tableFile);
                System.out.println("Table created: " + tableFile.toString());
            } catch (IOException e) {
                e.printStackTrace();
                return null;
            }
        }

        return tableFile.toFile();
    }

    public User saveUser(User user) {
        File tableFile = createTable("User");

        System.out.println(user.toString());
        if (tableFile == null) {
            System.err.println("Failed to create or access User table.");
            return null;
        }

        try (BufferedWriter writer = new BufferedWriter(new FileWriter(tableFile, true))) {
            String line = user.toString();
            writer.write(line);
            writer.newLine(); 
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }

        return user;
    }

    public User findUserByUsername(String username) {
        File tableFile = createTable("User");
        if (tableFile == null) return null;

        try (BufferedReader reader = new BufferedReader(new FileReader(tableFile))) {
            String line;
            while ((line = reader.readLine()) != null) {
                User u = User.fromString(line);
                if (u != null && u.getUsername().equals(username)) {
                    return u;
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        return null;
    }

}
