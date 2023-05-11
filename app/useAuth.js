import { useEffect, useState } from 'react'
import { auth } from './firebase'

const useAuth = () => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsSignedIn(true);
      } else {
        setIsSignedIn(false);
      }
    });
  
    return () => unsubscribe();
  }, []);

  return user
}

export default useAuth
