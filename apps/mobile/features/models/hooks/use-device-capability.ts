import type { DeviceTier } from '@/lib/models';
import * as Device from 'expo-device';
import { useMemo } from 'react';

export interface DeviceCapability {
  totalMemoryGB: number | null;
  tier: DeviceTier;
  modelName: string | null;
}

function tierFromMemory(totalBytes: number | null): DeviceTier {
  if (!totalBytes) return 'any';
  const gb = totalBytes / 1e9;
  if (gb >= 7.5) return '8gb';
  if (gb >= 5.5) return '6gb';
  return 'any';
}

export function useDeviceCapability(): DeviceCapability {
  return useMemo(
    () => ({
      totalMemoryGB: Device.totalMemory ? Device.totalMemory / 1e9 : null,
      tier: tierFromMemory(Device.totalMemory ?? null),
      modelName: Device.modelName ?? null,
    }),
    []
  );
}
