package com.chat.springia.dto;

import jakarta.validation.constraints.NotBlank;

public record ChatRequest(@NotBlank(message = "A mensagem não pode ser vazia") String message) {}
