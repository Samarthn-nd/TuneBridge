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

    suspend fun searchSongs(query: String): List<Track> {
        val deezerUrl = "https://api.deezer.com/search?q=${query}"
        val response: DeezerResponse = httpClient.get(deezerUrl).body()
        return response.data.map {
            Track(it.id.toString(), it.title, it.artist.name)
        }
    }
}

@Serializable
data class DeezerResponse(val data: List<DeezerTrack>)
@Serializable
data class DeezerTrack(val id: Int, val title: String, val artist: DeezerArtist)
@Serializable
data class DeezerArtist(val name: String)
