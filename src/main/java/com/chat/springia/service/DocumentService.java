package com.chat.springia.service;

import com.chat.springia.dto.UploadResponse;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class DocumentService {

    private static final int MAX_DOC_CHARS = 30_000;

    private record Stored(UploadResponse info, String text) {}

    private final Map<String, Stored> documents = new ConcurrentHashMap<>();

    public UploadResponse add(MultipartFile file) throws IOException {
        var reader = new TikaDocumentReader(new ByteArrayResource(file.getBytes()));
        String text = reader.get().stream().map(Document::getText).collect(Collectors.joining("\n"));
        boolean truncated = text.length() > MAX_DOC_CHARS;
        if (truncated) {
            text = text.substring(0, MAX_DOC_CHARS);
        }
        String name = String.valueOf(file.getOriginalFilename());
        var info = new UploadResponse(name, text.length(), truncated);
        documents.put(name, new Stored(info, text));
        return info;
    }

    public List<UploadResponse> list() {
        return documents.values().stream().map(Stored::info).sorted(java.util.Comparator.comparing(UploadResponse::name)).toList();
    }

    public boolean isEmpty() {
        return documents.isEmpty();
    }

    public String asContext() {
        return documents.entrySet().stream()
                .map(e -> "Arquivo: " + e.getKey() + "\n" + e.getValue().text())
                .collect(Collectors.joining("\n\n---\n\n"));
    }

    public void remove(String name) {
        documents.remove(name);
    }

    public void clear() {
        documents.clear();
    }
}
