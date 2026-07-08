import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as DialogPrimitive from '@rn-primitives/dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideInLeft,
  SlideInRight,
  SlideInUp,
  SlideOutDown,
  SlideOutLeft,
  SlideOutRight,
  SlideOutUp,
} from 'react-native-reanimated';

// ─── Root ────────────────────────────────────────────────────────────────────

const Sheet = DialogPrimitive.Root;
Sheet.displayName = 'Sheet';

// ─── Trigger ─────────────────────────────────────────────────────────────────

const SheetTrigger = DialogPrimitive.Trigger;
SheetTrigger.displayName = 'SheetTrigger';

// ─── Close ───────────────────────────────────────────────────────────────────

const SheetClose = DialogPrimitive.Close;
SheetClose.displayName = 'SheetClose';

// ─── Portal ──────────────────────────────────────────────────────────────────

const SheetPortal = DialogPrimitive.Portal;

// ─── Overlay ─────────────────────────────────────────────────────────────────

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      className="absolute inset-0">
      <DialogPrimitive.Overlay
        className={cn('absolute inset-0 bg-black/50', className)}
        {...props}
      />
    </Animated.View>
  );
}
SheetOverlay.displayName = 'SheetOverlay';

// ─── Content ─────────────────────────────────────────────────────────────────

const sheetContentVariants = cva('bg-sidebar border-sidebar-border absolute flex flex-col border', {
  variants: {
    side: {
      right: 'top-0 right-0 h-full w-[85%] border-l',
      left: 'top-0 left-0 h-full w-[85%] border-r',
      top: 'top-0 left-0 h-auto w-full border-b',
      bottom: 'bottom-0 left-0 h-auto w-full border-t',
    },
  },
  defaultVariants: {
    side: 'right',
  },
});

const ENTERING = {
  right: SlideInRight,
  left: SlideInLeft,
  top: SlideInUp,
  bottom: SlideInDown,
} as const;

const EXITING = {
  right: SlideOutRight,
  left: SlideOutLeft,
  top: SlideOutUp,
  bottom: SlideOutDown,
} as const;

type Side = 'right' | 'left' | 'top' | 'bottom';

type SheetContentProps = React.ComponentProps<typeof DialogPrimitive.Content> &
  VariantProps<typeof sheetContentVariants> & {
    side?: Side;
  };

function SheetContent({ className, side = 'right', children, ...props }: SheetContentProps) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content {...props} asChild>
        {/*
         * Plain View wrapper is intentional. DialogPrimitive.Content (asChild) uses
         * Slot/cloneElement and forwards its nativeID onto the direct child. Reanimated
         * uses nativeID internally to register `entering` animations — overwriting it
         * silently breaks the enter animation with no error thrown. The wrapper View
         * absorbs the dialog's nativeID + accessibility props; the Animated.View inside
         * keeps its own uncontested nativeID so Reanimated can register SlideIn correctly.
         * StyleSheet.absoluteFillObject ensures h-full in the CVA classes resolves
         * against the full portal area.
         */}
        <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
          <Animated.View
            entering={ENTERING[side].duration(280)}
            exiting={EXITING[side].duration(250)}
            className={cn(sheetContentVariants({ side }), className)}>
            {children}
          </Animated.View>
        </View>
      </DialogPrimitive.Content>
    </SheetPortal>
  );
}
SheetContent.displayName = 'SheetContent';

// ─── Header ──────────────────────────────────────────────────────────────────

function SheetHeader({ className, ...props }: React.ComponentProps<typeof View>) {
  return (
    <View
      className={cn('flex-row items-center justify-between gap-2 px-4 py-3', className)}
      {...props}
    />
  );
}
SheetHeader.displayName = 'SheetHeader';

// ─── Footer ──────────────────────────────────────────────────────────────────

function SheetFooter({ className, ...props }: React.ComponentProps<typeof View>) {
  return (
    <View
      className={cn(
        'border-sidebar-border flex-col gap-1 border-t px-4 py-3',
        Platform.select({ web: 'flex-row sm:justify-end' }),
        className
      )}
      {...props}
    />
  );
}
SheetFooter.displayName = 'SheetFooter';

// ─── Title ────────────────────────────────────────────────────────────────────

function SheetTitle({ className, ...props }: React.ComponentProps<typeof Text>) {
  return (
    <Text className={cn('text-sidebar-foreground text-lg font-semibold', className)} {...props} />
  );
}
SheetTitle.displayName = 'SheetTitle';

// ─── Description ─────────────────────────────────────────────────────────────

function SheetDescription({ className, ...props }: React.ComponentProps<typeof Text>) {
  return <Text className={cn('text-muted-foreground text-sm', className)} {...props} />;
}
SheetDescription.displayName = 'SheetDescription';

// ─── Exports ─────────────────────────────────────────────────────────────────

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
};
