import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Link, type Href } from 'expo-router';
import { MoveRight } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

export function OnboardingButton({
  href,
  label,
  icon,
}: {
  href: Href;
  label: string;
  icon?: LucideIcon;
}) {
  return (
    <Link href={href} asChild>
      <Button>
        <Text className="text-primary-foreground text-base font-semibold">{label}</Text>
        <Icon as={icon ?? MoveRight} className="text-primary-foreground size-5" />
      </Button>
    </Link>
  );
}
