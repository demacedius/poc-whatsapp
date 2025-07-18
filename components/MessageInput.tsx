
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AudioWaveform from './AudioWaveform';

interface MessageInputProps {
  onSendMessage: (message: { type: string; content: string; waveform?: number[] }) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [waveform, setWaveform] = useState<number[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progress = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    return () => {
      if (recording) {
        recording.getStatusAsync().then(status => {
          if (status.canRecord || status.isRecording) {
            recording.stopAndUnloadAsync().catch(console.error);
          }
        }).catch(console.error);
      }
    };
  }, [recording]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSendMessage = () => {
    if (text.trim().length > 0) {
      console.log('Sending text message:', text.trim());
      onSendMessage({ type: 'text', content: text.trim() });
      setText('');
    }
  };

  const handlePressIn = async () => {
    if (isRecording) {
      console.log('Already recording, skipping...');
      return;
    }

    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to record audio not granted');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const recordingOptions = Platform.OS === 'android' ? {
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
        android: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
      } : {
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
        ios: {
          extension: '.m4a',
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      };

      console.log('Starting recording...');
      const { recording: newRecording } = await Audio.Recording.createAsync(
        recordingOptions,
        (status) => {
          if (status.isRecording && status.metering) {
            const db = status.metering;
            const normalizedDb = Math.max(-40, Math.min(0, db));
            let height = Math.max(2, ((normalizedDb + 40) / 40) * 25 + 3);
            
            if (Platform.OS === 'ios' && db < -30) {
              height = Math.max(2, height * 0.15);
            }
            
            setWaveform(prev => [...prev, height]);
          }
        },
        100
      );
      
      setRecording(newRecording);
      setIsRecording(true);
      console.log('Recording started successfully');
    } catch (err) {
      console.error('Failed to start recording', err);
      setRecording(null);
      setIsRecording(false);
      setWaveform([]);
    }
  };

  const handlePressOut = async () => {
    console.log('Stopping recording...');
    setIsRecording(false);
    
    if (recording) {
      try {
        const status = await recording.getStatusAsync();
        console.log('Recording status before stop:', status);
        if (status.canRecord) {
          await recording.stopAndUnloadAsync();
          const uri = recording.getURI();
          console.log('Recording URI after stop:', uri);
          console.log('Waveform data:', waveform);
          if (uri && waveform.length > 0) {
            console.log('Sending voice message:', uri, 'waveform length:', waveform.length);
            onSendMessage({ type: 'voice', content: uri, waveform: [...waveform] });
          } else {
            console.log('Voice message not sent - uri:', uri, 'waveform length:', waveform.length);
            if (!uri) console.log('ERROR: URI is null or undefined');
            if (waveform.length === 0) console.log('ERROR: Waveform is empty');
          }
        } else {
          console.log('Recording cannot record, status:', status);
        }
      } catch (error) {
        console.error('Error stopping recording:', error);
      } finally {
        setRecording(null);
        setWaveform([]);
      }
    }
  };

  return (
    <View style={styles.container}>
      {isRecording ? (
        <View style={styles.recordingContainer}>
          <Text style={styles.recordTime}>{formatTime(recordTime)}</Text>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.waveformContainer}>
            <AudioWaveform waveform={waveform} progress={progress} />
          </ScrollView>
          <TouchableOpacity onPress={handlePressOut}>
            <Ionicons name="send" size={24} color="#25D366" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.inputRow}>
          <View style={styles.inputContainer}>
            <Ionicons name="attach" size={24} color="#8E8E93" style={styles.icon} />
            <TextInput 
              style={styles.input}
              placeholder="Tapez un message..." 
              multiline={true}
              value={text}
              onChangeText={setText}
            />
          </View>
          <TouchableOpacity 
            style={styles.micButton} 
            onPress={text.length > 0 ? handleSendMessage : undefined} 
            onPressIn={text.length > 0 ? undefined : handlePressIn}
            onPressOut={text.length > 0 ? undefined : handlePressOut}
            delayLongPress={200}
          >
            <Ionicons name={text.length > 0 ? "send" : "mic"} size={24} color="white" />
          </TouchableOpacity>
        </View>
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
  inputRow: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  inputContainer: {
    flexGrow: 1,
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  icon: {
    marginRight: 10,
    marginTop: 8,
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
