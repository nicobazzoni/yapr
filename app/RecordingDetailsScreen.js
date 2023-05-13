import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList } from 'react-native';
import { Audio } from 'expo-av';
import { firestore, auth } from './firebase';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { FontAwesome } from '@expo/vector-icons';
import { Octicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const RecordingDetailsScreen = ({ route }) => {
  const { recordingId } = route.params;
  const [recording, setRecording] = useState(null);
  const [replies, setReplies] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [reply, setReply] = useState(null);

  const [username , setUsername] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchRecording = async () => {
      try {
        const recordingRef = firestore.collection('recordings').doc(recordingId);
        const recordingDoc = await recordingRef.get();
        if (recordingDoc.exists) {
          const recordingData = recordingDoc.data();
          setRecording(recordingData);
        } else {
          console.log('Recording not found');
        }
      } catch (error) {
        console.error('Failed to fetch recording', error);
      }
    };

    const fetchReplies = async () => {
      try {
        const repliesRef = firestore
          .collection('recordings')
          .doc(recordingId)
          .collection('replies')
          .orderBy('timestamp', 'asc');
        const snapshot = await repliesRef.get();
        const replyData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReplies(replyData);
      } catch (error) {
        console.error('Failed to fetch replies', error);
      }
    };

    fetchRecording();
    fetchReplies();
  }, [recordingId]);

  const handlePlayPause = async () => {
    try {
      if (recording && recording.uri) {
        const soundObject = new Audio.Sound();
  
        await soundObject.loadAsync({ uri: recording.uri });
        await soundObject.playAsync();
        console.log('Playing Sound', recording.uri);
  
        soundObject.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            soundObject.unloadAsync();
            setIsPlaying(false);
          }
        });
  
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Failed to play recording', error);
    }
  };
  
  

  const handleStartRecording = async () => {
    try {
      console.log('Starting recording..');

      if (reply) {
        console.log('Recording already in progress');
        return;
      }

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync();
      await newRecording.startAsync();
      setReply(newRecording);
    } catch (error) {
      console.error('Failed to start recording', error);
    }
  };

  const handleStopRecording = async () => {
    try {
      if (reply && reply.isRecording) {
        console.log('Stopping recording..');
        await reply.stopAndUnloadAsync();
        setReply(null);
      }
    } catch (error) {
      console.error('Failed to stop recording', error);
    }
  };

  const handlePlayReply = async (item) => {
    try {
      console.log('Playing reply..');
      const { sound } = await Audio.Sound.createAsync(
        { uri: item.uri },
        { shouldPlay: true }
      );
      await sound.playAsync();
    } catch (error) {
      console.error('Failed to play reply', error);
    }
  };

  const handleSaveReply = async () => {
    try {
      console.log('Saving reply..');
      const uri = reply.getURI();
      const filename = uri.split('/').pop();

      const response = await fetch(uri);
      const blob = await response.blob();

      const user = auth.currentUser;
      if (user && user.displayName) {
        const replyData = {
          uri,
          filename,
          sender: user.displayName,
        };

        const storageRef = storageRef.child(`recordings/${recordingId}/${filename}`);
        await storageRef.put(blob);

        const downloadURL = await storageRef.getDownloadURL();

        await firestore
          .collection('recordings')
          .doc(recordingId)
          .collection('replies')
          .add({
            ...replyData,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          });

        console.log('Reply saved successfully!');
        setReply(null);
      } else {
        console.log('User not logged in or display name not available.');
      }
    } catch (error) {
      console.error('Failed to save reply', error);
    }
  };

  const backHome = () => {
    navigation.navigate('Home');
    };





  return (
    <View style={styles.container}>
      {recording && (
        <View>
          <Text style={styles.recordingTag}>{recording.tag}</Text>
          <Text style={styles.recordingUsername}>-{recording.username}</Text>
          {/* Render other details of the recording */}
          <View style={styles.buttonPage}>
            <TouchableOpacity style={styles.button} onPress={handlePlayPause}>
              <FontAwesome name={isPlaying ? 'pause-circle' : 'play-circle'} size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={backHome}>
              <Octicons name="home" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      )}
      {replies.length > 0 && (
        <FlatList
          data={replies}
          renderItem={({ item }) => (
            <View style={styles.replyContainer}>
              <View style={styles.replyContentContainer}>
                <Text style={styles.replyContent}>{item.content}</Text>
                <Text style={styles.replySender}>Sent by: {item.sender}</Text>
              </View>
              <TouchableOpacity onPress={() => handlePlayReply(item)}>
                <FontAwesome name="play-circle" size={24} color="blue" />
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
      )}
      <Text>{username}</Text>
      {!reply ? (
        <Button title="Record Reply" onPress={handleStartRecording} />
      ) : (
        <View>
          <Button title="Stop Recording" onPress={handleStopRecording} />
          <Button title="Save Reply" onPress={handleSaveReply} />
        </View>
      )}
    </View>
  );
};

export default RecordingDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  replyContainer: {
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
    marginBottom: 10,
  },
  replyContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  replyContent: {
    fontSize: 16,
    marginRight: 10,
  },
  replySender: {
    fontSize: 12,
    color: '#888',
  },
  recordingTag: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
 
});

