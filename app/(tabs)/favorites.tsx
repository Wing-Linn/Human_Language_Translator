import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Star, Trash2 } from 'lucide-react-native';
import { FavoriteEntry, MODE_META } from '@/lib/types';
import { theme } from '@/constants/theme';
import { Card, CopyButton, EmptyState, ScreenScroll } from '@/components/ui';
import { deleteFavoriteEntry, loadFavorites } from '@/lib/storage';

function formatTime(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function FavoritesScreen() {
  const [entries, setEntries] = React.useState<FavoriteEntry[]>([]);

  React.useEffect(() => {
    setEntries(loadFavorites());
  }, []);

  const remove = (id: string) => {
    setEntries(deleteFavoriteEntry(id));
  };

  return (
    <ScreenScroll>
      <View style={styles.header}>
        <Text style={styles.title}>我的收藏</Text>
      </View>
      <Text style={styles.privacyNote}>收藏只保存在当前设备浏览器中，不会上传到服务器。</Text>

      {entries.length === 0 ? (
        <EmptyState
          icon={<Star size={40} color={theme.textTertiary} strokeWidth={1.5} />}
          title="还没有收藏"
          subtitle="在翻译结果里点击“收藏”，就能把常用的表达留在这里。"
        />
      ) : (
        <View style={styles.list}>
          {entries.map((entry) => (
            <Card key={entry.id} style={styles.item}>
              <View style={styles.itemHeader}>
                <View style={styles.tagRow}>
                  <Text style={styles.modeTag}>{MODE_META[entry.mode].label}</Text>
                  {entry.label ? <Text style={styles.labelTag}>{entry.label}</Text> : null}
                </View>
                <Pressable onPress={() => remove(entry.id)} hitSlop={8}>
                  <Trash2 size={16} color={theme.error} strokeWidth={2} />
                </Pressable>
              </View>
              <Text style={styles.content}>{entry.content}</Text>
              {entry.inputText ? (
                <Text style={styles.source}>来自：{entry.inputText}</Text>
              ) : null}
              <View style={styles.footer}>
                <Text style={styles.time}>{formatTime(entry.createdAt)}</Text>
                <CopyButton text={entry.content} />
              </View>
            </Card>
          ))}
        </View>
      )}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: 16,
  },
  title: {
    fontFamily: theme.font.bold,
    fontSize: 22,
    color: theme.text,
  },
  privacyNote: {
    fontFamily: theme.font.regular,
    fontSize: 11,
    color: theme.textTertiary,
    marginBottom: 16,
  },
  list: {
    gap: 10,
  },
  item: {
    gap: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  modeTag: {
    fontFamily: theme.font.medium,
    fontSize: 12,
    color: theme.primaryDark,
    backgroundColor: theme.primaryLight,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  labelTag: {
    fontFamily: theme.font.medium,
    fontSize: 12,
    color: theme.orangeDark,
    backgroundColor: '#FBF3E4',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  content: {
    fontFamily: theme.font.medium,
    fontSize: 14,
    color: theme.text,
    lineHeight: 22,
  },
  source: {
    fontFamily: theme.font.regular,
    fontSize: 12,
    color: theme.textSecondary,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  time: {
    fontFamily: theme.font.regular,
    fontSize: 11,
    color: theme.textTertiary,
  },
});
