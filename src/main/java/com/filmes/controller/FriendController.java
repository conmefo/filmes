package com.filmes.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.filmes.dto.request.FriendRequest; 
import com.filmes.dto.response.ApiResponse;
import com.filmes.model.Friends;
import com.filmes.service.FriendService;

@RestController
@RequestMapping("/api/friends")
public class FriendController {

    @Autowired
    private FriendService friendService;

    @PostMapping("/request")
    ApiResponse<Friends> sendRequest(@RequestBody FriendRequest request) {
        return ApiResponse.<Friends>builder()
                .result(friendService.sendFriendRequest(request.getUserSendName(), request.getUserReceivingName()))
                .build();
    }

    @PutMapping("/accept")
    ApiResponse<Friends> acceptRequest(@RequestBody FriendRequest request) throws Exception {
        return ApiResponse.<Friends>builder()
                .result(friendService.acceptFriendRequest(request.getUserSendName(), request.getUserReceivingName()))
                .build();
    }

    @PutMapping("/reject")
    ApiResponse<Friends> rejectRequest(@RequestBody FriendRequest request) {
        return ApiResponse.<Friends>builder()
                .result(friendService.rejectFriendRequest(request.getUserSendName(), request.getUserReceivingName()))
                .build();
    }

    @GetMapping("/{username}/list")
    ApiResponse<List<String>> getFriendList(@PathVariable String username) {
        return ApiResponse.<List<String>>builder()
                .result(friendService.getFriendList(username))
                .build();
    }

    @GetMapping("/{username}/pending")
    ApiResponse<List<Friends>> getPendingRequests(@PathVariable String username) {
        return ApiResponse.<List<Friends>>builder()
                .result(friendService.getPendingRequests(username))
                .build();
    }

    @PostMapping("/")
    public String postMethodName(@RequestBody String entity) {
        
        return entity;
    }
    
}