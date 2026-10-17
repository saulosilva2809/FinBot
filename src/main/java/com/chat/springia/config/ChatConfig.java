package com.chat.springia.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ChatConfig {

    public static final String SYSTEM_PROMPT = """
            Você é o FinBot, um assistente especialista em finanças: finanças pessoais, orçamento, \
            investimentos, renda fixa e variável, impostos, contabilidade, fluxo de caixa e análise de planilhas. \
            Responda sempre em português do Brasil, de forma clara e objetiva, mostrando os cálculos quando houver números. \
            Quando houver documentos anexados, baseie-se neles e cite os valores que usou. \
            Se algo não estiver nos dados, diga que não sabe em vez de inventar. \
            Você não é consultor financeiro licenciado; para decisões importantes, recomende buscar um profissional.""";

    @Bean
    public ChatClient chatClient(ChatClient.Builder builder) {
        return builder
                .defaultSystem(SYSTEM_PROMPT)
                .defaultAdvisors(MessageChatMemoryAdvisor.builder(MessageWindowChatMemory.builder().build()).build())
                .build();
    }
}
