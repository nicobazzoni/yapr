import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';


const VoiceButton = ({ addRecording }) => {
  const navigation = useNavigation();
  return (
    <View style={styles.buttonContainer}>
      <Button
        title="Voice"
        onPress={() =>
          navigation.navigate('Voice', {
            addRecording,
          })
        }
      />
    </View>
  );
};

export default VoiceButton;

const styles = StyleSheet.create({
    buttonContainer: {
        marginTop: 20,
        width: '80%',
        maxWidth: '80%',
        alignItems: 'center',

        justifyContent: 'center',
        backgroundColor: '#fff',

        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        elevation: 3,
        marginBottom: 10,
        },
    buttonText: {
        fontSize: 18,
        color: '#000',
        fontWeight: 'bold',
        alignSelf: 'center',
        textTransform: 'uppercase',
        },
    });

    

