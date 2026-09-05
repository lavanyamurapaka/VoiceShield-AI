package com.voiceshield.ai.dto.admin;

public class SystemConfigDto {
    private String configKey;
    private String configValue;
    private String category;
    private String description;

    public SystemConfigDto() {}

    public SystemConfigDto(String configKey, String configValue, String category, String description) {
        this.configKey = configKey;
        this.configValue = configValue;
        this.category = category;
        this.description = description;
    }

    public String getConfigKey() { return configKey; }
    public void setConfigKey(String configKey) { this.configKey = configKey; }
    public String getConfigValue() { return configValue; }
    public void setConfigValue(String configValue) { this.configValue = configValue; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
