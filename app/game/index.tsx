import { Text } from 'react-native';
import { Link, Stack, useLocalSearchParams } from 'expo-router';

export default function GamePage() {
  const { lobbyID } = useLocalSearchParams<{ lobbyID: string }>();
  return (
    <>
      <Stack.Screen options={{ title: lobbyID }} />
      <Text style={{ marginTop: 50 }}>{lobbyID}</Text>
      <Link href="/lobbies" asChild>
        <Text style={{ marginTop: 40 }}>Back to lobbies</Text>
      </Link>
    </>
  );
}
