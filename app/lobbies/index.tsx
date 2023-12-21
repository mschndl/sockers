import { MAXIMUM_PLAYERS_PER_LOBBY } from 'common/constants';
import { CreateLobbyResponse, JoinLobbyResponse, Lobby } from 'common/types';
import { Stack, router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Button,
  FlatList,
  LayoutAnimation,
  ListRenderItem,
  Pressable,
  Text,
  UIManager,
  View,
} from 'react-native';
import socket from 'socket';
import useStore from 'store';

UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);

export default function Page() {
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { username } = useStore();

  const prevLobbiesRef = useRef(lobbies);

  const handleLobbiesUpdate = useCallback((lobbiesUpdate: Lobby[]) => {
    if (lobbiesUpdate.length > prevLobbiesRef.current.length) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setLobbies(lobbiesUpdate);
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
      socket.emit('joinLobby', item.id, username);
      socket.once('joinLobbyResponse', (response: JoinLobbyResponse) => {
        if (response.success) {
          router.push({
            pathname: '/[lobbyID]/',
            params: { lobbyID: item.id },
          });
        } else {
          console.error('Failed to join lobby:', response.error);
        }
      });
    };

    return (
      <Pressable
        style={{
          borderRadius: 4,
          backgroundColor: 'white',
          padding: 10,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.2,
          shadowRadius: 1.41,

          elevation: 2,
        }}
        onPress={handleJoinLobby}
      >
        <Text>
          <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
          {' | '}
          {Object.keys(item.players).length}/{MAXIMUM_PLAYERS_PER_LOBBY + '👥'}
        </Text>
      </Pressable>
    );
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    socket.emit('getLobbiesData');
  }, []);

  const handleCreateRoom = useCallback(() => {
    socket.emit('createRoom', username);
    socket.once('createRoomResponse', (response: CreateLobbyResponse) => {
      if (response.success) {
        router.push({
          pathname: '/[lobbyID]/',
          params: { lobbyID: response.roomId },
        });
      } else {
        console.error('Failed to create room:', response.error);
      }
    });
  }, [username]);

  useEffect(() => {
    if (lobbies.length < prevLobbiesRef.current.length) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    prevLobbiesRef.current = lobbies;
  }, [lobbies]);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Active games',
          headerRight: () => <Button title="+" onPress={handleCreateRoom} />,
        }}
      />
      <FlatList
        contentContainerStyle={{
          alignItems: 'center',
          gap: 10,
          padding: 10,
        }}
        data={lobbies}
        keyExtractor={(lobby) => lobby.id}
        renderItem={renderLobbyItem}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListHeaderComponent={() => (
          <View>
            <Text>headers</Text>
          </View>
        )}
      />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          marginBottom: 40,
        }}
      >
        <Button title="Settings" onPress={() => router.push('/settings')} />
        <Button title="Home" onPress={() => router.replace('/')} />
      </View>
    </>
  );
}
