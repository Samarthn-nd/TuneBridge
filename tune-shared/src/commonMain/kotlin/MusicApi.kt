package com.tunebridge.shared

import io.ktor.client.*
import io.ktor.client.request.*
import io.ktor.client.call.*
import io.ktor.client.statement.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

@Serializable
data class Track(val id: String, val title: String, val artist: String, val previewUrl: String)

@Serializable
data class ITunesTrack(
    val trackId: Long,
    val trackName: String,
    val artistName: String,
    val previewUrl: String = ""
)

@Serializable
data class ITunesResponse(
    val resultCount: Int,
    val results: List<ITunesTrack>
)

object MusicApi {
    private val httpClient = HttpClient()

    // Mock data for testing when API fails
    private val mockTracks = listOf(
        Track("1", "Blinding Lights", "The Weeknd", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/a1/6c/7a/a16c7a6e-4e0e-e4d7-7f7b-7b7b7b7b7b7b/mzaf_12345678901234567890.plus.aac.p.m4a"),
        Track("2", "Shape of You", "Ed Sheeran", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/b2/7d/8e/b27d8e9f-5f1f-f5e8-8f8c-8c8c8c8c8c8c/mzaf_23456789012345678901.plus.aac.p.m4a"),
        Track("3", "Bohemian Rhapsody", "Queen", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview135/v4/c3/8e/9f/c38e9f0a-6a2a-a6f9-9a9d-9d9d9d9d9d9d/mzaf_34567890123456789012.plus.aac.p.m4a"),
        Track("4", "Imagine", "John Lennon", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview145/v4/d4/9f/0a/d49f0a1b-7b3b-b7fa-aaba-babababababa/mzaf_45678901234567890123.plus.aac.p.m4a"),
        Track("5", "Hotel California", "Eagles", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview155/v4/e5/a0/1b/e5a01b2c-8c4c-c8fb-bbcb-cbcbcbcbcbcb/mzaf_56789012345678901234.plus.aac.p.m4a")
    )

    suspend fun searchSongs(query: String): List<Track> {
        return try {
            val itunesUrl = "https://itunes.apple.com/search?term=${query.replace(" ", "%20")}&media=music&entity=song&limit=20"
            println("Searching iTunes API: $itunesUrl")
            
            val response = httpClient.get(itunesUrl) {
                headers {
                    append("Accept", "application/json")
                    append("User-Agent", "TuneBridge/1.0")
                }
            }
            
            val responseText = response.bodyAsText()
            println("Raw response: ${responseText.take(200)}...")
            
            val json = Json { ignoreUnknownKeys = true }
            val itunesResponse = json.decodeFromString<ITunesResponse>(responseText)
            
            val tracks = itunesResponse.results.mapNotNull { track ->
                if (track.previewUrl.isNotEmpty()) {
                    Track(
                        id = track.trackId.toString(),
                        title = track.trackName,
                        artist = track.artistName,
                        previewUrl = track.previewUrl
                    )
                } else null
            }
            
            println("iTunes API returned ${tracks.size} tracks with previews")
            
            if (tracks.isEmpty()) {
                println("No tracks with previews found, using mock data")
                getMockResults(query)
            } else {
                tracks
            }
        } catch (e: Exception) {
            println("API Error: ${e.message}")
            println("Falling back to mock data")
            getMockResults(query)
        }
    }
    
    private fun getMockResults(query: String): List<Track> {
        return if (query.isBlank()) {
            mockTracks.take(10)
        } else {
            mockTracks.filter { track ->
                track.title.contains(query, ignoreCase = true) || 
                track.artist.contains(query, ignoreCase = true)
            }.ifEmpty { 
                // If no matches, return some popular tracks
                mockTracks.take(5)
            }
        }
    }
}
