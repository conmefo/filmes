package com.filmes.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.filmes.dto.response.ApiResponse;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(value = AppException.class)
    ResponseEntity<ApiResponse> handleAppException(AppException exception) {
        ApiResponse apiResponse = new ApiResponse <>();
        apiResponse.setCode(exception.getErrorCode().getCode());
        apiResponse.setMessage(exception.getErrorCode().getMessage());
        return ResponseEntity.badRequest().body(apiResponse);
    }

    // @ExceptionHandler(value = MethodArgumentNotValidException.class)
    // ResponseEntity<ApiResponse> handleValidationException(MethodArgumentNotValidException exception) {
    //     String enumString = exception.getFieldError().getDefaultMessage();
    //     ErrorCode errorCode = ErrorCode.valueOf(enumString);
    //     ApiResponse apiResponse = new ApiResponse<>();
    //     apiResponse.setCode(errorCode.getCode());
    //     apiResponse.setMessage(errorCode.getMessage());
    //     return ResponseEntity.badRequest().body(apiResponse);
    // }

    //     @ExceptionHandler(value = Exception.class)
    // ResponseEntity<ApiResponse> handleException(Exception exception) {
    //     ApiResponse<String> apiResponse = new ApiResponse<>();
    //     apiResponse.setCode(ErrorCode.UNCATEGORIZED_EXCEPTION.getCode());
    //     apiResponse.setMessage(ErrorCode.UNCATEGORIZED_EXCEPTION.getMessage());
    //     return ResponseEntity.badRequest().body(apiResponse);
    // }

}
