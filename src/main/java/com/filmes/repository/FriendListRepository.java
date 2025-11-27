package com.filmes.repository;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Repository;

@Repository
public class FriendListRepository {

    private static final String FOLDER_NAME = "FriendsList";

    public FriendListRepository() {
        File folder = new File(FOLDER_NAME);
        if (!folder.exists()) {
            folder.mkdirs();
        }
    }

    private File getUserFile(String username) {
        return new File(FOLDER_NAME + "/" + username + ".txt");
    }

    public void addFriend(String username, String friendName) {
        File file = getUserFile(username);

        try {
            // Create file if not exists
            if (!file.exists()) {
                file.createNewFile();
            }

            // Avoid duplicates
            List<String> existingFriends = getFriendList(username);
            if (existingFriends.contains(friendName)) {
                return;
            }

            try (BufferedWriter writer = new BufferedWriter(new FileWriter(file, true))) {
                writer.write(friendName);
                writer.newLine();
            }

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public List<String> getFriendList(String username) {
        List<String> friends = new ArrayList<>();
        File file = getUserFile(username);

        if (!file.exists()) return friends;

        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = reader.readLine()) != null) {
                friends.add(line.trim());
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        return friends;
    }
}
