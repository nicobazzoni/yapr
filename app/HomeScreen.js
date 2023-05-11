import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { firebase, auth, firestore } from './firebase';
import { Audio } from 'expo-av';
import { Image } from 'react-native';
import yicon from './assets/yicon.jpg';

const LogInButton = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.buttonContainer}>
      <Button title="Log In" onPress={() => navigation.navigate('LogIn')} />
    </View>
  );
};

const VoiceButton = () => {
  const navigation = useNavigation();

  const handleAddRecording = (recording) => {
    navigation.setOptions({
      addRecording: recording,
    });
    navigation.navigate('Voice');
  };

  return (
    <View style={styles.buttonContainer}>
      <Button title="Voice" onPress={handleAddRecording} />
    </View>
  );
};



const SignUpButton = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.buttonContainer}>
      <Button title="Sign Up" onPress={() => navigation.navigate('SignUp')} />
    </View>
  );
};



const RecordingsList = ({ recordings }) => {
  const navigation = useNavigation();

  const handlePlay = async (downloadURL) => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: downloadURL });
  
      sound.setOnPlaybackStatusUpdate((playbackStatus) => {
        if (playbackStatus.didJustFinish) {
          console.log('Sound playback finished');
        }
      });
  
      await sound.playAsync();
      console.log('Playing Sound');
    } catch (error) {
      console.log('Error while playing sound:', error);
    }
  };
  
  
  
  

  const renderRecording = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.recordingContainer}
        onPress={() => handlePlay(item.downloadURL)}
      >
        <Text style={styles.recordingTag}>{item.tag}</Text>
        <Text style={styles.recordingUsername}>{item.username}</Text>
      </TouchableOpacity>
    );
};


  return (
    <View style={styles.container}>
      <FlatList
        data={recordings}
        renderItem={renderRecording}
        keyExtractor={(item) => item.id}
        numColumns={1}
        contentContainerStyle={styles.recordingsContainer}
      />
    </View>
  );
};



const HomeScreen = () => {
  const [user, setUser] = useState(null);
  const [recordings, setRecordings] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        const fetchRecordings = async () => {
          const recordingsRef = firestore.collection('recordings');
          console.log(recordingsRef)
          const snapshot = await recordingsRef.get();
          const recordingsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setRecordings(recordingsData);
        };
        fetchRecordings();
      } else {
        setUser(null);
        setRecordings([]);
      }
    });
    return unsubscribe;
  }, []);
  

  
  

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (err) {
      console.error('Failed to sign out', err);
    }
  };

  const addRecording = (recording) => {
    setRecordings((prevRecordings) => [recording, ...prevRecordings]);
  };

  return (
    <View style={styles.container}>
       <Image source={yicon} style={styles.icon} />
      {user ? (
        <>
          <Text style={styles.title}>Welcome {user.displayName || user.email.substring(0, user.email.indexOf('@'))}!</Text>
          <VoiceButton addRecording={addRecording} />
          <RecordingsList recordings={recordings} />
          <View style={styles.buttonContainer}>
            <Button title="Sign Out" onPress={handleSignOut} />
          </View>
        </>
      ) : (
        <>
          <Text style={styles.title}>Welcome!</Text>
          <LogInButton />
          <SignUpButton />
        </>
      )}
    </View>
  );

};

export default HomeScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',

    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingsContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  recordingContainer: {
    marginBottom: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'gray',
    backgroundColor: '#fff',
    padding: 16,
    width: '100%',
  },
  recordingTag: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  recordingUsername: {
    fontSize: 12,
    color: 'gray',

  },
  icon: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 20,
  },
});



