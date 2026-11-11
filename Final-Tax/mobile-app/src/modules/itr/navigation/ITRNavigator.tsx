import React from "react";
import { Stack } from "expo-router";

export function ITRNavigator() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="itr" />
      <Stack.Screen name="itr-filing" />
      <Stack.Screen name="itr-income-info" />
      <Stack.Screen name="itr-deductions" />
      <Stack.Screen name="itr-documents" />
      <Stack.Screen name="itr-review" />
      <Stack.Screen name="itr-filed" />
      <Stack.Screen name="itr-success" />
      <Stack.Screen name="tds-refund" />
      <Stack.Screen name="previous-year-itr" />
      <Stack.Screen name="revised-itr" />
    </Stack>
  );
}

export default ITRNavigator;
