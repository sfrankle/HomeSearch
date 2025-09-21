package com.homesearch

import androidx.compose.material.Button
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Text
import androidx.compose.runtime.*
import androidx.compose.foundation.layout.Column
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.application
import com.homesearch.data.ConfigManager
import mu.KotlinLogging
import com.homesearch.core.AppPaths
import org.slf4j.LoggerFactory

fun main() {
    // Configure log dir for Logback
    System.setProperty("HOMESARCH_LOG_DIR", AppPaths.logsDir.absolutePath)

    val logger = KotlinLogging.logger {}
    logger.info { "Starting HomeSearch v1.0.0" }
    logger.info { "Config file at ${AppPaths.configFile.absolutePath}" }

    val cfg = ConfigManager.config

    application {
        Window(onCloseRequest = ::exitApplication, title = "HomeSearch") {
            App()
        }
    }
}

@Composable
fun App() {
    var count by remember { mutableStateOf(0) }
    MaterialTheme {
        Column {
            Text("Hello from Compose Desktop! Count = $count")
            Button(onClick = { count++ }) { Text("Click me") }
        }
    }
}
