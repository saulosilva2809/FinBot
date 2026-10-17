package com.chat.springia.controller;

import com.chat.springia.dto.UploadResponse;
import com.chat.springia.service.DocumentService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping("/upload")
    public List<UploadResponse> list() {
        return documentService.list();
    }

    @PostMapping("/upload")
    public UploadResponse upload(@RequestParam("file") MultipartFile file) throws IOException {
        return documentService.add(file);
    }

    @DeleteMapping("/upload")
    public void remove(@RequestParam(value = "name", required = false) String name) {
        if (name == null) {
            documentService.clear();
        } else {
            documentService.remove(name);
        }
    }
}
