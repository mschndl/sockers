import { Text } from 'react-native';
import { Link } from 'expo-router';

export default function Page() {
  // const port = process.env.EXPO_PUBLIC_PORT;
  return (
    <Link href="/lobbies" asChild>
      <Text style={{ marginTop: 40 }}>Go to lobbies</Text>
    </Link>
  );
}
