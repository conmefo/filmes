package com.filmes;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.filmes")
public class FilmesApplication {

	public static void main(String[] args) {
		SpringApplication.run(FilmesApplication.class, args);
	}

}
