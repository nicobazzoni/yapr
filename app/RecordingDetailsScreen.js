import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList } from 'react-native';
import { Audio } from 'expo-av';
import { firestore, auth } from './firebase';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons'; 
import { useNavigation } from 'expo-router/src/useNavigation';
import { FontAwesome } from '@expo/vector-icons';
import { Octicons } from '@expo/vector-icons'; 


const RecordingDetailsScreen = ({ route, navigation }) => {
  const { recordingId } = route.params;
  const [recording, setRecording] = useState(null);
  const [reply, setReply] = useState(null);
  const [replies, setReplies] = useState([]);
  const [username, setUsername] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const navigate = useNavigation();

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
      // ...

      if (isRecording) { // Use isRecording state variable
        console.log('Recording already in progress');
        return;
      }

      if (reply) {
        console.log('Stopping recording..');
        await reply.stopAndUnloadAsync();
        setReply(null);
        setIsRecording(false); // Update isRecording state
      } else {
        console.log('Starting recording..');
        const recording = new Audio.Recording();
        await recording.prepareToRecordAsync();
        await recording.startAsync();
        setReply(recording);
        setIsRecording(true); // Update isRecording state

        // ...
      }
    } catch (error) {
      console.error('Failed to handle recording', error);
    }
  };

  const handleStopRecording = async () => {
    try {
      if (reply && reply.isRecording) {
        console.log('Stopping recording..');
        await reply.stopAndUnloadAsync();
        setIsRecording(false); // Update isRecording state
      }
    } catch (error) {
      console.error('Failed to stop recording', error);
    } finally {
      setReply(null);
    }
  };
  
 
 
  
  
  

  useEffect(() => {
    // Your existing code to fetch recording and replies
  // Additional code to handle updated state
    if (!reply) {
      // Perform any cleanup or reset necessary when reply is null
      // For example, stopping playback or resetting any playback-related states
      setIsPlaying(false);
    }
  
    return () => {
      // Cleanup function to be called when the component unmounts or when the effect is re-triggered
      // For example, stopping any ongoing recordings or clearing any resources
      handleStopRecording();
    };
  }, [recordingId, reply]);
  
  
  useEffect(() => {
    return () => {
      // Clean up the recording when the component unmounts
      if (reply) {
        reply.stopAndUnloadAsync();
      }
    };
  }, []);
  
  
  const handleSaveRecording = async () => {
    try {
      const user = auth.currentUser;
      if (user && reply) {
        console.log('Saving reply recording...');
        const recordingUri = reply.getURI();
        const filename = recordingUri.split('/').pop();
  
        // Upload the reply recording to Firebase Storage
        const storageChildRef = storage.ref().child(`replies/${filename}`);
        const response = await fetch(recordingUri);
        const blob = await response.blob();
        await storageChildRef.put(blob);
  
        // Get the download URL of the uploaded reply recording
        const downloadURL = await storageChildRef.getDownloadURL();
  
        // Create a new reply document in Firestore
        const recordingRef = firestore.collection('recordings').doc(recordingId);
        const repliesRef = recordingRef.collection('replies');
        const replyData = {
          content: 'New reply recording',
          sender: user.displayName || user.email,
          timestamp: new Date().getTime(),
          downloadURL: downloadURL,
        };
        await repliesRef.add(replyData);
  
        console.log('Reply recording saved successfully');
      }
    } catch (error) {
      console.error('Failed to save reply recording', error);
    }
  };
  
  

  const handlePausePlayback = async () => {
    try {
      if (isPlaying && recording) {
        if (recording.getStatusAsync().isPlaying) {
          console.log('Pausing playback..');
          setIsPlaying(false);
          await recording.pauseAsync();
        } else {
          console.log('Resuming playback..');
          setIsPlaying(true);
          await recording.playAsync();
        }
      }
    } catch (error) {
      console.error('Failed to pause playback', error);
    }
  };
  

  const handlePlayRecording = async () => {
    try {
      console.log('Playing recording...', recording.downloadURL);

      if (reply && !reply.isRecording) { // Check if recording has finished
        const { sound } = await Audio.Sound.createAsync(
          { uri: recording.downloadURL },
          { shouldPlay: true }
        );
        await sound.playAsync();
      }
    } catch (error) {
      console.error('Failed to play recording', error);
    }
  };
      
  
  // Rest of the code...
  const renderReply = ({ item }) => (
    <View style={styles.replyContainer}>
      <View style={styles.replyContentContainer}>
        <Text style={styles.replyContent}>{item.content}</Text>
        <Text style={styles.replySender}>Sent by: {item.sender}</Text>
      </View>
      <TouchableOpacity onPress={() => handlePlayReply(item)}>
        <FontAwesome name="play-circle" size={24} color="blue" />
      </TouchableOpacity>
    </View>
  );
  
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
      {recording && (
        <TouchableOpacity style={styles.button} onPress={handlePlayRecording}>
          <Feather name="play" size={24} color="black" />
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.button} onPress={backHome}>
        <Octicons name="home" size={24} color="black" />
      </TouchableOpacity>
    </View>
        
     
    </View>
  )}
    {replies.length > 0 && (
       <FlatList
       data={replies}
       renderItem={renderReply}
       keyExtractor={(item) => item.id}
       extraData={handlePlayReply} // Add this line
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
      <Button
        title="Save Recording"
        onPress={handleSaveRecording}
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
    recordingTag: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        },
    recordingUsername: {
        fontSize: 16,
        marginBottom: 10,
        },

  buttonPage: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    },
    button: {
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#eee',
      },
});

export default RecordingDetailsScreen;

  
  
