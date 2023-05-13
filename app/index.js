import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './HomeScreen';
import SignUpScreen from './SignUpScreen';
import LoginScreen from './LoginScreen';
import Voice from './Voice';
import RecordingDetailsScreen from './RecordingDetailsScreen';

const Stack = createStackNavigator();


export default function App() {
  return (
    <NavigationContainer independent={true}    >
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false}}  >
        <Stack.Screen name="Home" component={HomeScreen}  options={{ headerShown: false, title: '' }} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="LogIn" component={LoginScreen} />
        <Stack.Screen name="Voice" component={Voice} />
        <Stack.Screen name="RecordingDetails" component={RecordingDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

