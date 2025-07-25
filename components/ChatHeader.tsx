import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ChatHeader = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'android' ? insets.top + 10 : 10 }]}>
      <Ionicons name="person-circle" size={40} color="#25D366" />
      <Text style={styles.contactName}>Nom du contact</Text>
      <View style={styles.icons}>
        <Ionicons name="call" size={24} color="#075E54" style={styles.icon} />
        <Ionicons name="ellipsis-vertical" size={24} color="#075E54" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 10,
    backgroundColor: '#F6F6F6',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  contactName: {
    flex: 1,
    marginLeft: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  icons: {
    flexDirection: 'row',
  },
  icon: {
    marginRight: 20,
  },
});

export default ChatHeader;
