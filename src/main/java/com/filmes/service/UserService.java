package com.filmes.service;

import java.util.HashSet;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.filmes.dto.request.UserCreationRequest;
import com.filmes.dto.response.UserResponse;
import com.filmes.exception.AppException;
import com.filmes.exception.ErrorCode;
import com.filmes.mapper.UserMapper;
import com.filmes.model.User;
import com.filmes.repository.DataRepository;

import jakarta.validation.Valid;

@Service
public class UserService {
    @Autowired
    DataRepository dataRepository;
    
    @Autowired
    UserMapper userMapper;

    @Autowired
    PasswordEncoder passwordEncoder;

    public UserResponse createUser(UserCreationRequest request) {
        if (dataRepository.findUserByUsername(request.getUsername()) != null) {
            throw new AppException(ErrorCode.USER_EXISTS);
        }

        User user = userMapper.toUser(request);

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // HashSet<String> roles = new HashSet<>();
        // roles.add(Role.USER.name());

        // user.setRoles(roles);

        return userMapper.toUserResponse(dataRepository.saveUser(user));
    }
}
