package com.filmes.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.filmes.dto.request.SearchUserRequest;
import com.filmes.dto.request.UserCreationRequest;
import com.filmes.dto.request.UserUpdateRequest;
import com.filmes.dto.response.ApiResponse;
import com.filmes.dto.response.SearchUserResponse;
import com.filmes.dto.response.UserResponse;
import com.filmes.model.User;
import com.filmes.repository.DataRepository;
import com.filmes.service.UserService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;



@RestController
@RequestMapping("/api")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/register")
    ApiResponse<UserResponse> createUser(@RequestBody @Valid UserCreationRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.createUser(request))
                .build();
    }

    @GetMapping("")
    ApiResponse<List<UserResponse>> getAllUsers() {
        return ApiResponse.<List<UserResponse>>builder()
                .result(userService.getAllUsers())
                .build();
    }

    @GetMapping("/users/search")
    public ApiResponse<List<SearchUserResponse>> searchUserName(@RequestBody SearchUserRequest request) {
        return ApiResponse.<List<SearchUserResponse>>builder()
                .result(userService.searchUserName(request))
                .build();
    }

        

    // @GetMapping("/myInfo")
    // ApiResponse<UserResponse> getMyInfo(@PathVariable String userId) {
    //     return ApiResponse.<UserResponse>builder()
    //             .result(userService.getMyInfo(userId))
    //             .build();
    // }

    @PutMapping("/{username}")
    ApiResponse<UserResponse> updateUser(
            @PathVariable String username,
            @RequestBody UserUpdateRequest request) {

        return ApiResponse.<UserResponse>builder()
                .result(userService.updateUser(username, request))
                .build();
    }

    @DeleteMapping("/{username}")
    ApiResponse<String> deleteUser(@PathVariable String username) {

        userService.deleteUser(username);

        return ApiResponse.<String>builder()
                .result("User deleted successfully")
                .build();
    }
}
