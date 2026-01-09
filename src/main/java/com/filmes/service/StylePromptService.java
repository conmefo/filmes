package com.filmes.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.filmes.repository.StylePromptRepository;

@Service
public class StylePromptService {

    @Autowired
    private StylePromptRepository repository;

    public void saveStylePrompt(String username, String friend, String prompt) {
        repository.savePrompt(username, friend, prompt);
    }

    public String getStylePrompt(String username, String friend) {
        return repository.getPrompt(username, friend);
    }
}
