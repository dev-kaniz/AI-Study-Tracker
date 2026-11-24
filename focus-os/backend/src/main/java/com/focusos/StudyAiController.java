package com.focusos;

import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/study")
@CrossOrigin(origins = "*")
public class StudyAiController {
    private final StudyAiService service;

    public StudyAiController(StudyAiService service) {
        this.service = service;
    }

    @PostMapping("/ai")
    public ResponseEntity<Map<String, String>> ask(@RequestBody AiRequest request) {
        if (request == null || request.command() == null || request.prompt() == null
                || request.prompt().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("response", "A command and non-empty prompt are required."));
        }
        try {
            return ResponseEntity.ok(Map.of("response", service.respond(request.command(), request.prompt())));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("response", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of("response", "AI provider request failed: " + ex.getMessage()));
        }
    }

    public record AiRequest(String command, String prompt) {}
}