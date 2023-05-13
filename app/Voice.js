import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';
import { Audio } from 'expo-av';
import { db, auth } from './firebase';
import { ref, uploadBytes } from 'firebase/storage';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import { useNavigation } from '@react-navigation/native';

const Voice = () => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [tag, setTag] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  const navigation = useNavigation();

  const startRecording = async () => {
    try {
      console.log('Requesting permissions..');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      console.log('Starting recording..');
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await newRecording.startAsync();
      setRecording(newRecording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    console.log('Stopping recording..');
    setIsRecording(false);
    try {
      await recording.stopAndUnloadAsync();
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
    setIsPlaying(true);
  };

  const handleSave = async () => {
    console.log('Saving recording..');
    const uri = recording.getURI();
    const filename = uri.split('/').pop();
  
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
  
      const userRef = db.collection('users').doc(auth.currentUser.uid);
      const userDoc = await userRef.get();
  
      if (userDoc.exists && userDoc.data().username) {
        const recordingData = {
          uri,
          filename,
          tag,
        };
  
        // Upload the recording blob to Firebase Storage
        const storageRef = firebase.storage().ref(`recordings/${auth.currentUser.uid}/${filename}`);
        await storageRef.put(blob);
  
        // Get the download URL of the uploaded recording
        const downloadURL = await storageRef.getDownloadURL();
  
        // Save the recording metadata to Firestore
        const recordingRef = db.collection('recordings').doc();
        await recordingRef.set({
          ...recordingData,
          downloadURL,
          userId: auth.currentUser.uid,
          createdAt: firebase.firestore.Timestamp.now(),
          recordingId: recordingRef.id,
          username: userDoc.data().username,
        });
  
        console.log('Recording saved successfully!');
  
        // Refresh the home page after saving
        navigation.navigate('Home');
      } else {
        console.log('User document not found or username not available.');
      }
    } catch (error) {
      console.error('Failed to save recording:', error);
    }
  };
  
  





  
  

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    const playbackSound = async () => {
      console.log('Playback sound triggered');
      if (isPlaying && recording) {
        console.log('Playing recording...');
        try {
          const { sound } = await recording.createNewLoadedSoundAsync();
          await sound.playAsync();
          setIsPlaying(false);
          console.log('Recording playback completed.');
        } catch (error) {
          console.error('Failed to play recording:', error);
        }
      }
    };
    playbackSound();
  }, [isPlaying]);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Record your voice</Text>
      <TouchableOpacity style={styles.button} onPress={isRecording ? stopRecording : startRecording}>
        <Text style={styles.buttonText}>{isRecording ? 'Stop' : 'Record'}</Text>
      </TouchableOpacity>
      {recording && (
        <>
          <View style={styles.tagContainer}>
            <Text style={styles.tagLabel}>Tag:</Text>
            <TextInput
              style={styles.tagInput}
              onChangeText={setTag}
              value={tag}
            />
          </View>
          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default Voice;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#1E90FF',
    padding: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    fontSize: 20,
    color: '#fff',
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tagLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  tagInput: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
  },
});


