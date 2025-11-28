package com.filmes.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Message {
    private String fromUser;
    private String toUser;
    private String content;
    private String timestamp; 

    @Override
    public String toString() {
        return fromUser + "," + toUser + "," + timestamp + "," + content.replace("\n", "<br>");
    }

    public static Message fromString(String line) {
        String[] parts = line.split(",", 4);
        if (parts.length < 4) return null;

        Message msg = new Message();
        msg.setFromUser(parts[0]);
        msg.setToUser(parts[1]);
        msg.setTimestamp(parts[2]);
        msg.setContent(parts[3].replace("<br>", "\n"));
        return msg;
    }
}
