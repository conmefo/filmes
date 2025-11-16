package com.filmes.service;

import java.io.File;
import java.io.IOException;

public class DatabaseService {
    public void createTable(String tableName){
        File newTable = new File(tableName + ".txt");
        try{
            newTable.createNewFile();
        } catch (IOException e){
            System.out.println("An error occurred.");
            e.printStackTrace();
        }
    }
}
