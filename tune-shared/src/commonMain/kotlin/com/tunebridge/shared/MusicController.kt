package com.tunebridge.shared

expect class MusicController {
    val isPlaying: Boolean
    var volume: Int

    fun play(track: Track)
    fun resume()
    fun pause()
    fun volumeUp()
    fun volumeDown()
    fun getStatus(): PlayerStatus
}

data class PlayerStatus(val isPlaying: Boolean, val volume: Int)
