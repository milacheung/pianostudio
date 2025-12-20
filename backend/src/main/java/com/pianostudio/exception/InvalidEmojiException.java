package com.pianostudio.exception;

public class InvalidEmojiException extends RuntimeException {
    public InvalidEmojiException(String message) {
        super(message);
    }
}
