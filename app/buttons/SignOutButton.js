
import React from 'react';
import { Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../firebase';

export const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (err) {
      console.error('Failed to sign out', err);
    }
  };

  

