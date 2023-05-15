import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Audio } from 'expo-av';
import HomeScreen from './HomeScreen';
import SignUpScreen from './SignUpScreen';
import LoginScreen from './LoginScreen';
import Voice from './Voice';
import RecordingDetailsScreen from './RecordingDetailsScreen';

const Stack = createStackNavigator();

export default function App() {
  // const configureAudioSession = async () => {
  //   try {
  //     await Audio.setAudioModeAsync({
  //       allowsRecordingIOS: true,
  //       playsInSilentModeIOS: true,
  //       interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS,
  //       shouldDuckAndroid: true,
  //       interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
  //     });
  //   } catch (error) {
  //     console.error('Failed to configure audio session', error);
  //   }
  // };
  
  // useEffect(() => {
  //   configureAudioSession();
  // }, []);

  return (
    <NavigationContainer independent={true} screenOptions={{ headerShown: false, headerTitle: null }}>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false, headerTitle: null }}>
        <Stack.Screen name="Home" component={HomeScreen}options={{ title: '' }} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="LogIn" component={LoginScreen} />
        <Stack.Screen name="Voice" component={Voice} />
        <Stack.Screen name="RecordingDetails" component={RecordingDetailsScreen} options={({ route }) => ({
          recordingId: route.params.recordingId,
        })} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
