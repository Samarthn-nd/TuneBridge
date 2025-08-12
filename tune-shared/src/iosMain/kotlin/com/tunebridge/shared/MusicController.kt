package com.tunebridge.shared

import platform.AVFoundation.*
import platform.Foundation.NSURL

actual class MusicController {
    private var player: AVPlayer? = null
    private var playerItem: AVPlayerItem? = null

    actual val isPlaying: Boolean
        get() = player?.rate != 0.0f

    actual var volume: Int = 5

    actual fun play(track: Track) {
        val url = NSURL(string = track.previewUrl)
        playerItem = AVPlayerItem(uRL = url)
        player = AVPlayer(playerItem = playerItem)
        setVolumeLevel(volume)
        player?.play()
    }

    actual fun resume() {
        player?.play()
    }

    actual fun pause() {
        player?.pause()
    }

    actual fun volumeUp() {
        if (volume < 10) {
            volume++
            setVolumeLevel(volume)
        }
    }

    actual fun volumeDown() {
        if (volume > 0) {
            volume--
            setVolumeLevel(volume)
        }
    }

    private fun setVolumeLevel(vol: Int) {
        player?.volume = vol.toFloat() / 10.0f
    }

    actual fun getStatus(): PlayerStatus {
        return PlayerStatus(isPlaying, volume)
    }
}
