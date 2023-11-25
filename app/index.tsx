import { Button, View } from 'react-native';
import { router } from 'expo-router';

export default function Page() {
  // const port = process.env.EXPO_PUBLIC_PORT;
  return (
    <View style={{ flex: 1, alignContent: 'center', justifyContent: 'center' }}>
      <Button
        title="Go to lobbies"
        onPress={() => router.replace('/lobbies')}
      />
    </View>
  );
}
