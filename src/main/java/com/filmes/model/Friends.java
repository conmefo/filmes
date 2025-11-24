package com.filmes.model;

import com.filmes.enums.FriendStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Friends {
    private String userSendName;
    private String userReceivingName;
    private FriendStatus friendStatus;

    @Override
    public String toString() {
        String statusStr = (friendStatus != null) ? friendStatus.name() : "";
        return userSendName + "|" + userReceivingName + "|" + statusStr;
    }

    public static Friends fromString(String line) {
        if (line == null || line.isEmpty()) return null;

        String[] parts = line.split("\\|");
        if (parts.length < 2) return null;

        String userSendName = parts[0];
        String userReceivingName = parts[1];

        FriendStatus status = null;
        if (parts.length > 2 && !parts[2].isEmpty()) {
            try {
                status = FriendStatus.valueOf(parts[2]);
            } catch (IllegalArgumentException e) {
            }
        }

        return new Friends(userSendName, userReceivingName, status);
    }
}
