package com.filmes.exception;

public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error"),
    USER_EXISTS(1001, "User already exists"),
    USERNAME_INVALID(1002, "username must be between 3 and 20 characters"),
    PASSWORD_INVALID(1003, "password must be at least 6 characters"),
    USER_NOT_FOUND(1004, "User not found"),
    AUTHENTICATION_FAILED(1005, "Authentication failed")
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
