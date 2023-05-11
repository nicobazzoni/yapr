import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';
import { Audio } from 'expo-av';
import { firestore, auth } from './firebase';

const Voice = () => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [tag, setTag] = useState('');

  const startRecording = async () => {
    try {
      console.log('Requesting permissions..');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      console.log('Starting recording..');
      if (!recording) {
        const recording = new Audio.Recording();
        await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
        await recording.startAsync();
        setRecording(recording);
        setIsRecording(true);
      } else {
        console.log('Recording already prepared');
      }
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

  const handleSave = async () => {
    console.log('Saving recording..');
    const uri = recording.getURI();
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = uri.split('/').pop();
  
    try {
      const userDoc = await firestore.collection('users').doc(auth.currentUser.uid).get();
      const recordingData = {
        downloadURL: '',
        userId: auth.currentUser.uid,
        createdAt: new Date(),
        tag,
        username: userDoc.data().username,
        filename,
      };
      
      // Save the recording metadata to Firestore
      const recordingRef = await firestore.collection('recordings').add(recordingData);
      
      // Upload the recording to Cloud Storage and update the downloadURL
      const storageRef = firebase.storage().ref(`recordings/${auth.currentUser.uid}/${recordingRef.id}`);
      const snapshot = await storageRef.put(blob);
      const downloadURL = await snapshot.ref.getDownloadURL();
      await firestore.collection('recordings').doc(recordingRef.id).update({ downloadURL });
      
      console.log('Recording saved!');
    } catch (err) {
      console.error('Failed to save recording', err);
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




