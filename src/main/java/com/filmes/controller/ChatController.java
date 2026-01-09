package com.filmes.controller;

import org.springframework.stereotype.Controller;

import com.filmes.model.Message;
import com.filmes.model.User;
import com.filmes.service.ChatHistoryService;
import com.filmes.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@Controller
public class ChatController {
    private final SimpMessagingTemplate messagingTemplate;
    @Autowired
    UserService userService;
    @Autowired
    ChatHistoryService chatHistoryService;

    public ChatController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload Message message, String prompt) {
        message = chatHistoryService.filterMessage(message, prompt);
        String senderDest = "/topic/public/" + message.getFromUser();
        messagingTemplate.convertAndSend(senderDest, message);
        chatHistoryService.saveMessage(message);
    }
}
