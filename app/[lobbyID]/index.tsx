import { Lobby, LobbyPlayer } from 'common/types';
import {
  Stack,
  router,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, FlatList, LayoutAnimation, Text, View } from 'react-native';
import socket from 'socket';

export default function Page() {
  const { lobbyID } = useLocalSearchParams<{ lobbyID: string }>();
  const [lobby, setLobby] = useState<Lobby>();
  const [amHost, setAmHost] = useState<boolean>(false);
  const navigation = useNavigation();

  const prevLobbyRef = useRef(lobby);

  useFocusEffect(
    useCallback(() => {
      socket.emit('getLobbyData', lobbyID);
      socket.on('lobbyUpdate', (lobbyData: Lobby) => {
        setLobby(lobbyData);
      });
      socket.on('becomeHost', () => setAmHost(true));
      return () => {
        setAmHost(false);
        socket.off('becomeHost');
        socket.off('lobbyUpdate');
      };
    }, [lobbyID])
  );

  const renderPlayerItem = ({ item }: { item: LobbyPlayer }) => (
    <View
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
    >
      <Text style={{ textAlign: 'center' }}>
        <Text>{item.isHost ? '👑' : null}</Text>{' '}
        <Text style={{ fontWeight: 'bold' }}>{item.username}</Text>{' '}
        {item.ready ? 'Ready' : 'Not ready'}
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

  const leaveLobby = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const handleStartGame = useCallback(() => {
    if (lobby) {
      router.replace({ pathname: './game', params: { lobbyID: lobby.id } });
    }
  }, [lobby]);

  useEffect(() => {
    if (
      lobby &&
      prevLobbyRef.current &&
      Object.values(lobby.players).length <
        Object.values(prevLobbyRef.current.players).length
    ) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    prevLobbyRef.current = lobby;
  }, [lobby]);

  return (
    <>
      <Stack.Screen
        options={{
          title: lobby?.name,
          headerRight: amHost
            ? () => (
                <Button
                  title="Settings"
                  onPress={() => router.push('/settings')}
                />
              )
            : undefined,
          headerLeft: () => <Button title="Leave" onPress={leaveLobby} />,
        }}
      />
      {lobby && (
        <FlatList
          contentContainerStyle={{
            alignItems: 'center',
            gap: 10,
            padding: 10,
          }}
          data={Object.values(lobby.players)}
          keyExtractor={(player) => player.id}
          renderItem={renderPlayerItem}
          ListHeaderComponent={() => (
            <View>
              <Text>headers</Text>
            </View>
          )}
          ListFooterComponent={
            amHost
              ? () => (
                  <View
                    style={{
                      flexDirection: 'row',
                    }}
                  >
                    <Button title="Start" onPress={handleStartGame} />
                  </View>
                )
              : null
          }
        />
      )}
    </>
  );
}
