import React, { useState, useEffect } from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet, 
  StatusBar,
  TouchableOpacity,
  NativeModules,
  Text as RNText
} from 'react-native';
import { 
  TextInput, 
  Text, 
  Snackbar, 
  ProgressBar,
  Provider as PaperProvider,
  MD3LightTheme
} from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const { MusicNativeModule } = NativeModules;

// Simple Icon component using emojis and symbols
const Icon = ({ name, size = 20, color = '#000000', style = {} }) => {
  const iconMap = {
    'magnify': '🔍',
    'close': '✕',
    'play': '▶️',
    'pause': '⏸️',
    'shuffle': '🔀',
    'skip-previous': '⏮️',
    'skip-next': '⏭️',
    'repeat': '🔁',
    'volume-low': '🔉',
    'volume-high': '🔊',
    'devices': '📱',
    'playlist-music': '📝'
  };
  
  return (
    <RNText style={[{ fontSize: size, color }, style]}>
      {iconMap[name] || '❓'}
    </RNText>
  );
};

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
    <TouchableOpacity 
      style={styles.trackItem} 
      onPress={() => playTrack(item)}
      activeOpacity={0.7}
    >
      <View style={styles.trackLeft}>
        <View style={styles.albumArtSmall}>
          <RNText style={styles.albumArtSmallIcon}>🎵</RNText>
        </View>
        <View style={styles.trackInfo}>
          <Text style={styles.trackTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.artistText} numberOfLines={1}>
            {item.artist}
          </Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.playButtonSmall}
        onPress={() => playTrack(item)}
      >
        <Icon 
          name={currentTrack?.id === item.id && playerStatus.isPlaying ? "pause" : "play"} 
          size={20} 
          color="#007AFF"
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          TuneBridge
        </Text>
        <Text style={styles.headerSubtitle}>
          Discover your favorite music
        </Text>
      </View>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <View style={styles.searchIcon}>
            <Icon 
              name="magnify" 
              size={20} 
              color="#666666" 
            />
          </View>
          <TextInput
            placeholder="Search songs, artists..."
            placeholderTextColor="#999999"
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
            returnKeyType="search"
            onSubmitEditing={search}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Icon 
                name="close" 
                size={20} 
                color="#999999" 
              />
            </TouchableOpacity>
          )}
        </View>
        
        {loading && (
          <View style={styles.loadingContainer}>
            <ProgressBar 
              indeterminate 
              color="#007AFF" 
              style={styles.loadingBar}
            />
          </View>
        )}
      </View>

      {/* Results List */}
      <FlatList
        data={tracks}
        keyExtractor={(item) => item.id}
        renderItem={renderTrack}
        contentContainerStyle={[
          styles.listContainer,
          showPlayer && styles.listContainerWithPlayer
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading && tracks.length === 0 ? (
            <View style={styles.emptyState}>
              <RNText style={styles.emptyIcon}>🎼</RNText>
              <Text style={styles.emptyText}>
                {query ? 'No songs found' : 'Start searching for music'}
              </Text>
              <Text style={styles.emptySubtext}>
                {query ? 'Try a different search term' : 'Find your favorite songs and artists'}
              </Text>
            </View>
          ) : null
        }
        ListHeaderComponent={
          tracks.length > 0 ? (
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsText}>
                Found {tracks.length} songs
              </Text>
            </View>
          ) : null
        }
      />

      {/* Music Player */}
      {showPlayer && currentTrack && (
        <View style={styles.playerContainer}>
          <View style={styles.playerContent}>
            {/* Collapse Button */}
            <TouchableOpacity 
              style={styles.collapseButton}
              onPress={() => setShowPlayer(false)}
            >
              <View style={styles.collapseHandle} />
            </TouchableOpacity>

            {/* Album Art & Track Info */}
            <View style={styles.trackSection}>
              <View style={styles.albumArtLarge}>
                <RNText style={styles.albumArtLargeIcon}>🎵</RNText>
              </View>
              
              <View style={styles.trackDetailsLarge}>
                <Text style={styles.nowPlayingTitle} numberOfLines={2}>
                  {currentTrack.title}
                </Text>
                <Text style={styles.nowPlayingArtist} numberOfLines={1}>
                  {currentTrack.artist}
                </Text>
              </View>
            </View>

            {/* Progress Section */}
            <View style={styles.progressSection}>
              <View style={styles.progressContainer}>
                <Text style={styles.timeText}>0:00</Text>
                <ProgressBar 
                  progress={0.3} 
                  color="#007AFF" 
                  style={styles.progressBar}
                />
                <Text style={styles.timeText}>0:30</Text>
              </View>
            </View>

            {/* Main Controls */}
            <View style={styles.controlsSection}>
              <TouchableOpacity style={styles.controlButton}>
                <Icon
                  name="shuffle"
                  size={24}
                  color="#666666"
                />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.controlButton}>
                <Icon
                  name="skip-previous"
                  size={32}
                  color="#333333"
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.playButtonLarge}
                onPress={togglePlay}
              >
                <Icon
                  name={playerStatus.isPlaying ? "pause" : "play"}
                  size={36}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.controlButton}>
                <Icon
                  name="skip-next"
                  size={32}
                  color="#333333"
                />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.controlButton}>
                <Icon
                  name="repeat"
                  size={24}
                  color="#666666"
                />
              </TouchableOpacity>
            </View>

            {/* Volume Controls */}
            <View style={styles.volumeSection}>
              <TouchableOpacity onPress={() => adjustVolume(false)}>
                <Icon
                  name="volume-low"
                  size={20}
                  color="#666666"
                />
              </TouchableOpacity>
              
              <View style={styles.volumeSliderContainer}>
                <ProgressBar 
                  progress={playerStatus.volume / 10} 
                  color="#007AFF" 
                  style={styles.volumeSlider}
                />
              </View>
              
              <TouchableOpacity onPress={() => adjustVolume(true)}>
                <Icon
                  name="volume-high"
                  size={20}
                  color="#666666"
                />
              </TouchableOpacity>
            </View>

            {/* Additional Controls */}
            <View style={styles.bottomControls}>
              <TouchableOpacity style={styles.bottomControlButton}>
                <Icon
                  name="devices"
                  size={20}
                  color="#666666"
                />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.bottomControlButton}>
                <Icon
                  name="playlist-music"
                  size={20}
                  color="#666666"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
    backgroundColor: '#FFFFFF' 
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 24,
    paddingHorizontal: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    color: '#000000',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#666666',
    fontSize: 16,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 24,
    paddingHorizontal: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  searchIcon: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    color: '#000000',
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    marginTop: 8,
  },
  loadingBar: {
    height: 2,
    borderRadius: 1,
    backgroundColor: 'transparent',
  },
  listContainer: { 
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  listContainerWithPlayer: {
    paddingBottom: 400,
  },
  resultsHeader: {
    paddingVertical: 16,
  },
  resultsText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginVertical: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  trackLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  albumArtSmall: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  albumArtSmallIcon: {
    fontSize: 20,
    color: '#666666',
  },
  trackInfo: {
    flex: 1,
    marginRight: 12,
  },
  trackTitle: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  artistText: { 
    color: '#666666',
    fontSize: 14,
  },
  playButtonSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: { 
    fontSize: 18,
    color: '#333333',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  // Player Styles
  playerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 1000,
  },
  playerContent: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 24,
  },
  collapseButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  collapseHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
  },
  trackSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  albumArtLarge: {
    width: 280,
    height: 280,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  albumArtLargeIcon: {
    fontSize: 80,
    color: '#666666',
  },
  trackDetailsLarge: {
    alignItems: 'center',
    width: '100%',
  },
  nowPlayingTitle: {
    color: '#000000',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  nowPlayingArtist: {
    color: '#666666',
    fontSize: 16,
    textAlign: 'center',
  },
  progressSection: {
    paddingVertical: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: '#666666',
    fontSize: 12,
    width: 40,
    textAlign: 'center',
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 12,
    backgroundColor: '#E5E5E5',
  },
  controlsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  playButtonLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  volumeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  volumeSliderContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  volumeSlider: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E5E5',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  bottomControlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  snackbar: {
    marginBottom: 16,
    backgroundColor: '#007AFF',
  },
});

export default function App() {
  const lightTheme = {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      primary: '#007AFF',
      surface: '#FFFFFF',
      background: '#FFFFFF',
    },
  };

  return (
    <SafeAreaProvider>
      <PaperProvider theme={lightTheme}>
        <AppContent />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
