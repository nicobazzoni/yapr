import React, { useState } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';





export const PlayButton = ({ recording }) => {
    const [sound, setSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
  
    const handlePlaySound = async () => {
      try {
        if (isPlaying) {
          await sound.stopAsync();
        } else {
          const { sound: newSound } = await Audio.Sound.createAsync({ uri: recording.downloadURL });
          setSound(newSound);
          await newSound.playAsync();
        }
        setIsPlaying(!isPlaying);
      } catch (error) {
        console.log('Error while playing sound:', error);
      }
    };

    return (
        <View style={styles.playButtonContainer}>
          <Button title={isPlaying ? 'Stop' : 'Play'} onPress={handlePlaySound} />
        </View>
      );
    };

    const styles = StyleSheet.create({
        playButtonContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          },
          playButton: {
            fontSize: 20,
            color: 'white',
            backgroundColor: 'blue',
            padding: 20,
          },

    });

    export default PlayButton;



    