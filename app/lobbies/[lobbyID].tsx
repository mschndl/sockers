import { Text } from 'react-native';
import { Link, Stack, useLocalSearchParams } from 'expo-router';

export default function Page() {
  const { lobbyID } = useLocalSearchParams<{ lobbyID: string }>();
  return (
    <>
      <Stack.Screen options={{ title: lobbyID }} />
      <Text>{lobbyID}</Text>
      <Link href={{ pathname: '/game', params: { lobbyID } }} asChild>
        <Text style={{ marginTop: 40 }}>Go to game</Text>
      </Link>
    </>
  );
}
