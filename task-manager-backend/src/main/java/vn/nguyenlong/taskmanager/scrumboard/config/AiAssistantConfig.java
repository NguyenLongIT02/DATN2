package vn.nguyenlong.taskmanager.scrumboard.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@Getter
public class AiAssistantConfig {

    @Value("${ai.assistant.enabled:true}")
    private boolean enabled;

    @Value("${ai.assistant.provider:groq}")
    private String provider;

    @Value("${ai.assistant.base-url:https://api.groq.com/openai/v1}")
    private String baseUrl;

    @Value("${ai.assistant.api-key:}")
    private String apiKey;

    @Value("${ai.assistant.model:llama-3.1-8b-instant}")
    private String model;

    @Value("${ai.assistant.temperature:0.2}")
    private double temperature;

    @Value("${ai.assistant.max-tokens:400}")
    private int maxTokens;

    @Value("${ai.assistant.timeout-ms:20000}")
    private int timeoutMs;

    public boolean hasApiKey() {
        return apiKey != null && !apiKey.trim().isEmpty();
    }

    public boolean isReady() {
        return enabled && hasApiKey();
    }

    public String getChatCompletionsUrl() {
        if (baseUrl == null || baseUrl.trim().isEmpty()) {
            return "https://api.groq.com/openai/v1/chat/completions";
        }

        String normalizedBaseUrl = baseUrl.endsWith("/")
                ? baseUrl.substring(0, baseUrl.length() - 1)
                : baseUrl;

        return normalizedBaseUrl + "/chat/completions";
    }
}
