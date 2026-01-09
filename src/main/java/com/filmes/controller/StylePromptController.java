package com.filmes.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.filmes.dto.request.StylePromptRequest;
import com.filmes.dto.response.ApiResponse;
import com.filmes.service.StylePromptService;

@RestController
@RequestMapping("/api/users")
public class StylePromptController {

    @Autowired
    private StylePromptService stylePromptService;

    @PutMapping("/{username}/style")
    public ApiResponse<Void> saveStylePrompt(
            @PathVariable String username,
            @RequestParam String friend,
            @RequestBody StylePromptRequest request) {

        stylePromptService.saveStylePrompt(username, friend, request.getStylePrompt());

        return ApiResponse.<Void>builder()
                .result(null)
                .build();
    }

    @GetMapping("/{username}/style")
    public ApiResponse<StylePromptRequest> getStylePrompt(
            @PathVariable String username,
            @RequestParam String friend) {

        String prompt = stylePromptService.getStylePrompt(username, friend);

        StylePromptRequest dto = new StylePromptRequest();
        dto.setStylePrompt(prompt);

        return ApiResponse.<StylePromptRequest>builder()
                .result(dto)
                .build();
    }
}
