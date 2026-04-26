package vn.nguyenlong.taskmanager.core.component;

import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
@RequiredArgsConstructor
public class LocalizationComponent {
    private final MessageSource messageSource;

    public String getLocalizedMessage(String messageKey, Object... objects) {
        Locale locale = LocaleContextHolder.getLocale();
        return messageSource.getMessage(messageKey, objects, messageKey, locale);
    }
}
