package com.filmes.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.filmes.model.Message;
import com.filmes.repository.ChatHistoryRepository;

@Service
public class ChatHistoryService {
        @Autowired
        private ChatHistoryRepository chatHistoryRepository;

        @Value("${openrouter.api-key}")
        private String apiKey;

        public void saveMessage(Message message) {
                chatHistoryRepository.saveMessage(message);
        }

        public List<Message> getChatHistory(String user1, String user2) {
                System.out.println("Fetching chat history between " + user1 + " and " + user2);
                return chatHistoryRepository.getChatHistory(user1, user2);
        }

        public Message filterMessage(Message message, String prompt) {

                if (prompt == null || prompt.trim().isEmpty())
                        return message;

                WebClient client = WebClient.builder()
                                .baseUrl("https://openrouter.ai")
                                .defaultHeader("Authorization", "Bearer " + apiKey)
                                .defaultHeader("Content-Type", "application/json")
                                .build();

                String userContent = "Rewrite the message below to satisfy the request.\n" +
                                "Preserve the original language of the message.\n" +
                                "Do not add emojis.\n" +
                                "Output only the final rewritten message.\n" +
                                "Message: " + message.getContent() + "\n" +
                                "Request: " + prompt;

                Map<String, Object> body = Map.of(
                                "model", "xiaomi/mimo-v2-flash:free",
                                "messages", List.of(
                                                Map.of("role", "user", "content", userContent)),
                                "reasoning", Map.of("enabled", false));
                

                String response = client.post()
                                .uri("/api/v1/chat/completions")
                                .bodyValue(body)
                                .retrieve()
                                .bodyToMono(String.class)
                                .block();

                String filteredContent = response
                                .split("\"content\":\"")[1]
                                .split("\"")[0]
                                .replace("\\n", "\n");

                Message filteredMessage = new Message();
                filteredMessage.setFromUser(message.getFromUser());
                filteredMessage.setToUser(message.getToUser());
                filteredMessage.setTimestamp(message.getTimestamp());
                filteredMessage.setContent(filteredContent);

                return filteredMessage;
        }
}
