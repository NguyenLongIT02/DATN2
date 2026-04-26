package vn.nguyenlong.taskmanager.core.component;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TranslateMessage {

    private final LocalizationComponent localizationComponent;

    public String translate(String message) {
        return localizationComponent.getLocalizedMessage(message);
    }

    public String translate(String message, Object... listMessage) {
        return localizationComponent.getLocalizedMessage(message, listMessage);
    }
}
