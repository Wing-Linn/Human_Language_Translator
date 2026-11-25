import React from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Key, Trash2 } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { Card, ScreenScroll } from '@/components/ui';
import {
  clearAiConfig,
  clearAllLocalData,
  loadAiConfig,
  loadSettings,
  saveAiConfig,
  saveSettings,
  storageAvailable,
} from '@/lib/storage';

export default function SettingsScreen() {
  const [autoSave, setAutoSave] = React.useState(true);
  const [confirmClear, setConfirmClear] = React.useState(false);
  const [cleared, setCleared] = React.useState(false);
  const [apiKey, setApiKey] = React.useState('');
  const [baseUrl, setBaseUrl] = React.useState('');
  const [model, setModel] = React.useState('');
  const [showKey, setShowKey] = React.useState(false);
  const [aiSaved, setAiSaved] = React.useState(false);
  const [aiError, setAiError] = React.useState<string | null>(null);
  const canPersist = storageAvailable();

  React.useEffect(() => {
    setAutoSave(loadSettings().autoSaveHistory);
    const ai = loadAiConfig();
    if (ai) {
      setApiKey(ai.apiKey);
      setBaseUrl(ai.baseUrl);
      setModel(ai.model);
    }
  }, []);

  const saveAi = () => {
    setAiError(null);
    const key = apiKey.trim();
    const modelName = model.trim();
    if (!key || !modelName) {
      setAiError('API Key 和模型名称都不能为空。');
      return;
    }
    saveAiConfig({
      apiKey: key,
      baseUrl: baseUrl.trim(),
      model: modelName,
    });
    setAiSaved(true);
    setTimeout(() => setAiSaved(false), 2000);
  };

  const removeAi = () => {
    clearAiConfig();
    setApiKey('');
    setBaseUrl('');
    setModel('');
    setAiError(null);
  };

  const aiConfigured = apiKey.trim().length > 0 && model.trim().length > 0;

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
        <View style={styles.aiHeader}>
          <Key size={16} color={aiConfigured ? theme.primaryDark : theme.textSecondary} strokeWidth={2} />
          <Text style={styles.rowTitle}>AI 服务配置</Text>
          <Text style={[styles.aiStatus, { color: aiConfigured ? theme.primaryDark : theme.orangeDark }]}>
            {aiConfigured ? '已配置' : '未配置'}
          </Text>
        </View>
        <Text style={styles.rowDesc}>
          填写你使用的 AI 服务信息，翻译功能即可使用。配置只保存在本机，不会上传到应用服务器。
        </Text>
        <Text style={styles.fieldLabel}>API Key（必填）</Text>
        <View style={styles.keyRow}>
          <TextInput
            style={[styles.input, styles.inputFlex]}
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="sk-..."
            placeholderTextColor={theme.textTertiary}
            secureTextEntry={!showKey}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Pressable onPress={() => setShowKey(!showKey)} style={styles.eyeBtn}>
            <Text style={styles.eyeText}>{showKey ? '隐藏' : '显示'}</Text>
          </Pressable>
        </View>
        <Text style={styles.fieldLabel}>接口地址（可选，默认 OpenAI）</Text>
        <TextInput
          style={styles.input}
          value={baseUrl}
          onChangeText={setBaseUrl}
          placeholder="https://api.openai.com/v1"
          placeholderTextColor={theme.textTertiary}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={styles.fieldLabel}>模型名称（必填）</Text>
        <TextInput
          style={styles.input}
          value={model}
          onChangeText={setModel}
          placeholder="例如 gpt-4o-mini"
          placeholderTextColor={theme.textTertiary}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {aiError ? <Text style={styles.aiError}>{aiError}</Text> : null}
        <View style={styles.aiBtnRow}>
          <Pressable onPress={saveAi} style={styles.aiSaveBtn}>
            <Text style={styles.aiSaveText}>{aiSaved ? '已保存' : '保存配置'}</Text>
          </Pressable>
          {aiConfigured && (
            <Pressable onPress={removeAi} style={styles.aiRemoveBtn}>
              <Text style={styles.aiRemoveText}>清除配置</Text>
            </Pressable>
          )}
        </View>
        <Text style={styles.fieldNote}>
          支持兼容 OpenAI 接口格式的服务商；使用其他服务商时请同时填写接口地址。
        </Text>
      </Card>

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
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiStatus: {
    fontFamily: theme.font.medium,
    fontSize: 12,
    marginLeft: 'auto',
  },
  fieldLabel: {
    fontFamily: theme.font.medium,
    fontSize: 12,
    color: theme.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.bg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: theme.font.regular,
    fontSize: 14,
    color: theme.text,
  },
  inputFlex: {
    flex: 1,
  },
  keyRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  eyeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  eyeText: {
    fontFamily: theme.font.medium,
    fontSize: 12,
    color: theme.primaryDark,
  },
  aiBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  aiSaveBtn: {
    backgroundColor: theme.primaryDark,
    borderRadius: theme.radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  aiSaveText: {
    fontFamily: theme.font.medium,
    fontSize: 13,
    color: '#FFFFFF',
  },
  aiRemoveBtn: {
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: '#F0D5D5',
    backgroundColor: theme.errorBg,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  aiRemoveText: {
    fontFamily: theme.font.medium,
    fontSize: 13,
    color: theme.error,
  },
  aiError: {
    fontFamily: theme.font.regular,
    fontSize: 12,
    color: theme.error,
  },
  fieldNote: {
    fontFamily: theme.font.regular,
    fontSize: 11,
    color: theme.textTertiary,
    lineHeight: 17,
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
