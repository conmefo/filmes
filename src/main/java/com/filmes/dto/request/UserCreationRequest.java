package com.filmes.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserCreationRequest {
    @Size(min = 3, max = 20, message = "USERNAME_INVALID")
    @Pattern(regexp = "^[A-Za-z0-9]+$", message = "USERNAME_NO_SPECIAL_CHAR")
    String username;      

    @Size(min = 6, message = "PASSWORD_INVALID")
    @Pattern(regexp = "^[A-Za-z0-9]+$", message = "PASSWORD_NO_SPECIAL_CHAR")
    String password;
}
