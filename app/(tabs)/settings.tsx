import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { Card, ScreenScroll } from '@/components/ui';
import {
  clearAllLocalData,
  loadSettings,
  saveSettings,
  storageAvailable,
} from '@/lib/storage';

export default function SettingsScreen() {
  const [autoSave, setAutoSave] = React.useState(true);
  const [confirmClear, setConfirmClear] = React.useState(false);
  const [cleared, setCleared] = React.useState(false);
  const canPersist = storageAvailable();

  React.useEffect(() => {
    setAutoSave(loadSettings().autoSaveHistory);
  }, []);

  const toggleAutoSave = (value: boolean) => {
    setAutoSave(value);
    saveSettings({ version: 1, autoSaveHistory: value });
  };

  const doClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 4000);
      return;
    }
    clearAllLocalData();
    setAutoSave(true);
    setCleared(true);
    setConfirmClear(false);
    setTimeout(() => setCleared(false), 3000);
  };

  return (
    <ScreenScroll>
      <View style={styles.header}>
        <Text style={styles.title}>设置</Text>
      </View>

      <Card style={styles.section}>
        <View style={styles.row}>
          <View style={styles.rowTextWrap}>
            <Text style={styles.rowTitle}>自动保存历史</Text>
            <Text style={styles.rowDesc}>
              开启后，每次成功的分析都会存入本机历史记录。
            </Text>
          </View>
          <Switch
            value={autoSave}
            onValueChange={toggleAutoSave}
            trackColor={{ false: '#D5E0DA', true: theme.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.rowTitle}>清除本机数据</Text>
        <Text style={styles.rowDesc}>
          删除本机保存的全部历史记录、收藏和设置，无法恢复。
        </Text>
        <Pressable onPress={doClear} style={[styles.clearBtn, confirmClear && styles.clearBtnConfirm]}>
          <Trash2 size={16} color={confirmClear ? '#FFFFFF' : theme.error} strokeWidth={2} />
          <Text style={[styles.clearBtnText, confirmClear && styles.clearBtnTextConfirm]}>
            {confirmClear ? '再点一次确认清除' : '清除本机数据'}
          </Text>
        </Pressable>
        {cleared && <Text style={styles.clearedNote}>本机数据已清除。</Text>}
      </Card>

      <Card style={styles.section}>
        <Text style={styles.rowTitle}>关于隐私</Text>
        <Text style={styles.aboutText}>
          你的历史记录和收藏只保存在当前设备中，不会上传到服务器。输入的文本会发送给 AI
          服务进行分析，请避免粘贴密码、证件号、银行卡号等敏感信息。
        </Text>
        {!canPersist && (
          <Text style={styles.warnText}>
            当前浏览器不支持本地保存，记录将无法在刷新后保留。
          </Text>
        )}
      </Card>

      <Text style={styles.version}>人话翻译器 · v1.0</Text>
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
  section: {
    gap: 10,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  rowTextWrap: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    fontFamily: theme.font.bold,
    fontSize: 15,
    color: theme.text,
  },
  rowDesc: {
    fontFamily: theme.font.regular,
    fontSize: 12,
    color: theme.textSecondary,
    lineHeight: 19,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#F0D5D5',
    backgroundColor: theme.errorBg,
    borderRadius: theme.radius.sm,
    paddingVertical: 12,
    marginTop: 4,
  },
  clearBtnConfirm: {
    backgroundColor: theme.error,
    borderColor: theme.error,
  },
  clearBtnText: {
    fontFamily: theme.font.medium,
    fontSize: 14,
    color: theme.error,
  },
  clearBtnTextConfirm: {
    color: '#FFFFFF',
  },
  clearedNote: {
    fontFamily: theme.font.regular,
    fontSize: 12,
    color: theme.primaryDark,
  },
  aboutText: {
    fontFamily: theme.font.regular,
    fontSize: 13,
    color: theme.text,
    lineHeight: 21,
  },
  warnText: {
    fontFamily: theme.font.medium,
    fontSize: 12,
    color: theme.orangeDark,
    lineHeight: 18,
  },
  version: {
    fontFamily: theme.font.regular,
    fontSize: 11,
    color: theme.textTertiary,
    textAlign: 'center',
    marginTop: 8,
  },
});
