package com.homesearch

import androidx.compose.material.Button
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Text
import androidx.compose.runtime.*
import androidx.compose.foundation.layout.Column
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.application

fun main() = application {
    Window(onCloseRequest = ::exitApplication, title = "HomeSearch") {
        App()
    }
}

@Composable
fun App() {
    var count by remember { mutableStateOf(0) }

    MaterialTheme {
        Column {
            Text("Hello from Compose Desktop! Count = $count")
            Button(onClick = { count++ }) {
                Text("Click me")
            }
        }
    }
}
