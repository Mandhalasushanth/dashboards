import React from 'react';
import { Stack } from 'expo-router';

export function PaymentNavigator() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PaymentsHome" />
    </Stack>
  );
}
export default PaymentNavigator;
