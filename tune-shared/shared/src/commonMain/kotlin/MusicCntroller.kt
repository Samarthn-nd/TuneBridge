package com.tunebridge.shared

class MusicController {
    var isPlaying = false
    var volume = 5

    fun play() {
        isPlaying = true
        // logic to start playing music (mock for now)
    }

    fun pause() {
        isPlaying = false
        // logic to pause music
    }

    fun volumeUp() {
        if (volume < 10) volume++
        // logic to increase volume
    }

    fun volumeDown() {
        if (volume > 0) volume--
        // logic to decrease volume
    }
}
