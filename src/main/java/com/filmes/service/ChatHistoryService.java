package com.filmes.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.filmes.model.Message;
import com.filmes.repository.ChatHistoryRepository;

@Service
public class ChatHistoryService {
    @Autowired
    private ChatHistoryRepository chatHistoryRepository;

    public void saveMessage(Message message) {
        chatHistoryRepository.saveMessage(message);
    }

    public List<Message> getChatHistory(String user1, String user2) {
        System.out.println("Fetching chat history between " + user1 + " and " + user2);
        return chatHistoryRepository.getChatHistory(user1, user2);
    }
}
