package com.filmes.repository;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.filmes.model.User;

@Repository
public class FriendService {
    @Autowired
    DataRepository dataRepository;


}
