import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import socket from 'socket';
import useStore from 'store';

export default function Page() {
  const { username, setUsername } = useStore();
  const [isFirstTime, setIsFirstTime] = useState<boolean>(true);
  useEffect(() => {
    AsyncStorage.getItem('username').then((storedUsername) => {
      if (storedUsername) {
        setUsername(storedUsername);
        setIsFirstTime(false);
      }
    });
  }, [setUsername]);
  useEffect(() => {
    socket.connect();
    socket.on('connect', () => console.log('connected'));
  }, []);

  const handleUsernameConfirm = async () => {
    await AsyncStorage.setItem('username', username.trim());
    setUsername(username.trim());
    setIsFirstTime(false);
  };

  const clearAsyncStorage = async () => {
    AsyncStorage.clear();
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      {isFirstTime ? (
        <>
          <Text>Please enter your username:</Text>
          <TextInput
            style={{
              height: 40,
              borderColor: 'gray',
              borderWidth: 1,
              marginBottom: 10,
            }}
            placeholder="Username"
            value={username}
            onChangeText={(text) => setUsername(text)}
          />
          <Button
            title="Confirm"
            onPress={handleUsernameConfirm}
            disabled={username === ''}
          />
        </>
      ) : (
        <>
          <Text>Welcome,</Text>
          <Text style={{ fontSize: 40 }}>{username}</Text>
          <View style={{ flexDirection: 'row' }}>
            <Button title="PLAY" onPress={() => router.replace('/lobbies')} />
            <Button title="SETTINGS" onPress={() => router.push('/settings')} />
          </View>
          <Button title="Clear storage" onPress={clearAsyncStorage} />
        </>
      )}
    </View>
  );
}
