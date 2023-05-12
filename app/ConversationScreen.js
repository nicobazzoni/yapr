import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { firestore, auth } from './firebase';

const ConversationScreen = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const conversationId = 'CONVERSATION_ID'; // Replace with your conversation ID

  useEffect(() => {
    const unsubscribe = firestore
      .collection('conversations')
      .doc(conversationId)
      .collection('messages')
      .orderBy('timestamp', 'asc')
      .onSnapshot((snapshot) => {
        const messageData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(messageData);
      });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;

    try {
      const userDoc = await firestore.collection('users').doc(auth.currentUser.uid).get();
      const username = userDoc.data().username;

      const messageData = {
        content: newMessage,
        sender: auth.currentUser.uid,
        username: username,
        timestamp: new Date(),
      };

      await firestore
        .collection('conversations')
        .doc(conversationId)
        .collection('messages')
        .add(messageData);

      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.messageContainer}>
      <Text style={styles.messageContent}>{item.content}</Text>
      <Text style={styles.messageSender}>Sent by: {item.sender}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
      <TextInput
        style={styles.input}
        placeholder="Type a message..."
        value={newMessage}
        onChangeText={setNewMessage}
      />
      <Button title="Send" onPress={handleSendMessage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  messageContainer: {
    marginVertical: 10,
  },
  messageContent: {
    fontSize: 16,
  },
  messageSender: {
    fontStyle: 'italic',
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    marginTop: 10,
  },
});

export default ConversationScreen;
