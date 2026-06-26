import { CodeBlock } from '@/features/chat/components/code-block';
import { THEME } from '@/lib/theme';
import { useMemo } from 'react';
import { View } from 'react-native';
import { Renderer, type RendererInterface, useMarkdown } from 'react-native-marked';
import remend from 'remend';
import { useUniwind } from 'uniwind';

interface MarkdownMessageProps {
  content: string;
  isStreaming?: boolean;
}

class ChatRenderer extends Renderer implements RendererInterface {
  constructor(
    private scheme: 'light' | 'dark',
    private isStreaming: boolean
  ) {
    super();
  }

  code(text: string, language?: string) {
    return (
      <CodeBlock
        key={this.getKey()}
        code={text}
        language={language}
        scheme={this.scheme}
        isStreaming={this.isStreaming}
      />
    );
  }
}

const LINK = '#3b82f6';

export function MarkdownMessage({ content, isStreaming = false }: MarkdownMessageProps) {
  const { theme } = useUniwind();
  const scheme = theme ?? 'light';
  const t = THEME[scheme];
  const renderer = useMemo(() => new ChatRenderer(scheme, isStreaming), [scheme, isStreaming]);
  const source = isStreaming ? remend(content) : content;
  const elements = useMarkdown(source, {
    colorScheme: scheme,
    renderer,
    theme: {
      colors: {
        text: t.foreground,
        link: LINK,
        code: t.muted,
        border: t.border,
      },
    },
    styles: {
      text: {
        fontFamily: 'Geist_400Regular',
        fontSize: 14,
        lineHeight: 22,
      },
      paragraph: {
        paddingVertical: 6,
      },
      strong: {
        fontFamily: 'Geist_400Regular',
        fontWeight: '700',
      },
      em: {
        fontFamily: 'Geist_400Regular',
        fontStyle: 'italic',
      },
      h1: {
        fontFamily: 'Geist_400Regular',
        fontWeight: '700',
        fontSize: 28,
        lineHeight: 34,
        letterSpacing: 0,
      },
      h2: {
        fontFamily: 'Geist_400Regular',
        fontWeight: '700',
        fontSize: 24,
        lineHeight: 30,
        letterSpacing: 0,
      },
      h3: {
        fontFamily: 'Geist_400Regular',
        fontWeight: '600',
        fontSize: 20,
        lineHeight: 26,
        letterSpacing: 0,
      },
      h4: {
        fontFamily: 'Geist_400Regular',
        fontWeight: '600',
        fontSize: 18,
        lineHeight: 24,
        letterSpacing: 0,
      },
      h5: {
        fontFamily: 'Geist_400Regular',
        fontWeight: '600',
        letterSpacing: 0,
      },
      h6: {
        fontFamily: 'Geist_400Regular',
        fontWeight: '600',
        letterSpacing: 0,
      },
      link: {
        color: LINK,
        textDecorationLine: 'underline',
        fontStyle: 'normal',
      },
      blockquote: {
        borderLeftColor: t.accent,
        borderLeftWidth: 3,
        paddingLeft: 12,
      },
      codespan: {
        fontFamily: 'GeistMono_400Regular',
        backgroundColor: t.muted,
        color: t.foreground,
      },
      code: {
        backgroundColor: 'transparent',
        padding: 0,
        minWidth: undefined,
      },
      li: {
        fontFamily: 'Geist_400Regular',
        fontSize: 14,
        lineHeight: 22,
      },
      table: {
        borderColor: t.border,
      },
      tableCell: {
        paddingVertical: 8,
        paddingHorizontal: 10,
      },
    },
  });

  return <View style={{ width: '100%' }}>{elements}</View>;
}
