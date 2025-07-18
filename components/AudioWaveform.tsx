import React from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';

interface AudioWaveformProps {
  waveform?: number[];
  color?: string;
  progress: Animated.Value;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({ waveform = [], color, progress }) => {
  const finalColor = color || '#25D366';
  const playedColor = color === 'white' ? '#ffffff' : '#128C7E';
  const unplayedColor = color === 'white' ? 'hsla(0, 35.70%, 94.50%, 0.86)' : 'rgba(37,211,102,0.4)';
  const playheadColor = color === 'white' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(18, 140, 126, 0.9)';

  const waveformWidth = waveform.length * (Platform.OS === 'ios' ? 3 : 4);
  
  const interpolatedPlayhead = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, waveformWidth],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <View style={styles.waveformContainer}>
        {waveform.map((barHeight, index) => {
          const animatedOpacity = progress.interpolate({
            inputRange: [0, (index + 1) / waveform.length, 1],
            outputRange: [0, 1, 1],
            extrapolate: 'clamp',
          });

          return (
            <View key={index} style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  { 
                    height: Math.max(3, Math.min(barHeight, 28)), 
                    backgroundColor: unplayedColor,
                    borderRadius: 2,
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.bar,
                  styles.playedBar,
                  { 
                    height: Math.max(3, Math.min(barHeight, 24)), 
                    backgroundColor: playedColor,
                    borderRadius: 2,
                    opacity: animatedOpacity,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>
      <Animated.View
        style={[
          styles.playhead,
          {
            backgroundColor: playheadColor,
            transform: [{ translateX: interpolatedPlayhead }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
    position: 'relative',
    overflow: 'hidden',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    overflow: 'hidden',
  },
  barContainer: {
    position: 'relative',
    marginHorizontal: Platform.OS === 'ios' ? 0.5 : 1,
  },
  bar: {
    width: Platform.OS === 'ios' ? 2 : 3,
    minHeight: 3,
  },
  playedBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: Platform.OS === 'ios' ? 2 : 3,
    minHeight: 3,
  },
  playhead: {
    position: 'absolute',
    width: 2,
    height: '100%',
    left: 0,
    top: 0,
    borderRadius: 1,
    zIndex: 10,
  },
});

export default AudioWaveform;
