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

import com.filmes.model.Message;

@Repository
public class ChatHistoryRepository {

    @Autowired
    private DataRepository dataRepository;

    public synchronized void saveMessage(Message message) {
        File chatFile = dataRepository.createTable(getChatFileName(message.getFromUser(), message.getToUser()));
        if (chatFile == null)
            return;

        try (BufferedWriter writer = new BufferedWriter(new FileWriter(chatFile, true))) {
            writer.write(message.toString());
            writer.newLine();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public List<Message> getChatHistory(String userA, String userB) {
        List<Message> messages = new ArrayList<>();
        File chatFile = dataRepository.createTable(getChatFileName(userA, userB));
        if (chatFile == null)
            return messages;

        try (BufferedReader reader = new BufferedReader(new FileReader(chatFile))) {
            String line;
            while ((line = reader.readLine()) != null) {
                Message msg = Message.fromString(line);
                if (msg != null) {
                    messages.add(msg);
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        return messages;
    }

    private String getChatFileName(String userA, String userB) {
        if (userA.compareTo(userB) < 0) {
            return "chat_" + userA + "_" + userB;
        } else {
            return "chat_" + userB + "_" + userA;
        }
    }
}
