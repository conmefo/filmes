package com.filmes.repository;

import java.io.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

@Repository
public class StylePromptRepository {

    @Autowired
    private DataRepository dataRepository;

    private String getFileName(String owner, String friend) {
        return "style_" + owner + "_" + friend;
    }

    public synchronized void savePrompt(String owner, String friend, String prompt) {
        File file = dataRepository.createTable(getFileName(owner, friend));
        if (file == null)
            return;
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(file, false))) {
            writer.write(prompt == null ? "" : prompt);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public synchronized String getPrompt(String owner, String friend) {
        File file = dataRepository.createTable(getFileName(owner, friend));
        if (file == null || !file.exists())
            return "";
        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null)
                sb.append(line).append("\n");
            return sb.toString().trim();
        } catch (IOException e) {
            e.printStackTrace();
            return "";
        }
    }
}
