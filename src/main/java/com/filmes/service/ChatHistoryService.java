package com.filmes.service;

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
}
