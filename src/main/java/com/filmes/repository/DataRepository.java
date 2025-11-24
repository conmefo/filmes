package com.filmes.repository;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.stereotype.Repository;


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
}
