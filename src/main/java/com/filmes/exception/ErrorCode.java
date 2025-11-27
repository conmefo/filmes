package com.filmes.exception;

public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error"),
    USER_EXISTS(1001, "User already exists"),
    USERNAME_INVALID(1002, "username must be between 3 and 20 characters"),
    PASSWORD_INVALID(1003, "password must be at least 6 characters"),
    USER_NOT_FOUND(1004, "User not found"),
    AUTHENTICATION_FAILED(1005, "Authentication failed"),
    FRIEND_REQUEST_ALREADY_EXISTS(1006, "Friend request already exists"),
    FRIEND_REQUEST_NOT_FOUND(1007, "Friend request not found"),
    FRIENDSHIP_ALREADY_EXISTS(1008, "Friendship already exists"),
    CANNOT_ADD_YOURSELF_AS_FRIEND(1009, "Cannot add yourself as a friend")
    ;

    private final int code;
    private final String message;

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }

    public int getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}
