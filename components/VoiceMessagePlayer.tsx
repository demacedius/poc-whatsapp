import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import AudioWaveform from './AudioWaveform';

interface VoiceMessagePlayerProps {
  uri: string;
  waveform?: number[];
  isSender?: boolean;
}

const VoiceMessagePlayer: React.FC<VoiceMessagePlayerProps> = ({ uri, waveform = [], isSender }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;

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
    try {
      const { sound, status } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false, positionMillis: 0 },
        onPlaybackStatusUpdate,
        100
      );
      if (status.isLoaded) {
        setSound(sound);
        setDuration(status.durationMillis || 0);
        progress.setValue(0);
      } else if (status.error) {
        console.error('Error loading sound:', status.error);
      }
    } catch (error) {
      console.error('Error in loadSound:', error);
    }
  };

  const onPlaybackStatusUpdate = (status: Audio.AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      
      if (status.durationMillis && status.durationMillis > 0) {
        const progressValue = status.positionMillis / status.durationMillis;
        progress.setValue(progressValue);
      }
      
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
        progress.setValue(0);
      }
    } else if (status.error) {
      console.error(`Playback Error: ${status.error}`);
    }
  };

  const handlePlayPause = async () => {
    if (!sound) {
      return;
    }
    if (isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };


  const formatTime = (milliseconds: number) => {
    const totalSeconds = milliseconds / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const getBubbleWidth = () => {
    const screenWidth = Dimensions.get('window').width;
    const maxWidth = screenWidth * 0.6;
    const minWidth = 150;
    
    if (duration > 0) {
      const durationSeconds = duration / 1000;
      const widthPerSecond = (maxWidth - minWidth) / 30;
      const calculatedWidth = minWidth + (durationSeconds * widthPerSecond);
      return Math.min(calculatedWidth, maxWidth);
    }
    return minWidth;
  };

  return (
    <View style={[styles.container, isSender ? styles.sender : styles.receiver, { width: getBubbleWidth() }]}>
      <TouchableOpacity onPress={handlePlayPause}>
        <Ionicons
          name={isPlaying ? "pause" : "play"}
          size={24}
          color="white"
        />
      </TouchableOpacity>
      <View style={styles.soundBarsContainer}>
        <AudioWaveform waveform={waveform} color="white" progress={progress} />
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
    flex: 1,
    overflow: 'hidden',
  },
  timerText: {
    color: 'white',
    fontSize: 14,
  },
});

export default VoiceMessagePlayer;
