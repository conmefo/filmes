package com.filmes;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.beans.factory.annotation.Value;

@SpringBootTest
class FilmesApplicationTests {
    @Value("${openrouter.api-key}")
    private String apiKey;

    @Test
    void contextLoads() {
        WebClient client = WebClient.builder()
                .baseUrl("https://openrouter.ai")
                .defaultHeader("Authorization",
                        "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();

        String body = """
                {
                    "model":"xiaomi/mimo-v2-flash:free",
                    "messages": [
                    {
                        "role": "user",
                        "content": "Make this message follow the request of the prompt, keep its vietnamese and no use emoji, just send the message, no other detail, message: ban that la xin dep, prompt: make the message romantic. "
                    }
                    ],
                    "reasoning": {
                        "enabled": false
                    }
                }
                """;

        String response = client.post()
                .uri("/api/v1/chat/completions")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        System.out.println(response);
    }
}
