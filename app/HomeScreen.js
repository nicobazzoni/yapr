import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { firebase, auth, firestore , db} from './firebase';
import { Audio } from 'expo-av';
import { Image } from 'react-native';
import yicon from './assets/yicon.jpg';
import { useMemo } from 'react';
import VoiceReply from './VoiceReply';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { FontAwesome } from '@expo/vector-icons'; 


const LogInButton = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.buttonContainer}>
      <Button title="Log In" onPress={() => navigation.navigate('LogIn')} />
    </View>
  );
};

const VoiceButton = ({ addRecording }) => {
  const navigation = useNavigation();

  const handleAddRecording = () => {
    navigation.navigate('Voice', {
      addRecording: addRecording,
    });
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
  const [recordinds, setRecordings] = useState([]);
  const [recordingLengths, setRecordingLengths] = useState({});

  const handlePlay = async (downloadURL) => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: downloadURL });
  
      const { durationMillis } = await sound.getStatusAsync();
      const durationSeconds = Math.floor(durationMillis / 1000);
      console.log('Sound duration:', durationSeconds);
  
      sound.setOnPlaybackStatusUpdate((playbackStatus) => {
        if (playbackStatus.didJustFinish) {
          console.log('Sound playback finished');
        }
      });
  
      await sound.playAsync();
      console.log('Playing Sound');
  
      setRecordingLengths((prevRecordingLengths) => ({
        ...prevRecordingLengths,
        [downloadURL]: durationSeconds,
      }));
    } catch (error) {
      console.log('Error while playing sound:', error);
    }
  };
  
  

  useEffect(() => {
    // Set up the real-time listener
    const unsubscribe = db.collection('recordings')
      .orderBy('createdAt', 'desc')
      .onSnapshot((snapshot) => {
        const updatedRecordings = snapshot.docs.map((doc) => doc.data());
        setRecordings(updatedRecordings);
      });

    // Clean up the listener on unmount
    return () => unsubscribe();
  }, []);

  const deleteRecording = async (recordingId) => {
    if (user.uid !== recording.userId) {
    try {
      await db.collection('recordings').doc(recordingId).delete();
    } catch (error) {
      console.log('Error while deleting recording', error);
    }
  };
  };

  useEffect(() => {
    if (recordings.length > 0) {
      const fetchRecordingLengths = async () => {
        const lengths = {};

        for (const recording of recordings) {
          try {
            const { sound } = await Audio.Sound.createAsync({ uri: recording.downloadURL });
            const { durationMillis } = await sound.getStatusAsync();
            const durationSeconds = Math.floor(durationMillis / 1000);
            lengths[recording.downloadURL] = durationSeconds;
          } catch (error) {
            console.log('Error while fetching recording length:', error);
          }
        }

        setRecordingLengths(lengths);
      };

      fetchRecordingLengths();
    }
  }, [recordings]);

  const renderRecording = useMemo(() => {
    return ({ item }) => (
      <TouchableOpacity
        style={styles.recordingContainer}
        onPress={() => handlePlay(item.downloadURL)}
      >
        <Text style={styles.recordingTag}>{item.tag}</Text>
        <Text style={styles.recordingUsername}>{item.username}</Text>
        <Text style={styles.recordingLength}>
          {recordingLengths[item.downloadURL] || ''} sec
        </Text>
        <TouchableOpacity
          style={styles.replyButtonContainer}
          onPress={() =>
            navigation.navigate('RecordingDetails', { recordingId: item.id })
          }
        >
          <FontAwesome
            name="reply"
            size={10}
            color="lightblue"
            style={{ bottom: 0, right: 0 }}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }, [recordingLengths]);
  
  

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
  const [recordingLengths, setRecordingLengths] = useState({});

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        const query = firestore.collection('recordings').orderBy('createdAt', 'desc');
        const unsubscribeRealtimeUpdates = query.onSnapshot((snapshot) => {
          const recordingsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setRecordings(recordingsData);
        });

        return () => {
          unsubscribeRealtimeUpdates();
        };
      } else {
        setUser(null);
        setRecordings([]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);



const subscribeToRecordings = () => {
  const query = firestore
    .collection('recordings')
    .orderBy('createdAt', 'desc');

  const unsubscribeRealtimeUpdates = query.onSnapshot((snapshot) => {
    const newRecordings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setRecordings(newRecordings);
  });

  return () => {
    unsubscribeRealtimeUpdates();
  };
};


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
          <Text style={styles.title}>
            Welcome {user.displayName || user.email.substring(0, user.email.indexOf('@'))}!
          </Text>
          <VoiceButton addRecording={addRecording} />
          <RecordingsList recordings={recordings} recordingLengths={recordingLengths} />
          
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
    borderWidth: 3,
    borderColor: 'whitesmoke',
    borderStyle: 'solid',
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
    width: 50,
    height: 50,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  replyButtonTitle: {
    fontSize: 12, // Change the font size to your desired value
  },
  replyButtonContainer: {
    position: 'absolute',
    bottom: 1,
    right: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    padding: 10,
  },
  recordingLength: {
    fontSize: 9,
    color: 'gray',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  


});




