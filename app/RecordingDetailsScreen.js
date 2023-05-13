import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList } from 'react-native';
import { Audio } from 'expo-av';
import { firestore, auth } from './firebase';
import { TouchableOpacity } from 'react-native-gesture-handler';

const RecordingDetailsScreen = ({ route, navigation }) => {
  const { recordingId } = route.params;
  const [recording, setRecording] = useState(null);
  const [reply, setReply] = useState(null);
  const [replies, setReplies] = useState([]);
  const [username, setUsername] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

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

    const fetchUsername = async () => {
      try {
        const user = auth.currentUser;
        if (user && user.displayName) {
          setUsername(user.displayName);
        }
      } catch (error) {
        console.error('Failed to fetch username', error);
      }
    };

    fetchRecording();
    fetchReplies();
    fetchUsername();
  }, [recordingId]);

  const handleRecording = async () => {
    try {
      console.log('Requesting permissions..');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      if (reply && reply.isRecording) {
        console.log('Recording already in progress');
        return;
      }

      if (reply) {
        console.log('Stopping recording..');
        await reply.stopAndUnloadAsync();
        setReply(null);
      } else {
        console.log('Starting recording..');
        const recording = new Audio.Recording();
        await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
        await recording.startAsync();
        setReply(recording);
      }
    } catch (error) {
      console.error('Failed to handle recording', error);
    }
  };

  const handlePausePlayback = async () => {
    try {
      if (isPlaying && reply) {
        if (reply.getStatusAsync().isPlaying) {
          console.log('Pausing playback..');
          setIsPlaying(false);
          await reply.pauseAsync();
        } else {
          console.log('Resuming playback..');
          setIsPlaying(true);
            await reply.playAsync();
        }
        }
    } catch (error) {
        console.error('Failed to pause playback', error);
    }
    };


      
    const backToHome = () => {
        navigation.navigate('Home');
    }


  

  const handleStopRecording = async () => {
    try {
      await reply.stopAndUnloadAsync();
    } catch (error) {
      console.error('Failed to stop recording', error);
    }
  };

  const renderReply = ({ item }) => (
    <View style={styles.replyContainer}>
      <Text style={styles.replyContent}>{item.content}</Text>
      <Text style={styles.replySender}>Sent by: {item.sender}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Render recording details, replies, and input */}
      {replies.length > 0 && (
        <FlatList
          data={replies}
          renderItem={renderReply}
          keyExtractor={(item) => item.id}
        />
      )}
      <Text>{username}</Text>
      <Button
        title={reply ? 'Stop Recording' : 'Start Recording'}
        onPress={handleRecording}
      />
      <Button
        title={isPlaying ? 'Pause Playback' : 'Resume Playback'}
        onPress={handlePausePlayback}
      />
        <Button
        title="Stop Playback"
        onPress={handleStopRecording}
        />
        {/* <Button
        title="Send"
        onPress={handleSaveRecording}
        /> */}
        <Button
        title="Back to Home"
        onPress={backToHome}
        />

    </View>
  );
};

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
  replyContent: {
    fontSize: 16,
  },
  replySender: {
    fontSize: 12,
    color: '#888',
  },
});

export default RecordingDetailsScreen;