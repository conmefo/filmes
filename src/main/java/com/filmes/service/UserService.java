package com.filmes.service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.StringJoiner;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.filmes.dto.request.SearchUserRequest;
import com.filmes.dto.request.UserCreationRequest;
import com.filmes.dto.request.UserUpdateRequest;
import com.filmes.dto.response.SearchUserResponse;
import com.filmes.dto.response.UserResponse;
import com.filmes.enums.Role;
import com.filmes.exception.AppException;
import com.filmes.exception.ErrorCode;
import com.filmes.mapper.UserMapper;
import com.filmes.model.User;
import com.filmes.repository.FriendListRepository;
import com.filmes.repository.FriendRepository;
import com.filmes.repository.UserRepository;

import io.micrometer.core.instrument.search.Search;
import jakarta.validation.Valid;

@Service
public class UserService {
    @Autowired
    UserRepository userRepository;

    @Autowired
    FriendRepository friendRepository;
    
    @Autowired
    UserMapper userMapper;

    @Autowired
    PasswordEncoder passwordEncoder;

    public UserResponse createUser(UserCreationRequest request) {
        if (userRepository.findUserByUsername(request.getUsername()) != null) {
            throw new AppException(ErrorCode.USER_EXISTS);
        }

        User user = userMapper.toUser(request);

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        HashSet<String> roles = new HashSet<>();
        roles.add(Role.USER.name());

        user.setRoles(roles);

        return userMapper.toUserResponse(userRepository.saveUser(user));
    }

    public List<UserResponse> getAllUsers() {
        List<User> users = userRepository.getAllUsers();

        return users.stream()
                .map(userMapper::toUserResponse)
                .collect(Collectors.toList());
    }

    public UserResponse updateUser(String username, UserUpdateRequest request){
        if (userRepository.findUserByUsername(username) == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        String password = passwordEncoder.encode(request.getPassword());
        return userMapper.toUserResponse(userRepository.updateUser(username, password));
    }

    public void deleteUser(String username){
        if (userRepository.findUserByUsername(username) == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        userRepository.deleteUser(username);
    }

    public List<SearchUserResponse> searchUserName(SearchUserRequest request) {
        List<User> users = userRepository.getAllUsers();
        List<SearchUserResponse> result = new ArrayList<>();

        for (User user : users) {
            if (user.getUsername().toLowerCase().contains(request.getQuery().toLowerCase())) {
                SearchUserResponse response = new SearchUserResponse();
                response.setUsername(user.getUsername());
                if (FriendListRepository.existFriendship(request.getRequesterUsername(), user.getUsername())) {
                    response.setFriendStatus("FRIEND");
                } else if (friendRepository.findFriendship(request.getRequesterUsername(), user.getUsername()) != null ||
                           friendRepository.findFriendship(user.getUsername(), request.getRequesterUsername()) != null) {
                    response.setFriendStatus("PENDING");
                } else {
                    response.setFriendStatus("NOT_FRIEND");
                }
                result.add(response);
            }
        }

        return result;
    }


}
