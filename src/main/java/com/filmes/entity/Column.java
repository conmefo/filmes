package com.filmes.entity;

import java.util.List;

public class Column<T> {
    private String name;
    private List<T> value;

    public Column(String name, List<T> value) {
        this.name = name;
        this.value = value;
    }

    public String getName() { return name; }
    public List<T> getValue() { return value; }
}