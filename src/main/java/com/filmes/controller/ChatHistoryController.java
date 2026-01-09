package com.filmes.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;

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
  @Value("${openrouter.api-key}")
  private String apiKey;

  public Message filterMessage(Message message, String prompt) {

    WebClient client = WebClient.builder()
        .baseUrl("https://openrouter.ai")
        .defaultHeader("Authorization", "Bearer " + apiKey)
        .defaultHeader("Content-Type", "application/json")
        .build();

    String requestBody = String.format(
        """
            {
              "model": "xiaomi/mimo-v2-flash:free",
              "messages": [
                {
                  "role": "user",
                  "content": " Rewrite the message below to satisfy the request.
                    Keep the original language of the message.
                    Do not add emojis.
                    Output only the final rewritten message. Message: %s. Request: %s"
                }
              ],
              "reasoning": {
                "enabled": false
              }
            }
            """,
        message.getContent(),
        prompt);

    String response = client.post()
        .uri("/api/v1/chat/completions")
        .bodyValue(requestBody)
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
