package com.filmes.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.filmes.model.User;
import com.filmes.repository.DataRepository;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;



@RestController
@RequestMapping("/api")
public class UserController {
    @Autowired
    DataRepository dataRepository;

    @PostMapping("/register")
    public User createUser(@RequestBody User user) {
        return dataRepository.saveUser(user);
    }

    @GetMapping("/{}")
    public User (@RequestParam String param) {
        return new String();
    }
}
