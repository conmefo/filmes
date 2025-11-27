package com.filmes.model;

import com.filmes.enums.FriendShip;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Friends {
    private String userSendName;
    private String userReceivingName;
    private FriendShip friendShip;

    @Override
    public String toString() {
        String statusStr = (friendShip != null) ? friendShip.name() : "";
        return userSendName + "|" + userReceivingName + "|" + statusStr;
    }

    public static Friends fromString(String line) {
        if (line == null || line.isEmpty()) return null;

        String[] parts = line.split("\\|");
        if (parts.length < 2) return null;

        String userSendName = parts[0];
        String userReceivingName = parts[1];

        FriendShip friendShip = null;
        if (parts.length > 2 && !parts[2].isEmpty()) {
            try {
                friendShip = FriendShip.valueOf(parts[2]);
            } catch (IllegalArgumentException e) {
            }
        }

        return new Friends(userSendName, userReceivingName, friendShip);
    }
}
