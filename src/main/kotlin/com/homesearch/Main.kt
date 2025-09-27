package com.homesearch

import androidx.compose.foundation.layout.Column
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.application
import com.homesearch.core.AppPaths
import com.homesearch.data.ConfigManager
import com.homesearch.data.db.DatabaseFactory
import javax.swing.JOptionPane
import mu.KotlinLogging

fun main() {
    // Point Logback to the right log dir
    System.setProperty("HOMESEARCH_LOG_DIR", AppPaths.logsDir.absolutePath)

    val logger = KotlinLogging.logger {}

    // Log startup info
    val appMetadata = ConfigManager.appMetadata
    logger.info { "Starting ${appMetadata.name} v${appMetadata.version}" }
    logger.info { "Config file at ${AppPaths.configFile.absolutePath}" }
    logger.info {
        "Running on ${System.getProperty(
            "os.name",
        )} ${System.getProperty("os.version")} (${System.getProperty("os.arch")})"
    }

    // Initialize database
    try {
        DatabaseFactory.init()
        logger.info { "Database initialized successfully" }
    } catch (e: Exception) {
        logger.error(e) { "Failed to initialize database" }
        JOptionPane.showMessageDialog(
                null,
                "Failed to initialize database. Check logs for details.",
                "${appMetadata.name} Database Error",
                JOptionPane.ERROR_MESSAGE,
        )
        System.exit(1)
    }

    // 🔑 Global handler for uncaught exceptions
    Thread.setDefaultUncaughtExceptionHandler { thread, throwable ->
        logger.error(throwable) { "Unhandled exception in thread ${thread.name}" }

        // Show user-friendly popup (Swing dialog)
        JOptionPane.showMessageDialog(
                null,
                "Oops! Something went wrong.\nDetails were saved to the logs.",
                "${appMetadata.name} Error",
                JOptionPane.ERROR_MESSAGE,
        )
    }

    application {
        Window(
                onCloseRequest = { System.exit(0) },
                title = "${appMetadata.name} v${appMetadata.version}",
        ) { App() }
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
