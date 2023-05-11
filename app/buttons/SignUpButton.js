import React from 'react';
import { Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';


const SignUpButton = () => {
    const navigation = useNavigation();
  
    const handlePress = () => {
      navigation.navigate('SignUp');
    };
  
    return <Button title="Sign Up" onPress={handlePress} />;
  };

export default SignUpButton;
