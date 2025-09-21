import React from "react";
import { View } from "react-native";
import {
  Card,
  Checkbox,
  Text,
  IconButton,
  Chip,
  useTheme,
} from "react-native-paper";

type Props = {
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  onToggle(): void;
  onEdit(): void;
  onDelete(): void;
};

export default function TaskItem(p: Props) {
  const th = useTheme();
  return (
    <Card mode="elevated" style={{ marginBottom: 12, borderRadius: 16 }}>
      <Card.Content
        style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}
      >
        <Checkbox
          status={p.completed ? "checked" : "unchecked"}
          onPress={p.onToggle}
        />
        <View style={{ flex: 1 }}>
          <Text
            variant="titleMedium"
            style={{
              textDecorationLine: p.completed ? "line-through" : "none",
            }}
          >
            {p.title}
          </Text>
          {!!p.description && (
            <Text variant="bodyMedium" style={{ opacity: 0.8, marginTop: 2 }}>
              {p.description}
            </Text>
          )}
          <View style={{ marginTop: 8, flexDirection: "row", gap: 8 }}>
            {p.dueDate && (
              <Chip compact icon="calendar" elevated>
                {new Date(p.dueDate).toLocaleDateString()}
              </Chip>
            )}
            {p.completed && (
              <Chip
                compact
                icon="check"
                style={{ backgroundColor: th.colors.secondaryContainer }}
              >
                Concluída
              </Chip>
            )}
          </View>
        </View>
        <IconButton icon="pencil" onPress={p.onEdit} />
        <IconButton icon="delete" onPress={p.onDelete} />
      </Card.Content>
    </Card>
  );
}
