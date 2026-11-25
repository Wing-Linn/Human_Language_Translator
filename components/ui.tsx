import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { Check, Copy, RefreshCw } from 'lucide-react-native';
import { theme } from '@/constants/theme';

export function Card({
  style,
  children,
}: {
  style?: ViewStyle | ViewStyle[];
  children: React.ReactNode;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.primaryBtn,
        isDisabled && styles.primaryBtnDisabled,
        pressed && !isDisabled && styles.primaryBtnPressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Text style={styles.primaryBtnText}>{label}</Text>
      )}
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export function ChipRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.chipRow}>{children}</View>;
}

export function CopyButton({
  text,
  label = '复制',
}: {
  text: string;
  label?: string;
}) {
  const [copied, setCopied] = React.useState(false);
  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // clipboard unavailable
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <Pressable onPress={doCopy} style={styles.copyBtn}>
      {copied ? (
        <Check size={15} color={theme.primaryDark} strokeWidth={2.5} />
      ) : (
        <Copy size={15} color={theme.primaryDark} strokeWidth={2} />
      )}
      <Text style={styles.copyBtnText}>{copied ? '已复制' : label}</Text>
    </Pressable>
  );
}

export function RegenerateButton({ onPress, loading }: { onPress: () => void; loading: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={loading} style={styles.regenBtn}>
      <RefreshCw size={15} color={theme.textSecondary} strokeWidth={2} />
      <Text style={styles.regenBtnText}>重新生成</Text>
    </Pressable>
  );
}

export function EmptyState({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <View style={styles.emptyState}>
      {icon}
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
    </View>
  );
}

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.errorBanner}>
      <Text style={styles.errorText}>{message}</Text>
      {onRetry && (
        <Pressable onPress={onRetry} style={styles.errorRetry}>
          <Text style={styles.errorRetryText}>重试</Text>
        </Pressable>
      )}
    </View>
  );
}

export function LoadingHint() {
  return (
    <Card style={styles.loadingCard}>
      <ActivityIndicator color={theme.primaryDark} size="large" />
      <Text style={styles.loadingText}>正在分析中，请稍等片刻…</Text>
    </Card>
  );
}

export function ScreenScroll({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView
      style={styles.screenScroll}
      contentContainerStyle={styles.screenContent}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
  },
  sectionTitle: {
    fontFamily: theme.font.bold,
    fontSize: 15,
    color: theme.text,
    lineHeight: 21,
  } as TextStyle,
  primaryBtn: {
    backgroundColor: theme.primaryDark,
    borderRadius: theme.radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryBtnPressed: {
    opacity: 0.85,
  },
  primaryBtnDisabled: {
    backgroundColor: '#B9CFC7',
  },
  primaryBtnText: {
    fontFamily: theme.font.bold,
    fontSize: 16,
    color: '#FFFFFF',
  } as TextStyle,
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: theme.primaryLight,
    borderColor: theme.primary,
  },
  chipText: {
    fontFamily: theme.font.regular,
    fontSize: 13,
    color: theme.textSecondary,
  } as TextStyle,
  chipTextSelected: {
    fontFamily: theme.font.medium,
    color: theme.primaryDark,
  } as TextStyle,
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: theme.primaryLight,
  },
  copyBtnText: {
    fontFamily: theme.font.medium,
    fontSize: 12,
    color: theme.primaryDark,
  } as TextStyle,
  regenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: theme.bg,
    borderWidth: 1,
    borderColor: theme.border,
  },
  regenBtnText: {
    fontFamily: theme.font.medium,
    fontSize: 12,
    color: theme.textSecondary,
  } as TextStyle,
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontFamily: theme.font.bold,
    fontSize: 16,
    color: theme.text,
    marginTop: 16,
  } as TextStyle,
  emptySubtitle: {
    fontFamily: theme.font.regular,
    fontSize: 13,
    color: theme.textSecondary,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
  } as TextStyle,
  errorBanner: {
    backgroundColor: theme.errorBg,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: '#F0D5D5',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    fontFamily: theme.font.regular,
    fontSize: 13,
    color: theme.error,
    lineHeight: 19,
    flex: 1,
  } as TextStyle,
  errorRetry: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: theme.error,
  },
  errorRetryText: {
    fontFamily: theme.font.medium,
    fontSize: 12,
    color: '#FFFFFF',
  } as TextStyle,
  loadingCard: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  loadingText: {
    fontFamily: theme.font.regular,
    fontSize: 13,
    color: theme.textSecondary,
  } as TextStyle,
  screenScroll: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  screenContent: {
    padding: 16,
    paddingBottom: 40,
  },
});
