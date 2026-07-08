import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import * as Clipboard from 'expo-clipboard';
import { Check, Copy, Pencil, RotateCcw } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

interface MessageActionsProps {
  content: string;
  align: 'start' | 'end';
  onEdit?: () => void;
  onRegenerate?: () => void;
  disabled?: boolean;
}

export function MessageActions({
  content,
  align,
  onEdit,
  onRegenerate,
  disabled,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  async function handleCopy() {
    await Clipboard.setStringAsync(content);
    setCopied(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setCopied(false);
      timeoutRef.current = null;
    }, 1500);
  }

  return (
    <View className={`flex-row gap-1 ${align === 'end' ? 'justify-end' : 'justify-start'}`}>
      <Button variant="ghost" size="icon" onPress={handleCopy} className="size-7 rounded-lg">
        <Icon as={copied ? Check : Copy} className="text-muted-foreground size-4" />
      </Button>
      {onEdit ? (
        <Button
          variant="ghost"
          size="icon"
          onPress={onEdit}
          disabled={disabled}
          className="size-7 rounded-lg">
          <Icon as={Pencil} className="text-muted-foreground size-4" />
        </Button>
      ) : null}
      {onRegenerate ? (
        <Button
          variant="ghost"
          size="icon"
          onPress={onRegenerate}
          disabled={disabled}
          className="size-7 rounded-lg">
          <Icon as={RotateCcw} className="text-muted-foreground size-4" />
        </Button>
      ) : null}
    </View>
  );
}
