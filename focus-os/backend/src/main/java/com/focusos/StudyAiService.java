package com.focusos;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class StudyAiService {
    private final HttpClient client;
    private final ObjectMapper mapper;
    private final String apiKey, apiUrl, model;
    private final int timeout;

    public StudyAiService(ObjectMapper mapper,
            @Value("${ai.api.key:}") String apiKey,
            @Value("${ai.api.url}") String apiUrl,
            @Value("${ai.model}") String model,
            @Value("${ai.timeout-seconds:45}") int timeout) {
        this.mapper = mapper;
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
        this.model = model;
        this.timeout = timeout;
        this.client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
    }

    public String respond(String command, String prompt) throws Exception {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("AI_API_KEY is not configured on the backend.");
        }
        String system = switch (command.toLowerCase()) {
            case "explain" -> "Teach the topic using the Feynman technique. Use plain language, a relatable analogy, step-by-step explanation, and key takeaways. Keep it terminal-friendly.";
            case "quiz" -> "Create exactly 3 multiple-choice questions about the topic. For each, provide a question, exactly three numbered options, the correct answer number, and a one-sentence explanation. Format strictly as JSON: {\"questions\":[{\"question\":\"...\",\"options\":[\"...\",\"...\",\"...\"],\"answer\":1,\"explanation\":\"...\"}]}";
            case "summarize" -> "Summarize the supplied study notes into concise bullet points. Preserve important facts, definitions, and formulas.";
            default -> "Answer the student's question accurately and concisely. Use clear headings and practical examples when useful.";
        };
        Map<String, Object> payload = Map.of(
            "model", model,
            "messages", List.of(
                Map.of("role", "system", "content", system),
                Map.of("role", "user", "content", prompt)
            ),
            "temperature", 0.4
        );
        HttpRequest request = HttpRequest.newBuilder(URI.create(apiUrl))
            .timeout(Duration.ofSeconds(timeout))
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer " + apiKey)
            .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(payload)))
            .build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IllegalStateException("Provider HTTP " + response.statusCode() + ": " + response.body());
        }
        JsonNode root = mapper.readTree(response.body());
        JsonNode content = root.path("choices").path(0).path("message").path("content");
        if (content.isMissingNode() || content.isNull()) throw new IllegalStateException("Provider response did not contain choices[0].message.content.");
        return content.asText();
    }
}