package com.filmes.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.filmes.enums.FriendShip;
import com.filmes.exception.AppException;
import com.filmes.exception.ErrorCode; 
import com.filmes.model.Friends;
import com.filmes.repository.FriendListRepository;
import com.filmes.repository.FriendRepository;
import com.filmes.repository.UserRepository;

@Service
public class FriendService {

    @Autowired
    FriendRepository friendRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    FriendListRepository friendListRepository;


    public Friends sendFriendRequest(String senderUsername, String receiverUsername) {
        if (userRepository.findUserByUsername(senderUsername) == null || 
            userRepository.findUserByUsername(receiverUsername) == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        if (senderUsername.equals(receiverUsername)) {
            throw new AppException(ErrorCode.CANNOT_ADD_YOURSELF_AS_FRIEND);
        }

        Friends existing = friendRepository.findFriendship(senderUsername, receiverUsername);
        if (existing != null) {
            throw new AppException(ErrorCode.FRIEND_REQUEST_ALREADY_EXISTS);
        }

        Friends newFriend = new Friends(senderUsername, receiverUsername, FriendShip.PENDING);
        return friendRepository.saveFriend(newFriend);
    }

    public Friends acceptFriendRequest(String senderUsername, String receiverUsername) {
    Friends friend = friendRepository.findFriendship(senderUsername, receiverUsername);

    if (friend == null) {
        throw new AppException(ErrorCode.FRIEND_REQUEST_NOT_FOUND);
    }

    if (friend.getFriendShip() == FriendShip.ACCEPTED) {
        throw new AppException(ErrorCode.FRIENDSHIP_ALREADY_EXISTS);
    }

    friend.setFriendShip(FriendShip.ACCEPTED);
    friendRepository.updateFriendship(friend);

    friendListRepository.addFriend(senderUsername, receiverUsername);
    friendListRepository.addFriend(receiverUsername, senderUsername);

    return friend;
}


    public Friends rejectFriendRequest(String senderUsername, String receiverUsername) {
        Friends friend = friendRepository.findFriendship(senderUsername, receiverUsername);
        
        if (friend == null) {
            throw new AppException(ErrorCode.FRIEND_REQUEST_NOT_FOUND);
        }

        friend.setFriendShip(FriendShip.REJECTED);
        return friendRepository.updateFriendship(friend);
    }

    public List<String> getFriendList(String username) {
        List<Friends> all = friendRepository.findAllByUser(username);
        List<String> friendNames = new ArrayList<>();

        for (Friends f : all) {
            if (f.getFriendShip() == FriendShip.ACCEPTED) {
                if (f.getUserSendName().equals(username)) {
                    friendNames.add(f.getUserReceivingName());
                } else {
                    friendNames.add(f.getUserSendName());
                }
            }
        }
        return friendNames;
    }

    public List<Friends> getPendingRequests(String username) {
        List<Friends> all = friendRepository.findAllByUser(username);
        List<Friends> pending = new ArrayList<>();

        for (Friends f : all) {
            if (f.getUserReceivingName().equals(username) && f.getFriendShip() == FriendShip.PENDING) {
                pending.add(f);
            }
        }
        return pending;
    }
}