import React from "react";
import { FAB as PaperFAB } from "react-native-paper";
export default function FAB({ onPress }: { onPress: () => void }) {
  return (
    <PaperFAB
      icon="plus"
      onPress={onPress}
      style={{ position: "absolute", right: 16, bottom: 24 }}
    />
  );
}
