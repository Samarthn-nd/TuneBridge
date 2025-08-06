package com.tunebridge

import com.facebook.react.bridge.*
import com.tunebridge.shared.MusicController
import com.tunebridge.shared.MusicApi
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
                val tracks = MusicApi.searchSongs(query)
                val trackArray = Arguments.createArray()
                
                for (track in tracks) {
                    val trackMap = Arguments.createMap()
                    trackMap.putString("id", track.id)
                    trackMap.putString("title", track.title)
                    trackMap.putString("artist", track.artist)
                    trackArray.pushMap(trackMap)
                }
                
                withContext(Dispatchers.Main) {
                    promise.resolve(trackArray)
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    promise.reject("SEARCH_ERROR", e.message)
                }
            }
        }
    }
    
    @ReactMethod
    fun play(promise: Promise) {
        try {
            musicController.play()
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
            result.putBoolean("isPlaying", musicController.isPlaying)
            result.putInt("volume", musicController.volume)
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("STATUS_ERROR", e.message)
        }
    }
}
