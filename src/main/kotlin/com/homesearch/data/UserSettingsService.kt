package com.homesearch.data

import java.time.LocalDateTime
import mu.KotlinLogging
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction

private val logger = KotlinLogging.logger {}

object UserSettingsService {

    fun getSettings(): UserSettings {
        return transaction {
            val row = UserSettingsTable.selectAll().firstOrNull()
            if (row == null) {
                logger.warn { "No user settings found, returning defaults" }
                UserSettings()
            } else {
                UserSettings(
                        id = row[UserSettingsTable.id],
                        language = row[UserSettingsTable.language],
                        measurementSystem = row[UserSettingsTable.measurementSystem],
                        currency = row[UserSettingsTable.currency],
                        updatedAt = LocalDateTime.parse(row[UserSettingsTable.updatedAt]),
                )
            }
        }
    }

    fun updateSettings(new: UserSettings): UserSettings {
        return transaction {
            UserSettingsTable.update({ UserSettingsTable.id eq new.id }) {
                it[language] = new.language
                it[measurementSystem] = new.measurementSystem
                it[currency] = new.currency
                it[updatedAt] = LocalDateTime.now().toString()
            }

            // Return the updated settings
            getSettings()
        }
    }
}

object UserSettingsTable : Table("user_settings") {
    val id = integer("id").autoIncrement()
    val language = varchar("language", 10).default("en")
    val measurementSystem = varchar("measurement_system", 20).default("metric")
    val currency = varchar("currency", 10).default("EUR")
    val updatedAt = varchar("updated_at", 50).default(LocalDateTime.now().toString())

    override val primaryKey = PrimaryKey(id)
}
