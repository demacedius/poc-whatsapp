import ChatHeader from '@/components/ChatHeader';
import MessageInput from '@/components/MessageInput';
import TextBubble from '@/components/TextBubble';
import VoiceMessagePlayer from '@/components/VoiceMessagePlayer';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet } from 'react-native';

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
    { type: 'voice', content: '', waveform: [] },
    { type: 'text', content: 'I\'m fine thanks!', isSender: true },
  ]);

  const addMessage = (message: Message) => {

    setMessages([...messages, { ...message, isSender: true }]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ChatHeader />
      <ScrollView style={styles.messagesContainer}>
        {messages.map((msg, index) => {
          if (msg.type === 'text') {
            return <TextBubble key={index} message={msg.content} isSender={msg.isSender} />;
          } else if (msg.type === 'voice') {
            return <VoiceMessagePlayer key={index} uri={msg.content} waveform={msg.waveform} isSender={msg.isSender} />;
          }
        })}
      </ScrollView>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.inputContainer}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}>
        <MessageInput onSendMessage={addMessage} />
      </KeyboardAvoidingView>
    </SafeAreaView>
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