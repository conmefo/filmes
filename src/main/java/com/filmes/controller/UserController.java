package com.filmes.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.filmes.entity.User;
import com.filmes.service.UserService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api")
public class UserController{
    @Autowired
    UserService userService;

    @PostMapping("/create")
    public User createUser (@RequestBody User user) {
        return userService.createUser(user);
    }
    

}