import { Button, Text } from 'react-native';
import {
  Stack,
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';
import { useCallback, useState } from 'react';
import socket from 'socket';
import { Lobby } from 'common/types';

export default function Page() {
  const { lobbyID } = useLocalSearchParams<{ lobbyID: string }>();
  const [lobby, setLobby] = useState<Lobby>();

  useFocusEffect(
    useCallback(() => {
      socket.emit('getLobbyData', lobbyID);
      socket.on('lobbyUpdate', (lobbyData: Lobby) => {
        setLobby(lobbyData);
      });
      return () => {
        console.log('unmount');
        socket.off('lobbyUpdate');
      };
    }, [lobbyID])
  );

  const handleStartGame = useCallback(() => {
    if (lobby) {
      router.replace({ pathname: '/game', params: { lobbyID: lobby.id } });
    }
  }, [lobby]);

  return (
    <>
      <Stack.Screen options={{ title: lobbyID }} />
      <Text>{lobbyID}</Text>
      <Button title="Start" onPress={handleStartGame} />
    </>
  );
}
