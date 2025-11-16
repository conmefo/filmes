package com.filmes.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;


@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse <T>{
    private int code = 1000;
    private String message;
    private T result;
    
    public ApiResponse (){}
    
    public void setCode (int newCode) {
        code = newCode;
    }

    public void setMessage (String newMessage) {
        message = newMessage;
    }

    public void setResult (T newResult){
        result = newResult;
    }
}