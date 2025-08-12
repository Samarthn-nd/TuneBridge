import React, { useState, useEffect } from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet, 
  StatusBar,
  TouchableOpacity,
  NativeModules
} from 'react-native';
import { 
  TextInput, 
  Button, 
  Card, 
  Text, 
  Snackbar, 
  IconButton,
  ProgressBar,
  Surface,
  Provider as PaperProvider,
  DefaultTheme
} from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const { MusicNativeModule } = NativeModules;

type Track = {
  id: string;
  title: string;
  artist: string;
  previewUrl: string;
};

type PlayerStatus = {
  isPlaying: boolean;
  volume: number;
};

function AppContent() {
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [playerStatus, setPlayerStatus] = useState<PlayerStatus>({ isPlaying: false, volume: 5 });
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    // Get initial player status
    getPlayerStatus();
  }, []);

  const getPlayerStatus = async () => {
    try {
      const status = await MusicNativeModule.getStatus();
      setPlayerStatus(status);
    } catch (e) {
      console.log('Failed to get status:', e);
    }
  };

  const search = async () => {
    if (!query.trim()) {
      setErrorMsg('Please enter a search term! 🎵');
      return;
    }
    setLoading(true);
    try {
      const result: Track[] = await MusicNativeModule.searchMusic(query);
      setTracks(result);
      if (result.length === 0) {
        setErrorMsg('No songs found. Try a different search! 🔍');
      }
    } catch (e) {
      setErrorMsg('Failed to search songs. Check your internet! 📡');
      console.error('Search error:', e);
    } finally {
      setLoading(false);
    }
  };

  const playTrack = async (track: Track) => {
    try {
      setCurrentTrack(track);
      setShowPlayer(true);
      const result = await MusicNativeModule.play(track);
      setPlayerStatus(prev => ({ ...prev, isPlaying: result.isPlaying }));
    } catch (e) {
      console.error('Failed to play track:', e);
      setErrorMsg('Failed to play track! 🚫');
    }
  };

  const togglePlay = async () => {
    try {
      if (playerStatus.isPlaying) {
        const result = await MusicNativeModule.pause();
        setPlayerStatus(prev => ({ ...prev, isPlaying: result.isPlaying }));
      } else {
        const result = await MusicNativeModule.resume();
        setPlayerStatus(prev => ({ ...prev, isPlaying: result.isPlaying }));
      }
    } catch (e) {
      console.error('Failed to control playback:', e);
      setErrorMsg('Failed to control playback! ⚠️');
    }
  };

  const adjustVolume = async (increase: boolean) => {
    try {
      const result = increase 
        ? await MusicNativeModule.volumeUp()
        : await MusicNativeModule.volumeDown();
      setPlayerStatus(prev => ({ ...prev, volume: result.volume }));
    } catch (e) {
      console.error('Failed to adjust volume:', e);
      setErrorMsg('Failed to adjust volume! 🔊');
    }
  };

  const renderTrack = ({ item }: { item: Track }) => (
    <Card style={styles.trackCard} mode="elevated">
      <TouchableOpacity onPress={() => playTrack(item)}>
        <Card.Content style={styles.trackContent}>
          <View style={styles.trackInfo}>
            <Text variant="titleMedium" style={styles.trackTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text variant="bodyMedium" style={styles.artistText} numberOfLines={1}>
              {item.artist}
            </Text>
          </View>
          <IconButton 
            icon="play" 
            size={24} 
            iconColor="#6200ea"
            onPress={() => playTrack(item)}
          />
        </Card.Content>
      </TouchableOpacity>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6200ea" />
      
      {/* Header */}
      <Surface style={styles.header} elevation={4}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          🎵 TuneBridge
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          Your music, everywhere
        </Text>
      </Surface>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <TextInput
          label="Search for songs or artists"
          mode="outlined"
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
          returnKeyType="search"
          onSubmitEditing={search}
          left={<TextInput.Icon icon="magnify" />}
          outlineColor="#6200ea"
          activeOutlineColor="#6200ea"
        />
        
        <Button
          mode="contained"
          onPress={search}
          loading={loading}
          disabled={loading}
          style={styles.searchButton}
          buttonColor="#6200ea"
          contentStyle={styles.searchButtonContent}
        >
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </View>

      {/* Results List */}
      <FlatList
        data={tracks}
        keyExtractor={(item) => item.id}
        renderItem={renderTrack}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading && tracks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🎼</Text>
              <Text style={styles.emptyText}>
                {query ? 'No songs found' : 'Search for your favorite music'}
              </Text>
              <Text style={styles.emptySubtext}>
                {query ? 'Try a different search term' : 'Discover millions of songs'}
              </Text>
            </View>
          ) : null
        }
      />

      {/* Music Player */}
      {showPlayer && currentTrack && (
        <Surface style={styles.playerContainer} elevation={4}>
          <View style={styles.playerGradient}>
            {/* Now Playing Info */}
            <View style={styles.nowPlayingInfo}>
              <View style={styles.albumArt}>
                <Text style={styles.albumArtIcon}>🎵</Text>
              </View>
              <View style={styles.trackDetails}>
                <Text style={styles.nowPlayingTitle} numberOfLines={1}>
                  {currentTrack.title}
                </Text>
                <Text style={styles.nowPlayingArtist} numberOfLines={1}>
                  {currentTrack.artist}
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <ProgressBar 
              progress={0.3} 
              color="#ffffff" 
              style={styles.progressBar}
            />

            {/* Player Controls */}
            <View style={styles.playerControls}>
              <IconButton
                icon="volume-minus"
                size={28}
                iconColor="#ffffff"
                onPress={() => adjustVolume(false)}
              />
              
              <View style={styles.mainControls}>
                <IconButton
                  icon="skip-previous"
                  size={32}
                  iconColor="#ffffff"
                />
                
                <IconButton
                  icon={playerStatus.isPlaying ? "pause" : "play"}
                  size={48}
                  iconColor="#ffffff"
                  style={styles.playButton}
                  onPress={togglePlay}
                />
                
                <IconButton
                  icon="skip-next"
                  size={32}
                  iconColor="#ffffff"
                />
              </View>

              <IconButton
                icon="volume-plus"
                size={28}
                iconColor="#ffffff"
                onPress={() => adjustVolume(true)}
              />
            </View>

            {/* Volume Indicator */}
            <View style={styles.volumeContainer}>
              <Text style={styles.volumeText}>
                Volume: {playerStatus.volume}/10
              </Text>
              <ProgressBar 
                progress={playerStatus.volume / 10} 
                color="#ffffff" 
                style={styles.volumeBar}
              />
            </View>
          </View>
        </Surface>
      )}

      {/* Snackbar for errors */}
      <Snackbar
        visible={errorMsg.length > 0}
        onDismiss={() => setErrorMsg('')}
        duration={3000}
        style={styles.snackbar}
      >
        {errorMsg}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5' 
  },
  header: {
    backgroundColor: '#6200ea',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.9,
  },
  searchSection: {
    padding: 16,
    backgroundColor: '#ffffff',
    marginHorizontal: 8,
    marginTop: -16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  searchInput: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  searchButton: {
    borderRadius: 12,
  },
  searchButtonContent: {
    paddingVertical: 8,
  },
  listContainer: { 
    padding: 16,
    paddingTop: 8,
  },
  trackCard: { 
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#ffffff',
  },
  trackContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trackInfo: {
    flex: 1,
    marginRight: 8,
  },
  trackTitle: {
    fontWeight: '600',
    color: '#1a1a1a',
  },
  artistText: { 
    color: '#666666',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: { 
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginTop: 8,
  },
  playerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  playerGradient: {
    padding: 20,
    paddingBottom: 30,
    backgroundColor: '#6200ea',
  },
  nowPlayingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  albumArt: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  albumArtIcon: {
    fontSize: 24,
    color: '#ffffff',
  },
  trackDetails: {
    flex: 1,
  },
  nowPlayingTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  nowPlayingArtist: {
    color: '#ffffff',
    fontSize: 14,
    opacity: 0.8,
    marginTop: 2,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  playerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 8,
  },
  volumeContainer: {
    alignItems: 'center',
  },
  volumeText: {
    color: '#ffffff',
    fontSize: 12,
    marginBottom: 8,
    opacity: 0.8,
  },
  volumeBar: {
    width: 200,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  snackbar: {
    marginBottom: 16,
  },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={DefaultTheme}>
        <AppContent />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
