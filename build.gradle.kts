plugins {
    kotlin("jvm") version "1.9.23"
    id("org.jetbrains.compose") version "1.6.10"
}

repositories {
    google()
    mavenCentral()
}

dependencies {
    implementation(compose.desktop.currentOs)
    // JSON / config handling
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin:2.17.2")
    implementation("com.fasterxml.jackson.dataformat:jackson-dataformat-yaml:2.17.2")
    // Cross-platform app dirs
    implementation("net.harawata:appdirs:1.2.1")

    implementation("net.harawata:appdirs:1.2.1")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin:2.17.2")
    
    // Logging facade
    implementation("io.github.microutils:kotlin-logging-jvm:3.0.5")
    // Backend (logback for rotation, flexible config)
    implementation("ch.qos.logback:logback-classic:1.5.6")
}

compose.desktop {
    application {
        mainClass = "com.homesearch.MainKt"
        nativeDistributions {
            targetFormats(org.jetbrains.compose.desktop.application.dsl.TargetFormat.Dmg,
                          org.jetbrains.compose.desktop.application.dsl.TargetFormat.Msi,
                          org.jetbrains.compose.desktop.application.dsl.TargetFormat.Deb)
            packageName = "HomeSearch"
            packageVersion = "1.0.0"
            macOS {
                iconFile.set(project.file("src/main/resources/icons/app_icon.png"))
            }
            windows {
                iconFile.set(project.file("src/main/resources/icons/app_icon.png"))
            }
        }
    }
}
