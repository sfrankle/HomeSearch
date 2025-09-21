package com.homesearch.data

import com.fasterxml.jackson.databind.PropertyNamingStrategies
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory
import com.fasterxml.jackson.module.kotlin.KotlinModule
import com.fasterxml.jackson.module.kotlin.readValue
import com.homesearch.core.AppPaths
import java.io.File

data class AppMetadata(
    val name: String,
    val version: String,
    val description: String,
)

data class AppConfig(
    val app: AppMetadata,
    val config: UserAppConfig = UserAppConfig(),
)

data class UserAppConfig(
    val schemaVersion: Int = 1,
    val window: WindowConfig = WindowConfig(),
    val user: UserConfig = UserConfig(),
)

data class WindowConfig(
    val width: Int = 900,
    val height: Int = 700,
    val isMaximized: Boolean = false,
)

data class UserConfig(
    val theme: String = "light",
    val language: String = "en",
)

object ConfigManager {
    private val yamlMapper = com.fasterxml.jackson.databind.ObjectMapper(YAMLFactory())
        .registerModule(KotlinModule.Builder().build())
        .setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE)

    private val jsonMapper = com.fasterxml.jackson.databind.ObjectMapper()
        .registerModule(KotlinModule.Builder().build())
        .setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE)

    private val configFile: File = AppPaths.configFile

    @Volatile
    var config: AppConfig = load()

    private fun createFallbackAppMetadata(): AppMetadata = AppMetadata(
        name = "HomeSearch",
        version = "1.0.0",
        description = "A desktop application for home search functionality",
    )

    private fun load(): AppConfig {
        return try {
            // Load app metadata from YAML (from classpath)
            val appMetadata = try {
                val yamlResource = javaClass.classLoader.getResourceAsStream("application.yaml")
                if (yamlResource != null) {
                    yamlMapper.readValue<AppConfig>(yamlResource).app
                } else {
                    createFallbackAppMetadata()
                }
            } catch (e: Exception) {
                createFallbackAppMetadata()
            }

            // Load user config from JSON (if exists)
            val userConfig = if (configFile.exists()) {
                jsonMapper.readValue<UserAppConfig>(configFile)
            } else {
                UserAppConfig().also { saveUserConfig(it) }
            }

            AppConfig(app = appMetadata, config = userConfig)
        } catch (e: Exception) {
            // If config is corrupt, keep a backup and reset to defaults
            runCatching {
                configFile.copyTo(File(configFile.parentFile, "config.broken.json"), overwrite = true)
            }
            AppConfig(
                app = createFallbackAppMetadata(),
                config = UserAppConfig(),
            ).also { saveUserConfig(it.config) }
        }
    }

    fun save(newConfig: AppConfig = config) {
        saveUserConfig(newConfig.config)
        config = newConfig
    }

    private fun saveUserConfig(userConfig: UserAppConfig) {
        configFile.parentFile?.mkdirs()
        jsonMapper.writerWithDefaultPrettyPrinter().writeValue(configFile, userConfig)
    }
}
