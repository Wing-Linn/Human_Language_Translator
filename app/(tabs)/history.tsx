import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Clock, Trash2 } from 'lucide-react-native';
import { HistoryEntry, MODE_META, scenarioLabel } from '@/lib/types';
import { theme } from '@/constants/theme';
import { Card, EmptyState, ScreenScroll } from '@/components/ui';
import { deleteHistoryEntry, clearHistory, loadHistory } from '@/lib/storage';

function formatTime(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function HistoryScreen() {
  const [entries, setEntries] = React.useState<HistoryEntry[]>([]);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [confirmClear, setConfirmClear] = React.useState(false);

  React.useEffect(() => {
    setEntries(loadHistory());
  }, []);

  const remove = (id: string) => {
    setEntries(deleteHistoryEntry(id));
  };

  const doClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 4000);
      return;
    }
    clearHistory();
    setEntries([]);
    setConfirmClear(false);
  };

  return (
    <ScreenScroll>
      <View style={styles.header}>
        <Text style={styles.title}>历史记录</Text>
        {entries.length > 0 && (
          <Pressable onPress={doClear}>
            <Text style={[styles.clearAll, confirmClear && styles.clearAllConfirm]}>
              {confirmClear ? '再点一次确认清空' : '清空全部'}
            </Text>
          </Pressable>
        )}
      </View>
      <Text style={styles.privacyNote}>记录只保存在当前设备浏览器中，不会上传到服务器。</Text>

      {entries.length === 0 ? (
        <EmptyState
          icon={<Clock size={40} color={theme.textTertiary} strokeWidth={1.5} />}
          title="还没有历史记录"
          subtitle="完成的翻译和分析会自动保存在这里。"
        />
      ) : (
        <View style={styles.list}>
          {entries.map((entry) => {
            const expanded = expandedId === entry.id;
            const summary =
              entry.inputText.length > 40
                ? `${entry.inputText.slice(0, 40)}…`
                : entry.inputText;
            return (
              <Card key={entry.id} style={styles.item}>
                <Pressable
                  onPress={() => setExpandedId(expanded ? null : entry.id)}
                >
                  <View style={styles.itemHeader}>
                    <Text style={styles.modeTag}>{MODE_META[entry.mode].label}</Text>
                    <Text style={styles.time}>{formatTime(entry.createdAt)}</Text>
                  </View>
                  <Text style={styles.inputSummary}>{summary}</Text>
                  <Text style={styles.scenario}>{scenarioLabel(entry.scenario)}</Text>
                  {expanded && (
                    <View style={styles.detail}>
                      {entry.result.humanTranslation ? (
                        <Text style={styles.detailText}>{entry.result.humanTranslation}</Text>
                      ) : null}
                      {entry.result.variants?.map((v, i) => (
                        <Text key={i} style={styles.detailText}>
                          {v.style}：{v.content}
                        </Text>
                      ))}
                      {entry.result.literalMeaning ? (
                        <Text style={styles.detailText}>直译：{entry.result.literalMeaning}</Text>
                      ) : null}
                      {entry.result.interpretations?.map((it, i) => (
                        <Text key={i} style={styles.detailText}>
                          {it.text}
                        </Text>
                      ))}
                      {entry.context ? (
                        <Text style={styles.detailContext}>上下文：{entry.context}</Text>
                      ) : null}
                    </View>
                  )}
                </Pressable>
                <Pressable
                  onPress={() => remove(entry.id)}
                  style={styles.deleteBtn}
                  hitSlop={8}
                >
                  <Trash2 size={16} color={theme.error} strokeWidth={2} />
                </Pressable>
              </Card>
            );
          })}
        </View>
      )}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  title: {
    fontFamily: theme.font.bold,
    fontSize: 22,
    color: theme.text,
  },
  clearAll: {
    fontFamily: theme.font.medium,
    fontSize: 13,
    color: theme.textSecondary,
  },
  clearAllConfirm: {
    color: theme.error,
    fontFamily: theme.font.bold,
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
    gap: 6,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  time: {
    fontFamily: theme.font.regular,
    fontSize: 11,
    color: theme.textTertiary,
  },
  inputSummary: {
    fontFamily: theme.font.medium,
    fontSize: 14,
    color: theme.text,
    lineHeight: 21,
  },
  scenario: {
    fontFamily: theme.font.regular,
    fontSize: 12,
    color: theme.textSecondary,
  },
  detail: {
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: 10,
    gap: 6,
  },
  detailText: {
    fontFamily: theme.font.regular,
    fontSize: 13,
    color: theme.text,
    lineHeight: 20,
  },
  detailContext: {
    fontFamily: theme.font.regular,
    fontSize: 12,
    color: theme.textSecondary,
    lineHeight: 18,
  },
  deleteBtn: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    padding: 6,
  },
});
