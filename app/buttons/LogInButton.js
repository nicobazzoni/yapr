import React from 'react';
import { Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const LoginButton = () => {
  const navigation = useNavigation();
  return (
    <Button title="Log In" onPress={() => navigation.navigate('LogIn')} />
  );
};

export default LoginButton;



