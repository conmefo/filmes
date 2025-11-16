package com.filmes.entity;

import java.util.List;

import com.filmes.exception.AppException;
import com.filmes.exception.ErrorCode;

public class Table {
    List<Column<?>> columns;

    public Table (){}

    void addColumn(Column<?> column){
        columns.add(column);
    }

    List<Column<?>> getColumns(){
        return columns;
    } 

    Column<?> getColumn(String name){
        for (Column<?> column : columns) {
            if (column.getName() == name){
                return column;
            }
        }
        throw new AppException(ErrorCode.COLUMN_NOT_FOUND);
    }
}
