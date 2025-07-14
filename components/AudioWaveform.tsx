import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface AudioWaveformProps {
  waveform?: number[];
  color?: string;
  position?: number;
  duration?: number;
  isPlaying?: boolean;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({ waveform, color, position = 0, duration = 0, isPlaying = false }) => {
  const finalWaveform = waveform || [];
  const finalColor = color || '#25D366';

  const bars = finalWaveform.map((barHeight, index) => (
    <View
      key={index}
      style={[
        styles.bar,
        { height: Math.max(2, barHeight), backgroundColor: finalColor },
      ]}
    />
  ));

  const playheadPosition = new Animated.Value(0);

  React.useEffect(() => {
    if (isPlaying && duration > 0) {
      playheadPosition.setValue(position / duration);
      Animated.timing(playheadPosition, {
        toValue: 1,
        duration: duration - position,
        useNativeDriver: false,
      }).start();
    } else {
      playheadPosition.stopAnimation();
    }
  }, [isPlaying, position, duration]);

  const interpolatedPlayhead = playheadPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [1, (finalWaveform.length * 4) - 1], // Start at the beginning of the first bar, end at the end of the last bar
  });

  return (
    <View style={styles.container}>
      {bars}
      {isPlaying && (
        <Animated.View style={[styles.playhead, { transform: [{ translateX: interpolatedPlayhead }] }]} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center', // Centrer les barres verticalement
    justifyContent: 'center',
    height: 30, // Ajusté pour correspondre à la hauteur du parent
  },
  bar: {
    width: 2,
    borderRadius: 1,
    marginHorizontal: 1,
  },
  playhead: {
    position: 'absolute',
    width: 2,
    height: '100%',
    backgroundColor: 'red',
  },
});

export default AudioWaveform;
