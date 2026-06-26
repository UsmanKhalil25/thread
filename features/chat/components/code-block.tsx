import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';
import * as Clipboard from 'expo-clipboard';
import { memo, type ComponentType, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import CodeHighlighter, { type ReactStyle } from 'react-native-code-highlighter';

interface CodeBlockProps {
  code: string;
  language?: string;
  scheme: 'light' | 'dark';
  isStreaming?: boolean;
}

function hljsTheme(scheme: 'light' | 'dark'): ReactStyle {
  const theme = THEME[scheme];
  const c =
    scheme === 'dark'
      ? {
          fg: '#e6e6e6',
          kw: '#c792ea',
          str: '#c3e88d',
          num: '#f78c6c',
          comment: '#7a818e',
          fn: '#82aaff',
          attr: '#ffcb6b',
        }
      : {
          fg: '#24292e',
          kw: '#d73a49',
          str: '#032f62',
          num: '#005cc5',
          comment: '#6a737d',
          fn: '#6f42c1',
          attr: '#e36209',
        };

  return {
    hljs: { color: c.fg, backgroundColor: theme.card },
    'hljs-keyword': { color: c.kw },
    'hljs-built_in': { color: c.kw },
    'hljs-string': { color: c.str },
    'hljs-number': { color: c.num },
    'hljs-literal': { color: c.num },
    'hljs-comment': { color: c.comment, fontStyle: 'italic' },
    'hljs-function': { color: c.fn },
    'hljs-title': { color: c.fn },
    'hljs-attr': { color: c.attr },
    'hljs-attribute': { color: c.attr },
    'hljs-params': { color: c.fg },
    'hljs-punctuation': { color: c.fg },
  };
}

interface HighlightProps {
  children?: string;
  hljsStyle: ReactStyle;
  language?: string;
  textStyle: {
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
  };
  scrollViewProps: {
    horizontal: true;
    showsHorizontalScrollIndicator: false;
    contentContainerStyle: {
      padding: number;
      minWidth: '100%';
    };
  };
}

const Highlight = CodeHighlighter as unknown as ComponentType<HighlightProps>;

function CodeBlockComponent({
  code,
  language = 'text',
  scheme,
  isStreaming = false,
}: CodeBlockProps) {
  const highlighterTheme = useMemo(() => hljsTheme(scheme), [scheme]);
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const normalizedCode = code.replace(/\n$/, '');

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  async function handleCopy() {
    await Clipboard.setStringAsync(code);
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
    <View className="bg-card border-border my-2 self-stretch overflow-hidden rounded-xl border">
      <View className="border-border flex-row items-center justify-between border-b px-3 py-2">
        <Text className="text-muted-foreground font-mono text-xs">{language || 'code'}</Text>
        <Pressable onPress={handleCopy} hitSlop={8}>
          <Text className="text-muted-foreground font-mono text-xs">
            {copied ? 'Copied' : 'Copy'}
          </Text>
        </Pressable>
      </View>

      {isStreaming ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            padding: 12,
            minWidth: '100%',
          }}>
          <Text className="text-foreground font-mono text-[13px] leading-[19px]">
            {normalizedCode}
          </Text>
        </ScrollView>
      ) : (
        <Highlight
          hljsStyle={highlighterTheme}
          language={language}
          textStyle={{
            fontFamily: 'GeistMono_400Regular',
            fontSize: 13,
            lineHeight: 19,
          }}
          scrollViewProps={{
            horizontal: true,
            showsHorizontalScrollIndicator: false,
            contentContainerStyle: {
              padding: 12,
              minWidth: '100%',
            },
          }}>
          {normalizedCode}
        </Highlight>
      )}
    </View>
  );
}

export const CodeBlock = memo(CodeBlockComponent);
