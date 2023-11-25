import { Button, Text } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';

export default function Page() {
  const { lobbyID } = useLocalSearchParams<{ lobbyID: string }>();
  return (
    <>
      <Stack.Screen options={{ title: lobbyID }} />
      <Text>{lobbyID}</Text>
      <Button
        title="Start"
        onPress={() =>
          router.replace({ pathname: '/game', params: { lobbyID } })
        }
      />
    </>
  );
}
