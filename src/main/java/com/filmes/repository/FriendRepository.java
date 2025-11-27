package com.filmes.repository;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.filmes.model.Friends;

@Repository
public class FriendRepository {

    @Autowired
    DataRepository dataRepository;

    private static final String TABLE_NAME = "Friends";

    public Friends saveFriend(Friends friend) {
        File tableFile = dataRepository.createTable(TABLE_NAME);

        if (tableFile == null) {
            return null;
        }

        try (BufferedWriter writer = new BufferedWriter(new FileWriter(tableFile, true))) {
            String line = friend.toString();
            writer.write(line);
            writer.newLine();
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }

        return friend;
    }

    public Friends findFriendship(String user1, String user2) {
        File tableFile = dataRepository.createTable(TABLE_NAME);
        if (tableFile == null) return null;

        try (BufferedReader reader = new BufferedReader(new FileReader(tableFile))) {
            String line;
            while ((line = reader.readLine()) != null) {
                Friends f = Friends.fromString(line);
                if (f != null) {
                    boolean case1 = f.getUserSendName().equals(user1) && f.getUserReceivingName().equals(user2);
                    boolean case2 = f.getUserSendName().equals(user2) && f.getUserReceivingName().equals(user1);
                    
                    if (case1 || case2) {
                        return f;
                    }
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

    public List<Friends> findAllByUser(String username) {
        List<Friends> list = new ArrayList<>();
        File tableFile = dataRepository.createTable(TABLE_NAME);
        if (tableFile == null) return list;

        try (BufferedReader reader = new BufferedReader(new FileReader(tableFile))) {
            String line;
            while ((line = reader.readLine()) != null) {
                Friends f = Friends.fromString(line);
                if (f != null) {
                    if (f.getUserSendName().equals(username) || f.getUserReceivingName().equals(username)) {
                        list.add(f);
                    }
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return list;
    }

    public Friends updateFriendship(Friends updatedFriendship) {
        File tableFile = dataRepository.createTable(TABLE_NAME);
        if (tableFile == null) return null;

        List<String> newLines = new ArrayList<>();
        Friends result = null;

        try (BufferedReader reader = new BufferedReader(new FileReader(tableFile))) {
            String line;
            while ((line = reader.readLine()) != null) {
                Friends f = Friends.fromString(line);
                
                if (f != null && 
                    f.getUserSendName().equals(updatedFriendship.getUserSendName()) && 
                    f.getUserReceivingName().equals(updatedFriendship.getUserReceivingName())) {
                    
                    result = updatedFriendship;
                    newLines.add(updatedFriendship.toString());
                } else {
                    newLines.add(line);
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }

        try (BufferedWriter writer = new BufferedWriter(new FileWriter(tableFile))) {
            for (String l : newLines) {
                writer.write(l);
                writer.newLine();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        return result;
    }
}