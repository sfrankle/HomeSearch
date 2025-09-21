package com.homesearch.core

import net.harawata.appdirs.AppDirsFactory
import java.io.File

object AppPaths {
    private val appDirs = AppDirsFactory.getInstance()

    // Root "user data" dir (survives reinstalls)
    val dataRoot: File by lazy {
        File(appDirs.getUserDataDir(AppConstants.APP_NAME, null, null)).apply { mkdirs() }
    }

    // Config dir + file
    val configDir: File by lazy {
        File(appDirs.getUserConfigDir(AppConstants.APP_NAME, null, null)).apply { mkdirs() }
    }
    val configFile: File by lazy { File(configDir, "config.json") }

    // Extras: logs + general data
    val logsDir: File by lazy { File(dataRoot, "logs").apply { mkdirs() } }
    val dataDir: File by lazy { File(dataRoot, "data").apply { mkdirs() } }
}
