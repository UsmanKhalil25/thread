import { THEME } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Platform, TextInput } from 'react-native';
import { useUniwind } from 'uniwind';

const inputVariants = cva('text-foreground placeholder:text-muted-foreground/50 min-w-0', {
  variants: {
    variant: {
      default: cn(
        'dark:bg-input/30 border-input bg-background flex h-10 w-full flex-row items-center rounded-md border px-3 py-1 text-base leading-5 shadow-sm shadow-black/5 sm:h-9',
        Platform.select({
          web: cn(
            'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground transition-[color,box-shadow] outline-none md:text-sm',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
            'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive'
          ),
        })
      ),
      ghost: 'h-auto flex-1 bg-transparent text-sm leading-normal',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type InputProps = React.ComponentProps<typeof TextInput> &
  React.RefAttributes<TextInput> &
  VariantProps<typeof inputVariants>;

function Input({ className, variant, placeholderTextColor, ...props }: InputProps) {
  const { theme } = useUniwind();
  const resolvedPlaceholderColor =
    placeholderTextColor ?? THEME[theme ?? 'light'].mutedForeground + '80';

  return (
    <TextInput
      placeholderTextColor={resolvedPlaceholderColor}
      className={cn(
        props.editable === false &&
          cn(
            'opacity-50',
            Platform.select({ web: 'disabled:pointer-events-none disabled:cursor-not-allowed' })
          ),
        inputVariants({ variant }),
        className
      )}
      {...props}
    />
  );
}

export { Input, inputVariants };
export type { InputProps };
