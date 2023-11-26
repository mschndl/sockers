import { Button, View } from 'react-native';
import { router } from 'expo-router';
import { useEffect } from 'react';
import socket from 'socket';

export default function Page() {
  useEffect(() => {
    socket.connect();
    socket.on('connect', () => console.log('connected'));
  }, []);
  return (
    <View style={{ flex: 1, alignContent: 'center', justifyContent: 'center' }}>
      <Button
        title="Go to lobbies"
        onPress={() => router.replace('/lobbies')}
      />
    </View>
  );
}
