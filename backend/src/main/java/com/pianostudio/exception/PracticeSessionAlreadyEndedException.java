package com.pianostudio.exception;

public class PracticeSessionAlreadyEndedException extends RuntimeException {
    public PracticeSessionAlreadyEndedException(String message) {
        super(message);
    }
}
