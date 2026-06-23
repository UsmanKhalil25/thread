import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';
import { Caption, RowTitle } from '@/components/ui/typography';
import { useDownload } from '@/features/models/hooks/use-downloads';
import { cn } from '@/lib/utils';
import type { CatalogModel } from '@/lib/models';
import { ArrowDownToLine, Check, Clock, RotateCcw, Trash2, X } from 'lucide-react-native';
import { View } from 'react-native';

interface DownloadableModelProps {
  model: CatalogModel;
  isLast?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function DownloadableModel({ model, isLast }: DownloadableModelProps) {
  const { status, downloadedBytes, start, cancel, remove } = useDownload(model.id);
  const progress = Math.min(Math.round((downloadedBytes / model.sizeBytes) * 100), 100);

  return (
    <View className={cn('gap-2.5 px-4 py-4', !isLast && 'border-border border-b')}>
      <View className="flex-row items-center gap-3">
        <View className="flex-1 gap-0.5">
          <RowTitle>{model.name}</RowTitle>
          <Caption>
            {model.params} · {model.quant} · {model.sizeLabel}
          </Caption>
        </View>

        {status === 'ready' && (
          <View className="flex-row items-center gap-2">
            <Icon as={Check} className="text-emerald-400" size={15} strokeWidth={2.2} />
            <Button variant="ghost" size="icon" onPress={remove} className="size-8">
              <Icon as={Trash2} className="text-muted-foreground size-4" />
            </Button>
          </View>
        )}
        {status === 'queued' && (
          <View className="flex-row items-center gap-2">
            <Icon as={Clock} className="text-muted-foreground size-4" />
            <Caption>Queued</Caption>
            <Button variant="ghost" size="icon" onPress={cancel} className="size-8">
              <Icon as={X} className="text-muted-foreground size-3.5" />
            </Button>
          </View>
        )}
        {status === 'downloading' && (
          <View className="flex-row items-center gap-2">
            <Caption className="text-blue-400">{progress}%</Caption>
            <Button variant="ghost" size="icon" onPress={cancel} className="size-8">
              <Icon as={X} className="text-muted-foreground size-3.5" />
            </Button>
          </View>
        )}
        {(status === 'idle' || status === 'failed') && (
          <Button variant="ghost" size="icon" onPress={start} className="size-8">
            <Icon
              as={status === 'failed' ? RotateCcw : ArrowDownToLine}
              className={cn(
                'size-4',
                status === 'failed' ? 'text-destructive' : 'text-muted-foreground'
              )}
            />
          </Button>
        )}
      </View>

      {status === 'downloading' && (
        <View className="gap-1.5">
          <Progress value={progress} className="bg-border h-0.5" indicatorClassName="bg-blue-400" />
          <View className="flex-row items-center justify-between">
            <Caption>{formatBytes(downloadedBytes)}</Caption>
            <Caption>{formatBytes(model.sizeBytes)}</Caption>
          </View>
        </View>
      )}

      {status === 'failed' && <Caption className="text-destructive">Download failed</Caption>}
    </View>
  );
}
