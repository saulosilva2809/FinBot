package com.chat.springia.service;

import com.chat.springia.config.ChatConfig;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class ChatService {

    private static final String NO_DOCS = """

            Nenhum arquivo foi enviado pelo usuário. Você NÃO tem acesso a nenhuma planilha ou documento. \
            Se o usuário perguntar sobre dados de arquivos, peça que ele envie o arquivo antes de responder.""";

    private final ChatClient chatClient;
    private final DocumentService documentService;

    public ChatService(ChatClient chatClient, DocumentService documentService) {
        this.chatClient = chatClient;
        this.documentService = documentService;
    }

    public String ask(String message) {
        var prompt = chatClient.prompt();
        if (documentService.isEmpty()) {
            prompt = prompt.system(ChatConfig.SYSTEM_PROMPT + NO_DOCS);
        } else {
            prompt = prompt.system(s -> s
                    .text(ChatConfig.SYSTEM_PROMPT + "\n\nDocumentos anexados pelo usuário:\n{docs}")
                    .param("docs", documentService.asContext()));
        }
        return prompt.user(message).call().content();
    }
}
