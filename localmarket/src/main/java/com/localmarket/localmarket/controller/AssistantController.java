package com.localmarket.localmarket.controller;

import com.localmarket.localmarket.dto.AssistantRequest;
import com.localmarket.localmarket.dto.AssistantResponse;
import com.localmarket.localmarket.service.MarketplaceAssistantService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/assistant")
@CrossOrigin(origins = { "http://localhost:5173", "http://127.0.0.1:5173" })
public class AssistantController {

    private final MarketplaceAssistantService assistantService;

    public AssistantController(MarketplaceAssistantService assistantService) {
        this.assistantService = assistantService;
    }

    @PostMapping("/chat")
    public AssistantResponse chat(@RequestBody AssistantRequest request) {
        return assistantService.chat(request);
    }
}
