import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useState } from 'react';
import { View } from 'react-native';

interface MessageEditorProps {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
}

export function MessageEditor({ initialValue, onSave, onCancel }: MessageEditorProps) {
  const [value, setValue] = useState(initialValue);
  const canSave = value.trim().length > 0 && value.trim() !== initialValue.trim();

  return (
    <View className="border-border bg-card w-full gap-2 rounded-2xl border p-3">
      <Input
        variant="ghost"
        multiline
        autoFocus
        value={value}
        onChangeText={setValue}
        className="max-h-40"
      />
      <View className="flex-row justify-end gap-2">
        <Button variant="ghost" size="sm" onPress={onCancel}>
          <Text>Cancel</Text>
        </Button>
        <Button size="sm" disabled={!canSave} onPress={() => onSave(value.trim())}>
          <Text>Save</Text>
        </Button>
      </View>
    </View>
  );
}
