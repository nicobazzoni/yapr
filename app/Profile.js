import React, { useEffect, useState } from 'react';
import { View, Text, Image } from 'react-native';
import { db } from './firebase';

const Profile = ({ userId }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = db.collection('users').doc(userId).onSnapshot((doc) => {
      setUser(doc.data());
    });

    return unsubscribe;
  }, [userId]);

  if (!user) {
    return <Text>Loading...</Text>
  }

  return (
    <View>
   
     
      <Text>Number of recordings: {user.recordings ? user.recordings.length : 0}</Text>
    </View>
  );
};

export default Profile;
