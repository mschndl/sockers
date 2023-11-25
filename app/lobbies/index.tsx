import { Button } from 'react-native';
import { Stack, router } from 'expo-router';

export default function Page() {
  return (
    <>
      <Stack.Screen options={{ title: 'Active games' }} />
      <Button
        title="NEXT"
        onPress={() =>
          router.push({
            pathname: '/lobbies/[lobbyID]',
            params: { lobbyID: '999' },
          })
        }
      />
      <Button title="BACK" onPress={() => router.back()} />
    </>
  );
}
