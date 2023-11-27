import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';

export default function GamePage() {
  const { lobbyID } = useLocalSearchParams<{ lobbyID: string }>();
  return (
    <>
      <Stack.Screen options={{ title: lobbyID }} />
      <Text style={{ marginTop: 50 }}>{lobbyID}</Text>
      {/* <Button onPress={() => router.replace('/lobbies')} title="BACK" /> */}
      <Link href="/lobbies" asChild>
        <Text style={{ marginTop: 40 }}>Back to lobbies</Text>
      </Link>
    </>
  );
}
