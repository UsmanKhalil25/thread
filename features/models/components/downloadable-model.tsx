import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';
import { Text } from '@/components/ui/text';
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

function formatSpeed(bytesPerSecond: number): string {
  if (bytesPerSecond < 1024 * 1024) return `${(bytesPerSecond / 1024).toFixed(0)} KB/s`;
  if (bytesPerSecond < 1024 * 1024 * 1024)
    return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`;
  return `${(bytesPerSecond / (1024 * 1024 * 1024)).toFixed(2)} GB/s`;
}

export function DownloadableModel({ model, isLast }: DownloadableModelProps) {
  const { status, downloadedBytes, totalBytes, speed, start, cancel, remove } = useDownload(
    model.id
  );
  const total = totalBytes && totalBytes > 0 ? totalBytes : model.sizeBytes;
  const progress = total > 0 ? Math.min(Math.round((downloadedBytes / total) * 100), 100) : 0;

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value={model.id} className={isLast ? 'border-b-0' : undefined}>
        <View className="gap-2.5 px-4 py-4">
          <View className="flex-row items-center gap-3">
            <View className="flex-1">
              <AccordionTrigger showIcon={false} className="rounded-none py-0 pr-1">
                <View className="flex-1 gap-0.5">
                  <RowTitle>{model.name}</RowTitle>
                  <Caption>
                    {model.params} · {model.quant} · {model.sizeLabel}
                  </Caption>
                </View>
              </AccordionTrigger>
            </View>

            {status === 'ready' && (
              <View className="flex-row items-center gap-2">
                <Icon as={Check} className="text-emerald-400" size={15} strokeWidth={2.2} />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <Icon as={Trash2} className="text-destructive size-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete model?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This removes {model.name} from this device. You can download it again later.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>
                        <Text>Cancel</Text>
                      </AlertDialogCancel>
                      <AlertDialogAction onPress={remove}>
                        <Text>Delete</Text>
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
              <Progress
                value={progress}
                className="bg-border h-0.5"
                indicatorClassName="bg-blue-400"
              />
              <View className="flex-row items-center justify-between">
                <Caption>{speed > 0 ? formatSpeed(speed) : '—'}</Caption>
                <Caption>
                  {formatBytes(downloadedBytes)} / {formatBytes(total)}
                </Caption>
              </View>
            </View>
          )}

          {status === 'failed' && <Caption className="text-destructive">Download failed</Caption>}
        </View>

        <AccordionContent className="px-4 pt-0">
          <Caption className="leading-relaxed">{model.description}</Caption>
          <Caption>
            RAM {model.ramLabel} · {model.deviceTier === 'any' ? 'Any device' : model.deviceTier}
          </Caption>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
