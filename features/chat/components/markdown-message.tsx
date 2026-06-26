import { CodeBlock } from '@/features/chat/components/code-block';
import { THEME } from '@/lib/theme';
import { lexer } from 'marked';
import { memo, useMemo } from 'react';
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

type ThemeTokens = (typeof THEME)['light'];

function buildTheme(t: ThemeTokens) {
  return { colors: { text: t.foreground, link: LINK, code: t.muted, border: t.border } };
}

function buildStyles(t: ThemeTokens) {
  return {
    text: { fontFamily: 'Geist_400Regular', fontSize: 14, lineHeight: 22 },
    paragraph: { paddingVertical: 6 },
    strong: { fontFamily: 'Geist_400Regular', fontWeight: '700' as const },
    em: { fontFamily: 'Geist_400Regular', fontStyle: 'italic' as const },
    h1: {
      fontFamily: 'Geist_400Regular',
      fontWeight: '700' as const,
      fontSize: 28,
      lineHeight: 34,
      letterSpacing: 0,
    },
    h2: {
      fontFamily: 'Geist_400Regular',
      fontWeight: '700' as const,
      fontSize: 24,
      lineHeight: 30,
      letterSpacing: 0,
    },
    h3: {
      fontFamily: 'Geist_400Regular',
      fontWeight: '600' as const,
      fontSize: 20,
      lineHeight: 26,
      letterSpacing: 0,
    },
    h4: {
      fontFamily: 'Geist_400Regular',
      fontWeight: '600' as const,
      fontSize: 18,
      lineHeight: 24,
      letterSpacing: 0,
    },
    h5: { fontFamily: 'Geist_400Regular', fontWeight: '600' as const, letterSpacing: 0 },
    h6: { fontFamily: 'Geist_400Regular', fontWeight: '600' as const, letterSpacing: 0 },
    link: { color: LINK, textDecorationLine: 'underline' as const, fontStyle: 'normal' as const },
    blockquote: { borderLeftColor: t.accent, borderLeftWidth: 3, paddingLeft: 12 },
    codespan: { fontFamily: 'GeistMono_400Regular', backgroundColor: t.muted, color: t.foreground },
    code: { backgroundColor: 'transparent', padding: 0, minWidth: undefined },
    li: { fontFamily: 'Geist_400Regular', fontSize: 14, lineHeight: 22 },
    table: { borderColor: t.border },
    tableCell: { paddingVertical: 8, paddingHorizontal: 10 },
  };
}

const MARKDOWN_THEME = { light: buildTheme(THEME.light), dark: buildTheme(THEME.dark) } as const;
const MARKDOWN_STYLES = { light: buildStyles(THEME.light), dark: buildStyles(THEME.dark) } as const;

const MarkdownBlock = memo(function MarkdownBlock({
  source,
  scheme,
  isStreaming,
}: {
  source: string;
  scheme: 'light' | 'dark';
  isStreaming: boolean;
}) {
  const renderer = useMemo(() => new ChatRenderer(scheme, isStreaming), [scheme, isStreaming]);
  const elements = useMarkdown(source, {
    colorScheme: scheme,
    renderer,
    theme: MARKDOWN_THEME[scheme],
    styles: MARKDOWN_STYLES[scheme],
  });

  return <>{elements}</>;
});

export function MarkdownMessage({ content, isStreaming = false }: MarkdownMessageProps) {
  const { theme } = useUniwind();
  const scheme = theme ?? 'light';
  const blocks = useMemo(() => lexer(content, { gfm: true }), [content]);
  const lastIndex = blocks.length - 1;

  return (
    <View style={{ width: '100%' }}>
      {blocks.map((token, i) => {
        if (token.type === 'space') return null;

        const tail = isStreaming && i === lastIndex;

        return (
          <MarkdownBlock
            key={i}
            source={tail ? remend(token.raw) : token.raw}
            scheme={scheme}
            isStreaming={tail}
          />
        );
      })}
    </View>
  );
}
