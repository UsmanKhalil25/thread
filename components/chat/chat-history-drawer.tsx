import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Sheet, SheetContent, SheetFooter, SheetHeader } from '@/components/ui/sheet';
import { Text } from '@/components/ui/text';
import { Database, Plus, Search, Settings, X } from 'lucide-react-native';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TODAY_CHATS = [
  { id: '1', title: 'Rust async runtime', time: 'Now' },
  { id: '2', title: 'Refactor auth middleware', time: '2h' },
];

const EARLIER_CHATS = [
  { id: '3', title: 'Plan the week', time: 'Yesterday' },
  { id: '4', title: 'Translate Hokusai essay', time: 'Yesterday' },
  { id: '5', title: 'RAG over journal entries', time: 'Mon' },
  { id: '6', title: 'Dinner ideas with shiso', time: 'Mon' },
  { id: '7', title: 'Notes on Bach partitas', time: 'Sun' },
];

interface ChatHistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  onNewChat?: () => void;
  onSelectChat?: (id: string) => void;
  onModels?: () => void;
  onSettings?: () => void;
}

export function ChatHistoryDrawer({
  open,
  onClose,
  onNewChat,
  onSelectChat,
  onModels,
  onSettings,
}: ChatHistoryDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="left">
        <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
          <SheetHeader>
            <Button variant="ghost" size="icon" onPress={onClose}>
              <Icon as={X} className="text-sidebar-foreground size-5" />
            </Button>
          </SheetHeader>

          <View className="border-border mx-4 mb-3 h-10 flex-row items-center gap-2 rounded-xl border px-3">
            <Icon as={Search} className="text-muted-foreground size-4" />
            <TextInput
              placeholder="Search chats"
              placeholderTextColor="#71717a"
              className="text-sidebar-foreground flex-1 text-sm"
            />
          </View>

          <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
            <Text className="text-muted-foreground pb-1 text-[10px] font-medium tracking-wider uppercase">
              Today
            </Text>
            {TODAY_CHATS.map((chat) => (
              <Pressable
                key={chat.id}
                onPress={() => onSelectChat?.(chat.id)}
                className="flex-row items-center justify-between py-3">
                <Text className="text-sidebar-foreground flex-1 text-sm">{chat.title}</Text>
                <Text className="text-muted-foreground text-xs">{chat.time}</Text>
              </Pressable>
            ))}

            <Text className="text-muted-foreground pt-4 pb-1 text-[10px] font-medium tracking-wider uppercase">
              Earlier
            </Text>
            {EARLIER_CHATS.map((chat) => (
              <Pressable
                key={chat.id}
                onPress={() => onSelectChat?.(chat.id)}
                className="flex-row items-center justify-between py-3">
                <Text className="text-sidebar-foreground flex-1 text-sm">{chat.title}</Text>
                <Text className="text-muted-foreground text-xs">{chat.time}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <SheetFooter className="gap-0 pb-4">
            <Button
              variant={'ghost'}
              onPress={onModels}
              className="flex-row items-center justify-start gap-3 py-3">
              <Icon as={Database} className="text-sidebar-foreground size-5" />
              <Text className="text-sidebar-foreground text-sm font-medium">Models</Text>
            </Button>

            <Button
              variant={'ghost'}
              onPress={onModels}
              className="flex-row items-center justify-start gap-3 py-3">
              <Icon as={Settings} className="text-sidebar-foreground size-5" />
              <Text className="text-sidebar-foreground text-sm font-medium">Settings</Text>
            </Button>

            <View className="border-sidebar-border my-1 border-t" />
            <View className="flex-row items-center gap-3 py-3">
              <View className="bg-background h-10 w-10 items-center justify-center rounded-xl">
                <Text className="text-foreground text-sm font-bold">SK</Text>
              </View>
              <View className="gap-0.5">
                <Text className="text-sidebar-foreground text-sm font-semibold">Sam Kepler</Text>
                <Text className="text-muted-foreground text-xs">local profile</Text>
              </View>
            </View>
          </SheetFooter>
        </SafeAreaView>
      </SheetContent>
    </Sheet>
  );
}
