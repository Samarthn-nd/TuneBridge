package com.tunebridge

import com.facebook.react.bridge.*
import com.tunebridge.shared.MusicController
import com.tunebridge.shared.MusicApi
import com.tunebridge.shared.Track
import kotlinx.coroutines.*
import kotlinx.coroutines.Dispatchers.IO

class MusicNativeModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {
    
    private val musicController = MusicController()

    override fun getName() = "MusicNativeModule"

    @ReactMethod
    fun searchMusic(query: String, promise: Promise) {
        CoroutineScope(IO).launch {
            try {
                println("Native Module: Starting search for: $query")
                val tracks = MusicApi.searchSongs(query)
                println("Native Module: Got ${tracks.size} tracks from API")
                val trackArray = Arguments.createArray()
                
                for (track in tracks) {
                    println("Native Module: Adding track: ${track.title} by ${track.artist}")
                    val trackMap = Arguments.createMap()
                    trackMap.putString("id", track.id)
                    trackMap.putString("title", track.title)
                    trackMap.putString("artist", track.artist)
                    trackMap.putString("previewUrl", track.previewUrl)
                    trackArray.pushMap(trackMap)
                }
                
                withContext(Dispatchers.Main) {
                    promise.resolve(trackArray)
                }
            } catch (e: Exception) {
                println("Native Module: Search error: ${e.message}")
                withContext(Dispatchers.Main) {
                    promise.reject("SEARCH_ERROR", e.message)
                }
            }
        }
    }
    
    @ReactMethod
    fun play(trackData: ReadableMap, promise: Promise) {
        try {
            val track = Track(
                id = trackData.getString("id")!!,
                title = trackData.getString("title")!!,
                artist = trackData.getString("artist")!!,
                previewUrl = trackData.getString("previewUrl")!!
            )
            println("Native Module: Playing track: ${track.title} with URL: ${track.previewUrl}")
            musicController.play(track)
            val result = Arguments.createMap()
            result.putBoolean("isPlaying", musicController.isPlaying)
            println("Native Module: Play result - isPlaying: ${musicController.isPlaying}")
            promise.resolve(result)
        } catch (e: Exception) {
            println("Native Module: Play error: ${e.message}")
            promise.reject("PLAY_ERROR", e.message)
        }
    }

    @ReactMethod
    fun resume(promise: Promise) {
        try {
            musicController.resume()
            val result = Arguments.createMap()
            result.putBoolean("isPlaying", musicController.isPlaying)
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("PLAY_ERROR", e.message)
        }
    }
    
    @ReactMethod
    fun pause(promise: Promise) {
        try {
            musicController.pause()
            val result = Arguments.createMap()
            result.putBoolean("isPlaying", musicController.isPlaying)
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("PAUSE_ERROR", e.message)
        }
    }
    
    @ReactMethod
    fun volumeUp(promise: Promise) {
        try {
            musicController.volumeUp()
            val result = Arguments.createMap()
            result.putInt("volume", musicController.volume)
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("VOLUME_ERROR", e.message)
        }
    }
    
    @ReactMethod
    fun volumeDown(promise: Promise) {
        try {
            musicController.volumeDown()
            val result = Arguments.createMap()
            result.putInt("volume", musicController.volume)
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("VOLUME_ERROR", e.message)
        }
    }
    
    @ReactMethod
    fun getStatus(promise: Promise) {
        try {
            val result = Arguments.createMap()
            val status = musicController.getStatus()
            result.putBoolean("isPlaying", status.isPlaying)
            result.putInt("volume", status.volume)
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("STATUS_ERROR", e.message)
        }
    }
}
