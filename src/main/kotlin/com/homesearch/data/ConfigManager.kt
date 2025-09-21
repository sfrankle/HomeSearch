package com.homesearch.data

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.PropertyNamingStrategies
import com.fasterxml.jackson.module.kotlin.KotlinModule
import com.homesearch.core.AppConstants
import com.homesearch.core.AppPaths
import java.io.File
import mu.KotlinLogging

private val logger = KotlinLogging.logger {}

data class AppMetadata(
        val name: String,
        val version: String,
        val description: String,
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
    private val mapper =
            ObjectMapper()
                    .registerModule(KotlinModule.Builder().build())
                    .setPropertyNamingStrategy(PropertyNamingStrategies.LOWER_CAMEL_CASE)

    private val configFile = AppPaths.configFile

    @Volatile var config: UserAppConfig = load()

    val appMetadata: AppMetadata by lazy { loadAppMetadata() }

    private fun load(): UserAppConfig {
        return runCatching {
            if (configFile.exists()) {
                mapper.readValue(configFile, UserAppConfig::class.java)
            } else {
                UserAppConfig().also { save(it) }
            }
        }
                .getOrElse { e ->
                    logger.error(e) { "Failed to load config, falling back to defaults" }
                    backupCorrupted()
                    UserAppConfig().also { save(it) }
                }
    }

    fun save(newConfig: UserAppConfig = config) {
        runCatching {
            configFile.parentFile?.mkdirs()
            mapper.writerWithDefaultPrettyPrinter().writeValue(configFile, newConfig)
            config = newConfig
        }
                .onFailure { e -> logger.error(e) { "Failed to save config" } }
    }

    private fun backupCorrupted() {
        if (configFile.exists()) {
            val backup = File(configFile.parent, "config.broken.json")
            configFile.copyTo(backup, overwrite = true)
        }
    }

    private fun loadAppMetadata(): AppMetadata {
        return AppMetadata(
                name = AppConstants.APP_NAME,
                version = AppConstants.APP_VERSION,
                description = AppConstants.APP_DESCRIPTION,
        )
    }
}
