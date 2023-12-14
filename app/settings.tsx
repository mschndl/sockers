import { Stack } from 'expo-router';

export default function SettingsPage() {
  return (
    <>
      <Stack.Screen options={{ headerShown: true, headerTitle: 'Settings' }} />
    </>
  );
}
