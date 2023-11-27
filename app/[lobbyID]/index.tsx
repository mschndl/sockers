import { Lobby, Player } from 'common/types';
import {
  Stack,
  router,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Button, FlatList, Text, View } from 'react-native';
import socket from 'socket';

export default function Page() {
  const { lobbyID } = useLocalSearchParams<{ lobbyID: string }>();
  const [lobby, setLobby] = useState<Lobby>();
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      socket.emit('getLobbyData', lobbyID);
      socket.on('lobbyUpdate', (lobbyData: Lobby) => {
        setLobby(lobbyData);
      });
      return () => {
        socket.off('lobbyUpdate');
      };
    }, [lobbyID])
  );

  const renderPlayerItem = ({ item }: { item: Player }) => (
    <View>
      <Text>
        {item.username} {item.isHost ? 'HOST' : null}
      </Text>
    </View>
  );

  useEffect(
    () =>
      navigation.addListener('beforeRemove', () => {
        socket.emit('leftLobby', lobbyID);
      }),
    [lobbyID, navigation]
  );

  const handleStartGame = useCallback(() => {
    if (lobby) {
      router.replace({ pathname: './game', params: { lobbyID: lobby.id } });
    }
  }, [lobby]);

  return (
    <>
      <Stack.Screen options={{ title: lobbyID }} />
      {lobby && (
        <FlatList
          contentContainerStyle={{
            alignItems: 'center',
          }}
          data={Object.values(lobby.players)}
          keyExtractor={(player) => player.id}
          renderItem={renderPlayerItem}
        />
      )}
      <Button title="Go to settings" onPress={() => router.push('/settings')} />
      <Button title="Start" onPress={handleStartGame} />
    </>
  );
}
