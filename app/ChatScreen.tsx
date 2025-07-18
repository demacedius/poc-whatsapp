import ChatHeader from '@/components/ChatHeader';
import MessageInput from '@/components/MessageInput';
import TextBubble from '@/components/TextBubble';
import VoiceMessagePlayer from '@/components/VoiceMessagePlayer';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, View, StatusBar } from 'react-native';

interface TextMessage {
  type: 'text';
  content: string;
  isSender: boolean;
}

interface VoiceMessage {
  type: 'voice';
  content: string;
  waveform: number[];
  isSender?: boolean;
}

type Message = TextMessage | VoiceMessage;

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { type: 'text', content: 'Hello, how are you?', isSender: false },
    { type: 'text', content: 'I\'m fine thanks!', isSender: true },
  ]);

  const addMessage = (message: any) => {
    console.log('Adding message:', message);
    const newMessage: Message = {
      ...message,
      isSender: true
    };
    console.log('New message to add:', newMessage);
    setMessages(prevMessages => {
      console.log('Previous messages:', prevMessages);
      const updated = [...prevMessages, newMessage];
      console.log('Updated messages:', updated);
      return updated;
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#F6F6F6" 
        translucent={false}
      />
      <ChatHeader />
      <ScrollView style={styles.messagesContainer}>
        {messages.map((msg, index) => {
          console.log('Rendering message:', msg, 'at index:', index);
          if (msg.type === 'text') {
            return <TextBubble key={`text-${index}`} message={msg.content} isSender={msg.isSender} />;
          } else if (msg.type === 'voice') {
            console.log('Voice message details:', msg.content, 'waveform length:', msg.waveform?.length);
            if (msg.content && msg.waveform && msg.waveform.length > 0) {
              return <VoiceMessagePlayer key={`voice-${index}`} uri={msg.content} waveform={msg.waveform} isSender={msg.isSender} />;
            } else {
              console.log('Voice message not rendered - missing content or waveform');
              return null;
            }
          }
          return null;
        })}
      </ScrollView>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}>
        <View style={styles.inputContainer}>
          <MessageInput onSendMessage={addMessage} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  inputContainer: {
    marginBottom: 50,
  }
});
