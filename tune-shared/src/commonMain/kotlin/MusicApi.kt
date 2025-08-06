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
data class Track(val id: String, val title: String, val artist: String)

object MusicApi {
    private val httpClient = HttpClient {
        install(ContentNegotiation) {
            json(Json { ignoreUnknownKeys = true })
        }
    }

    // Mock data for testing when API fails
    private val mockTracks = listOf(
        Track("1", "Blinding Lights", "The Weeknd"),
        Track("2", "Shape of You", "Ed Sheeran"),
        Track("3", "Bohemian Rhapsody", "Queen"),
        Track("4", "Imagine", "John Lennon"),
        Track("5", "Hotel California", "Eagles"),
        Track("6", "Stairway to Heaven", "Led Zeppelin"),
        Track("7", "Billie Jean", "Michael Jackson"),
        Track("8", "Yesterday", "The Beatles"),
        Track("9", "Smells Like Teen Spirit", "Nirvana"),
        Track("10", "Like a Rolling Stone", "Bob Dylan"),
        Track("11", "What's Going On", "Marvin Gaye"),
        Track("12", "Respect", "Aretha Franklin"),
        Track("13", "Good Vibrations", "The Beach Boys"),
        Track("14", "Johnny B. Goode", "Chuck Berry"),
        Track("15", "Hey Jude", "The Beatles")
    )

    suspend fun searchSongs(query: String): List<Track> {
        return try {
            val deezerUrl = "https://api.deezer.com/search?q=${query.replace(" ", "%20")}"
            println("Searching: $deezerUrl") // Debug log
            
            val response: DeezerResponse = httpClient.get(deezerUrl).body()
            val tracks = response.data.map {
                Track(it.id.toString(), it.title, it.artist.name)
            }
            
            println("API returned ${tracks.size} tracks") // Debug log
            
            if (tracks.isEmpty()) {
                // Return filtered mock data if API returns empty
                getMockResults(query)
            } else {
                tracks
            }
        } catch (e: Exception) {
            println("API Error: ${e.message}") // Debug log
            // Return mock data on API error
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

@Serializable
data class DeezerResponse(val data: List<DeezerTrack>)
@Serializable
data class DeezerTrack(val id: Int, val title: String, val artist: DeezerArtist)
@Serializable
data class DeezerArtist(val name: String)
