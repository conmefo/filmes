package com.filmes.service;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.filmes.dto.request.UserCreationRequest;
import com.filmes.dto.request.UserUpdateRequest;
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

    public List<UserResponse> getAllUsers() {
        List<User> users = dataRepository.getAllUsers();

        return users.stream()
                .map(userMapper::toUserResponse)
                .collect(Collectors.toList());
    }

    public UserResponse updateUser(String username, UserUpdateRequest request){
        if (dataRepository.findUserByUsername(username) == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        String password = passwordEncoder.encode(request.getPassword());
        return userMapper.toUserResponse(dataRepository.updateUser(username, password));
    }

    public void deleteUser(String username){
        if (dataRepository.findUserByUsername(username) == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        dataRepository.deleteUser(username);
    }

}
