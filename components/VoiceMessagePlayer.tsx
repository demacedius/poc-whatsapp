import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useEffect, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AudioWaveform from './AudioWaveform';


interface VoiceMessagePlayerProps {
  uri: string;
  waveform?: number[];
  isSender?: boolean;
}

interface AVPlaybackStatus {
  isLoaded: boolean;
  durationMillis?: number;
  positionMillis?: number;
  didJustFinish?: boolean;
  error?: string;
}

const VoiceMessagePlayer: React.FC<VoiceMessagePlayerProps> = ({ uri, waveform = [], isSender }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const progress = new Animated.Value(0);

  

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  useEffect(() => {
    if (uri) {
      loadSound();
    }
  }, [uri]);

  const loadSound = async () => {
    const { sound, status } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: false },
      onPlaybackStatusUpdate
    );
    if (status.isLoaded) {
      setSound(sound);
      setDuration(status.durationMillis || 0);
    } else if (status.error) {
      console.error('Error loading sound:', status.error);
    }
  };

  const onPlaybackStatusUpdate = (status: Audio.AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
        progress.setValue(0);
      }
    }
  };

  const handlePlayPause = async () => {
    if (!sound) {
      return;
    }
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
    setIsPlaying(!isPlaying);
  };
  
  const formatTime = (milliseconds: number) => {
    const totalSeconds = milliseconds / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  useEffect(() => {
    if (isPlaying) {
      progress.setValue(position / duration);
      Animated.timing(progress, {
        toValue: 1,
        duration: duration - position,
        useNativeDriver: false,
      }).start();
    } else {
      progress.stopAnimation();
    }
  }, [isPlaying]);

  return (
    <View style={[styles.container, isSender ? styles.sender : styles.receiver]}>
      <TouchableOpacity onPress={handlePlayPause}>
        <Ionicons
          name={isPlaying ? "pause" : "play"}
          size={24}
          color="white"
        />
      </TouchableOpacity>
      <View style={styles.soundBarsContainer}>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.waveformScrollView}>
          <AudioWaveform waveform={waveform} color="white" position={position} duration={duration} isPlaying={isPlaying} />
        </ScrollView>
      </View>
      <Text style={styles.timerText}>{formatTime(duration)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    padding: 10,
    marginVertical: 5,
    maxWidth: '80%', 
  },
  sender: {
    backgroundColor: 'blue',
    alignSelf: 'flex-end',
    
  },
  receiver: {
    backgroundColor: 'green',
    alignSelf: 'flex-start',
  },
  soundBarsContainer: { 
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
    marginHorizontal: 10,
    position: 'relative',
    flex: 1,  
  },
  waveformScrollView: {
    flexGrow: 1,
    flexShrink: 1,
  },
  soundBar: {
    width: 2,
    borderRadius: 1,
    marginHorizontal: 1,
  },
  playhead: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#075E54',
  },
  timerText: {
    color: 'white',
    fontSize: 14,
  },
});

export default VoiceMessagePlayer;