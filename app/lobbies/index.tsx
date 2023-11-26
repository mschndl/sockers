import {
  Button,
  ListRenderItem,
  Pressable,
  Text,
  FlatList,
} from 'react-native';
import { Stack, router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import socket from 'socket';
import { CreateLobbyResponse, JoinLobbyResponse, Lobby } from 'common/types';
import { MAXIMUM_PLAYERS_PER_LOBBY } from 'common/constants';

export default function Page() {
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const handleLobbiesUpdate = useCallback((lobbiesUpdate: Lobby[]) => {
    setLobbies(() => {
      const updatedLobbies = lobbiesUpdate.map((lobby) => ({
        ...lobby,
        players: new Map(Object.entries(lobby.players)),
      }));
      return [...updatedLobbies];
    });

    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      socket.emit('enteredLobbiesRoom');
      socket.on('lobbiesUpdate', handleLobbiesUpdate);
      return () => {
        socket.off('joinLobbyResponse');
        socket.off('lobbiesUpdate');
      };
    }, [handleLobbiesUpdate])
  );

  const renderLobbyItem: ListRenderItem<Lobby> = ({ item }) => {
    const handleJoinLobby = () => {
      socket.emit('joinLobby', { lobbyId: item.id });
      socket.once('joinLobbyResponse', (response: JoinLobbyResponse) => {
        if (response.success) {
          router.push({
            pathname: '/lobbies/[lobbyID]',
            params: { lobbyID: item.id },
          });
        } else {
          console.error('Failed to join lobby:', response.error);
        }
      });
    };

    return (
      <Pressable onPress={handleJoinLobby}>
        <Text>
          Lobby ID: {item.id} Players: {item.players.size}/
          {MAXIMUM_PLAYERS_PER_LOBBY}
        </Text>
      </Pressable>
    );
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true); // Start the refresh loading indicator
    socket.emit('getLobbiesData');
  }, []);

  const handleCreateRoom = useCallback(() => {
    socket.emit('createRoom');
    socket.once('createRoomResponse', (response: CreateLobbyResponse) => {
      if (response.success) {
        router.push({
          pathname: '/lobbies/[lobbyID]',
          params: { lobbyID: response.roomId },
        });
      } else {
        console.error('Failed to create room:', response.error);
      }
    });
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: 'Active games' }} />
      <FlatList
        contentContainerStyle={{
          alignItems: 'center',
        }}
        data={lobbies}
        keyExtractor={(lobby) => lobby.id}
        renderItem={renderLobbyItem}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
      <Button title="CREATE ROOM" onPress={handleCreateRoom} />
      <Button title="BACK" onPress={() => router.replace('/')} />
    </>
  );
}
