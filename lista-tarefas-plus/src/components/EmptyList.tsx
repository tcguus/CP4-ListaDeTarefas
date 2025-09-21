import { View } from "react-native";
import { Text, Button } from "react-native-paper";
export const EmptyList = ({ onAdd }: { onAdd(): void }) => (
  <View style={{ alignItems: "center", paddingVertical: 48 }}>
    <Text variant="titleLarge" style={{ marginBottom: 8 }}>
      Nada por aqui…
    </Text>
    <Text
      variant="bodyMedium"
      style={{ opacity: 0.7, marginBottom: 16, textAlign: "center" }}
    >
      Crie sua primeira tarefa e eu te lembro no horário certo.
    </Text>
    <Button mode="contained" icon="plus" onPress={onAdd}>
      Adicionar tarefa
    </Button>
  </View>
);
