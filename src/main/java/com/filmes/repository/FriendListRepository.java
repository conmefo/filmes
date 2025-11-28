package com.filmes.repository;

import org.springframework.stereotype.Repository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Repository
public class FriendListRepository {

    private static final String FOLDER_NAME = "FriendsList";

    public FriendListRepository() {
        try {
            Files.createDirectories(Paths.get(FOLDER_NAME));
        } catch (IOException e) {
            throw new RuntimeException("Could not create repository folder", e);
        }
    }

    private Path getUserFilePath(String username) {
        return Paths.get(FOLDER_NAME, username + ".txt");
    }

    public void addFriend(String username, String friendName) throws IOException {
        Path userFile = getUserFilePath(username);
        if (!Files.exists(userFile)) {
            Files.createFile(userFile);
        }

        List<String> friends = getFriendList(username);
        if (friends.contains(friendName)) {
            return;
        }

        String newFriendRecord = friendName + ",";
        List<String> lines = Files.readAllLines(userFile);
        lines.add(newFriendRecord);
        Files.write(userFile, lines);
    }
    
    public List<String> getFriendList(String username) throws IOException {
        Path userFile = getUserFilePath(username);
        if (!Files.exists(userFile)) {
            return new ArrayList<>();
        }

        return Files.lines(userFile)
                .map(line -> line.split(",", 2)[0])
                .collect(Collectors.toList());
    }

    public void updateStylePromptForFriend(String username, String friendName, String stylePrompt) throws IOException {
        Path userFile = getUserFilePath(username);
        if (!Files.exists(userFile)) {
            return;
        }

        List<String> lines = Files.readAllLines(userFile);
        List<String> newLines = new ArrayList<>();

        for (String line : lines) {
            String[] parts = line.split(",", 2);
            if (parts.length > 0 && parts[0].equals(friendName)) {
                newLines.add(friendName + "," + stylePrompt);
            } else {
                newLines.add(line);
            }
        }
        Files.write(userFile, newLines);
    }

    public String getStylePromptForFriend(String username, String friendName) throws IOException {
        Path userFile = getUserFilePath(username);
        if (!Files.exists(userFile)) {
            return "";
        }

        return Files.lines(userFile)
                .filter(line -> line.startsWith(friendName + ","))
                .map(line -> line.split(",", 2))
                .filter(parts -> parts.length > 1)
                .map(parts -> parts[1])
                .findFirst()
                .orElse("");
    }

    public static boolean existFriendship(String requesterUsername, String username) {
        Path userFile = Paths.get(FOLDER_NAME, requesterUsername + ".txt");

        if (!Files.exists(userFile)) {
            return false;
        }

        try {
            return Files.lines(userFile)
                    .anyMatch(line -> line.startsWith(username + ","));
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }
    }
}