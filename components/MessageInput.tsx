
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AudioWaveform from './AudioWaveform';

interface MessageInputProps {
  onSendMessage: (message: { type: string; content: string; waveform?: number[] }) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [volume, setVolume] = useState(0);
  const [waveform, setWaveform] = useState<number[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setRecordTime((prevTime) => prevTime + 1);
      }, 1000) as unknown as NodeJS.Timeout;
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setRecordTime(0);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSendMessage = () => {
    if (text.trim().length > 0) {
      onSendMessage({ type: 'text', content: text.trim() });
      setText('');
    }
  };

  const handlePressIn = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        { ...Audio.RecordingOptionsPresets.HIGH_QUALITY, isMeteringEnabled: true },
        (status) => {
          if (status.isRecording && status.metering) {
            const db = status.metering;
            // Convert dB to a positive height for the waveform bar
            const height = Math.max(2, Math.pow(10, db / 40) * 10);
            setWaveform(prev => [...prev, height]);
          }
        },
        100
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const handlePressOut = async () => {
    setIsRecording(false);
    if (recording) {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (uri) {
        onSendMessage({ type: 'voice', content: uri, waveform: waveform });
      }
      setRecording(null);
      setWaveform([]);
    }
  };

  return (
    <View style={styles.container}>
      {isRecording ? (
        <View style={styles.recordingContainer}>
          <Text style={styles.recordTime}>{formatTime(recordTime)}</Text>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.waveformContainer}>
            <AudioWaveform waveform={waveform} />
          </ScrollView>
          <TouchableOpacity onPress={handlePressOut}>
            <Ionicons name="send" size={24} color="#25D366" />
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.inputContainer}>
            <Ionicons name="attach" size={24} color="#8E8E93" style={styles.icon} />
            <TextInput 
              style={[styles.input, { maxHeight: 100 }]} // Limite la hauteur pour éviter qu'il ne prenne tout l'écran
              placeholder="Type a message" 
              multiline={true}
              value={text}
              onChangeText={setText}
            />
          </View>
          <TouchableOpacity 
            style={styles.micButton} 
            onPress={text.length > 0 ? handleSendMessage : handlePressIn} 
            onLongPress={text.length > 0 ? undefined : handlePressIn} // Only allow long press for mic
            delayLongPress={200} // Adjust as needed
          >
            <Ionicons name={text.length > 0 ? "send" : "mic"} size={24} color="white" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F6F6F6',
  },
  inputContainer: {
    flexGrow: 1,
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'flex-end', // Align items to the bottom when input grows
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 10,
    maxHeight: 120, // Prevent the input from growing too large
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    textAlignVertical: 'top', // Ensure text starts from the top in multiline input
  },
  icon: {
    marginRight: 10,
  },
  micButton: {
    marginLeft: 10,
    backgroundColor: '#25D366',
    borderRadius: 25,
    padding: 10,
  },
  recordingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    marginRight: 10,
  },
  waveformContainer: {
    flexGrow: 1,
    flexShrink: 1,
  },
  recordTime: {
    fontSize: 16,
    color: '#8E8E93',
  },
});

export default MessageInput;
