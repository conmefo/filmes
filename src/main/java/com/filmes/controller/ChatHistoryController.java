package com.filmes.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.filmes.dto.response.ApiResponse;
import com.filmes.model.Message;
import com.filmes.service.ChatHistoryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/chat/history")
public class ChatHistoryController {
    @Autowired
    ChatHistoryService chatHistoryService;

    @GetMapping("")
    public ApiResponse<List<Message>> getChatHistory(
            @RequestParam String user1,
            @RequestParam String user2) {
                
        List<Message> history = chatHistoryService.getChatHistory(user1, user2);
        return ApiResponse.<List<Message>>builder()
                .result(history)
                .build();
    }
    
}
