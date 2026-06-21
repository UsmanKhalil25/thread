import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import type { ComponentProps } from 'react';

type TypographyProps = ComponentProps<typeof Text>;

export function Title({ className, ...props }: TypographyProps) {
  return (
    <Text
      className={cn('text-foreground text-4xl font-extrabold tracking-tight', className)}
      {...props}
    />
  );
}

export function ScreenTitle({ className, ...props }: TypographyProps) {
  return (
    <Text
      className={cn('text-foreground text-3xl font-bold tracking-tight', className)}
      {...props}
    />
  );
}

export function SectionTitle({ className, ...props }: TypographyProps) {
  return (
    <Text
      className={cn('text-foreground text-2xl font-bold tracking-tight', className)}
      {...props}
    />
  );
}

export function RowTitle({ className, ...props }: TypographyProps) {
  return <Text className={cn('text-foreground text-sm font-semibold', className)} {...props} />;
}

export function Subtitle({ className, ...props }: TypographyProps) {
  return (
    <Text
      className={cn('text-muted-foreground font-mono text-base leading-relaxed', className)}
      {...props}
    />
  );
}

export function Caption({ className, ...props }: TypographyProps) {
  return <Text className={cn('text-muted-foreground font-mono text-xs', className)} {...props} />;
}
