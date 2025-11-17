package com.filmes.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.stereotype.Service;

import com.filmes.repository.DataRepository;

@Service
public class UserService {
    @Autowired
    DataRepository dataRepository;

    public User createUser(User user){
        
    }
}
