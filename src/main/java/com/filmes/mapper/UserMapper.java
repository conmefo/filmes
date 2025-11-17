package com.filmes.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.springframework.stereotype.Component;

import com.filmes.dto.request.UserCreationRequest;
import com.filmes.dto.request.UserUpdateRequest;
import com.filmes.dto.response.UserResponse;
import com.filmes.model.User;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User toUser(UserCreationRequest dto);
    UserResponse toUserResponse(User user);
    void updateUser(@MappingTarget User user, UserUpdateRequest request);
}
