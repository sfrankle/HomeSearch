package com.homesearch.data

import java.time.LocalDateTime

data class UserSettings(
        val id: Int = 1,
        val language: String = "en",
        val measurementSystem: String = "metric", // "metric" or "imperial"
        val currency: String = "EUR",
        val updatedAt: LocalDateTime = LocalDateTime.now(),
)
