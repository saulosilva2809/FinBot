# FinBot 💰

Chat com um assistente especialista em finanças, feito com **Spring Boot** e **Spring AI**, rodando 100% local com o **Ollama**. Você pode enviar planilhas e documentos para a IA analisar.

## Funcionalidades

- Chat com memória da conversa e prompt de especialista em finanças (respostas em português).
- Envio de arquivos **xlsx, xls, csv, pdf, docx e txt** (arraste ou clique), lidos com Apache Tika.
- Interface web simples com tema claro/escuro.
- Tudo local: nenhum dado sai da sua máquina e não há chave de API.

## Tecnologias

- Java 21
- Spring Boot 3.5
- Spring AI 1.0 (Ollama + Tika Document Reader)
- HTML, CSS e JavaScript puros (sem build de frontend)

## Pré-requisitos

- [Java 21](https://adoptium.net/)
- [Maven](https://maven.apache.org/) 3.9+
- [Ollama](https://ollama.com/) rodando em `http://localhost:11434`

Baixe o modelo usado por padrão:

```bash
ollama pull qwen2.5:3b
```

## Como rodar

```bash
mvn spring-boot:run
```

Abra http://localhost:8080.

Para gerar o jar:

```bash
mvn clean package
java -jar target/spring-ia-0.0.1-SNAPSHOT.jar
```

## Configuração

Em `src/main/resources/application.properties`:

| Propriedade | Padrão | Descrição |
|---|---|---|
| `spring.ai.ollama.base-url` | `http://localhost:11434` | Endereço do Ollama |
| `spring.ai.ollama.chat.options.model` | `qwen2.5:3b` | Modelo usado |
| `spring.ai.ollama.chat.options.temperature` | `0.3` | Criatividade das respostas |
| `spring.ai.ollama.chat.options.num-ctx` | `16384` | Tamanho do contexto (tokens) |
| `spring.servlet.multipart.max-file-size` | `10MB` | Tamanho máximo por arquivo |

Modelos maiores (ex.: `qwen2.5:7b`) respondem melhor em planilhas grandes; basta trocar o nome do modelo.

## API

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/chat` | Envia `{"message": "..."}` e recebe `{"reply": "..."}` |
| `GET` | `/upload` | Lista os arquivos enviados |
| `POST` | `/upload` | Envia um arquivo (`multipart/form-data`, campo `file`) |
| `DELETE` | `/upload?name=arquivo.csv` | Remove um arquivo (sem `name`, remove todos) |

Erros são devolvidos como `{"error": "mensagem"}`.

## Estrutura

```
src/main/java/com/chat/springia/
├── controller/   ChatController, DocumentController
├── service/      ChatService, DocumentService
├── dto/          ChatRequest, ChatResponse, UploadResponse, ErrorResponse
├── config/       ChatConfig (ChatClient, prompt e memória)
└── exception/    GlobalExceptionHandler
src/main/resources/static/   index.html, style.css, app.js
samples/                     arquivos de exemplo para testar
```

## Arquivos de exemplo

Na pasta [`samples/`](samples):

- `despesas-2025.csv`: lançamentos de janeiro a março de 2025.
- `relatorio-financeiro-t1-2025.pdf`: relatório do trimestre com metas, dívidas e investimentos.

Perguntas para testar com os dois anexados:

- "Qual categoria teve o maior gasto no trimestre?"
- "Quanto falta para completar a reserva de emergência?"
- "Vale antecipar parcelas do financiamento ou investir?"
