plugins {
    kotlin("jvm") version "1.9.23"
    id("org.jetbrains.compose") version "1.6.10"
    id("com.diffplug.spotless") version "6.25.0"
}

java { toolchain { languageVersion.set(JavaLanguageVersion.of(17)) } }

kotlin { jvmToolchain(17) }

repositories {
    google()
    mavenCentral()
}

dependencies {
    // UI
    implementation(compose.desktop.currentOs)
    implementation(compose.material3)
    implementation(compose.runtime)
    implementation(compose.foundation)
    implementation(compose.ui)

    // JSON / config handling
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin:2.18.2")
    implementation("com.fasterxml.jackson.dataformat:jackson-dataformat-yaml:2.18.2")
    implementation("net.harawata:appdirs:1.2.1")

    // Logging
    implementation("io.github.microutils:kotlin-logging-jvm:3.0.5")
    implementation("ch.qos.logback:logback-classic:1.5.6")

    // Database
    implementation("org.xerial:sqlite-jdbc:3.46.0.0")
    implementation("org.jetbrains.exposed:exposed-core:0.50.1")
    implementation("org.jetbrains.exposed:exposed-dao:0.50.1")
    implementation("org.jetbrains.exposed:exposed-jdbc:0.50.1")

    // --- tests ---
    testImplementation(kotlin("test"))
    testImplementation("org.junit.jupiter:junit-jupiter:5.10.2")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher:1.10.2")
}

val appName = "HomeSearch"
val appVersion = "1.0.0"
val appPackage = "com.homesearch"

compose.desktop {
    application {
        mainClass = "$appPackage.MainKt"
        nativeDistributions {
            targetFormats(
                    org.jetbrains.compose.desktop.application.dsl.TargetFormat.Dmg,
                    org.jetbrains.compose.desktop.application.dsl.TargetFormat.Msi,
                    org.jetbrains.compose.desktop.application.dsl.TargetFormat.Deb,
            )
            packageName = appName
            packageVersion = appVersion
            macOS { iconFile.set(project.file("src/main/resources/icons/app_icon.png")) }
            windows { iconFile.set(project.file("src/main/resources/icons/app_icon.png")) }
        }
    }
}

spotless {
    kotlin {
        target("src/**/*.kt")
        ktlint("1.2.1")
                .editorConfigOverride(
                        mapOf(
                                // Compose convention: allow PascalCase composables
                                "ktlint_standard_function-naming" to "disabled",
                                // Optional: allow *
                                "ktlint_standard_no-wildcard-imports" to "disabled"
                        )
                )
    }
}

tasks.test { useJUnitPlatform() }
