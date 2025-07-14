import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TextBubbleProps {
  message: string;
  isSender: boolean;
}

const TextBubble: React.FC<TextBubbleProps> = ({ message, isSender }) => (
  <View style={[styles.container, isSender ? styles.sender : styles.receiver]}>
    <Text style={[styles.text, isSender ? styles.senderText : styles.receiverText]}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 15,
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
  text: {
    fontSize: 16,
  },
  senderText: {
    color: 'white',
  },
  receiverText: {
    color: 'white', // Couleur foncée pour le texte dans les bulles blanches
  },
});

export default TextBubble;
