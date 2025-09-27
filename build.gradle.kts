plugins {
    // Apply Spotless only at the root
    id("com.diffplug.spotless") version "6.25.0"
}

subprojects {
    apply(plugin = "com.diffplug.spotless")

    // 🔑 Add repos so Spotless can resolve ktlint
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
