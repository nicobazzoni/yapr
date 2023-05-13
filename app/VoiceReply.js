import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { Audio } from 'expo-av';
import { firestore, auth } from './firebase';

const VoiceReply = ({ recordingId }) => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [recording]);

  const startRecording = async () => {
    try {
      console.log('Start recording...');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await newRecording.startAsync();
      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      console.log('Failed to start recording:', error);
    }
  };

  const stopRecording = async () => {
    try {
      console.log('Stop recording...');
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
    } catch (error) {
      console.log('Failed to stop recording:', error);
    }
  };

  const saveReply = async () => {
    try {
      console.log('Saving reply...');

      const uri = recording.getURI();
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = uri.split('/').pop();

      const userRef = firestore.collection('users').doc(auth.currentUser.uid);
      const userDoc = await userRef.get();

      if (userDoc.exists && userDoc.data().username) {
        const replyData = {
          downloadURL: '', // Set the download URL after uploading the recording
          recordingId: recordingId, // Associate the reply with the recording ID
          userId: auth.currentUser.uid,
          createdAt: new Date(),
          username: userDoc.data().username,
          filename: filename,
        };

        // Upload the recording blob to a storage solution (e.g., Firebase Storage) and get the download URL
        // Once the upload is complete, update the replyData.downloadURL with the actual download URL

        // Save the reply data to Firestore
        await firestore.collection('replies').add(replyData);
        console.log('Reply saved!');
      } else {
        console.error('User data not found');
      }
    } catch (error) {
      console.log('Failed to save reply:', error);
    }
  };

  return (
    <View>
      <Text>Voice Reply</Text>
      <Button title={isRecording ? 'Stop Recording' : 'Start Recording'} onPress={isRecording ? stopRecording : startRecording} />
      <Button title="Save Reply" onPress={saveReply} disabled={!recording} />
    </View>
  );
};

export default VoiceReply;
