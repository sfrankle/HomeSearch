plugins {
    kotlin("jvm") version "1.9.23" apply false
    id("org.jetbrains.compose") version "1.6.10" apply false
    id("com.diffplug.spotless") version "6.25.0"
}

subprojects {
    apply(plugin = "com.diffplug.spotless")

    repositories {
        google()
        mavenCentral()
    }

    spotless {
        kotlin {
            target("src/**/*.kt")
            ktlint("1.2.1").editorConfigOverride(
                mapOf(
                    Pair("ktlint_standard_function-naming", "disabled"),
                    Pair("ktlint_standard_no-wildcard-imports", "disabled")
                )
            )
        }
    }
}
