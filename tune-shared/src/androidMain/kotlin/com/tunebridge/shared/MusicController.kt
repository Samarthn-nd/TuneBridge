package com.tunebridge.shared

import android.media.MediaPlayer
import java.io.IOException

actual class MusicController {
    private var mediaPlayer: MediaPlayer? = null
    private var currentTrack: Track? = null
    private var _isPlaying: Boolean = false

    actual val isPlaying: Boolean
        get() = _isPlaying
    
    actual var volume: Int = 5

    actual fun play(track: Track) {
        try {
            // Stop and release previous player
            if (mediaPlayer != null) {
                mediaPlayer?.stop()
                mediaPlayer?.release()
                _isPlaying = false
            }
            
            currentTrack = track
            println("MusicController: Starting playback for ${track.title}")
            println("MusicController: URL: ${track.previewUrl}")
            
            mediaPlayer = MediaPlayer().apply {
                setOnPreparedListener { mp ->
                    println("MusicController: MediaPlayer prepared, starting playback")
                    setVolumeLevel(volume)
                    mp.start()
                    _isPlaying = true
                }
                setOnCompletionListener {
                    println("MusicController: Playback completed")
                    _isPlaying = false
                }
                setOnErrorListener { _, what, extra ->
                    println("MusicController: MediaPlayer error - what: $what, extra: $extra")
                    _isPlaying = false
                    true // return true to indicate error was handled
                }
                
                try {
                    setDataSource(track.previewUrl)
                    prepareAsync()
                } catch (e: Exception) {
                    println("MusicController: Error setting data source: ${e.message}")
                    _isPlaying = false
                }
            }
        } catch (e: Exception) {
            println("MusicController: Error in play(): ${e.message}")
            _isPlaying = false
        }
    }

    actual fun resume() {
        try {
            if (mediaPlayer != null && !_isPlaying) {
                mediaPlayer?.start()
                _isPlaying = true
                println("MusicController: Resumed playback")
            }
        } catch (e: Exception) {
            println("MusicController: Error in resume(): ${e.message}")
        }
    }

    actual fun pause() {
        try {
            if (mediaPlayer != null && _isPlaying) {
                mediaPlayer?.pause()
                _isPlaying = false
                println("MusicController: Paused playback")
            }
        } catch (e: Exception) {
            println("MusicController: Error in pause(): ${e.message}")
        }
    }

    actual fun volumeUp() {
        if (volume < 10) {
            volume++
            setVolumeLevel(volume)
            println("MusicController: Volume increased to $volume")
        }
    }

    actual fun volumeDown() {
        if (volume > 0) {
            volume--
            setVolumeLevel(volume)
            println("MusicController: Volume decreased to $volume")
        }
    }

    private fun setVolumeLevel(vol: Int) {
        try {
            val volumeFloat = vol.toFloat() / 10.0f
            mediaPlayer?.setVolume(volumeFloat, volumeFloat)
            println("MusicController: Volume set to $volumeFloat")
        } catch (e: Exception) {
            println("MusicController: Error setting volume: ${e.message}")
        }
    }

    actual fun getStatus(): PlayerStatus {
        return PlayerStatus(_isPlaying, volume)
    }
}
