import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';
import { Audio } from 'expo-av';
import { firestore, auth, storageRef, db } from './firebase';
import { useNavigation } from '@react-navigation/native';

const Voice = () => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tag, setTag] = useState('');
  const navigation = useNavigation();
 

  const startRecording = async () => {
    try {
      console.log('Requesting permissions..');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
  
      if (recording) {
        console.log('Stopping previous recording..');
        await recording.stopAndUnloadAsync();
      }
  
      console.log('Starting new recording..');
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
  };

  const playRecording = async () => {
    console.log('Playing recording..');
    const { sound } = await recording.createNewLoadedSoundAsync();
    await sound.playAsync();
    setIsPlaying(true);
  };

  const pausePlayback = async () => {
    console.log('Pausing playback..');
    setIsPlaying(false);
    try {
      await recording.stopAndUnloadAsync();
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const handleSave = async () => {
    console.log('Saving recording..');
    const uri = recording.getURI();
    const filename = uri.split('/').pop();
  
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
  
      const userRef = firestore.collection('users').doc(auth.currentUser.uid);
      const userDoc = await userRef.get();
  
      if (userDoc.exists && userDoc.data().username) {
        // Upload the recording file to Firebase Storage
        const storageChildRef = storageRef.child(`recordings/${filename}`);
        const uploadTask = storageChildRef.put(blob);
        await uploadTask;
  
        // Get the download URL of the uploaded file
        const downloadURL = await storageChildRef.getDownloadURL();
  
        const recordingData = {
          downloadURL,
          userId: auth.currentUser.uid,
          createdAt: new Date(),
          tag,
          username: userDoc.data().username,
          filename,
        };
  
        // Save the recording metadata to Firestore
        await db.collection('recordings').add(recordingData);
        console.log('Recording saved!');
        navigation.navigate('Home');
      } else {
        console.error('User data not found');
      }
    } catch (err) {
      console.error('Failed to save recording', err);
    } finally {
      setRecording(null);
      setIsPlaying(false);
      setTag('');
    }
  };
  
  
  

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Record your voice</Text>
      <TouchableOpacity style={styles.button} onPress={isRecording ? stopRecording : startRecording}>
        <Text style={styles.buttonText}>{isRecording ? 'Stop' : 'Record'}</Text>
      </TouchableOpacity>
      {recording && (
        <>
          <TouchableOpacity style={styles.button} onPress={isPlaying ? pausePlayback : playRecording}>
            <Text style={styles.buttonText}>{isPlaying ? 'Pause' : 'Play'}</Text>
          </TouchableOpacity>
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




