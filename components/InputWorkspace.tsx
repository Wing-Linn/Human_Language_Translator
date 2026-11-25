import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  Scenario,
  FOCUS_OPTIONS,
  GOAL_OPTIONS,
  RELATIONSHIP_OPTIONS,
  TONE_OPTIONS,
  Mode,
  MODE_META,
} from '@/lib/types';
import { theme } from '@/constants/theme';
import { Card, Chip, ChipRow, PrimaryButton, SectionTitle } from './ui';

const MAX_TEXT = 3000;
const MAX_CONTEXT = 1500;

export interface WorkspaceSubmit {
  text: string;
  scenario: Scenario;
  context: string;
  focus?: string;
  tone?: string;
  relationship?: string;
  goal?: string;
}

export function InputWorkspace({
  mode,
  onSubmit,
  loading,
  onSample,
  initialText = '',
}: {
  mode: Mode;
  onSubmit: (payload: WorkspaceSubmit) => void;
  loading: boolean;
  onSample: () => void;
  initialText?: string;
}) {
  const [text, setText] = React.useState(initialText);
  const [scenario, setScenario] = React.useState<Scenario>('general');
  const [context, setContext] = React.useState('');
  const [focus, setFocus] = React.useState<string | undefined>(undefined);
  const [tone, setTone] = React.useState<string>(TONE_OPTIONS[0]);
  const [relationship, setRelationship] = React.useState<string | undefined>(undefined);
  const [goal, setGoal] = React.useState<string | undefined>(undefined);
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const trimmed = text.trim();
  const trimmedContext = context.trim();
  const textTooLong = trimmed.length > MAX_TEXT;
  const contextTooLong = trimmedContext.length > MAX_CONTEXT;
  const canSubmit = trimmed.length >= 2 && !textTooLong && !contextTooLong && !loading;

  const clear = () => {
    setText('');
    setContext('');
  };

  const submit = () => {
    if (!canSubmit) return;
    onSubmit({
      text: trimmed,
      scenario,
      context: trimmedContext,
      focus,
      tone: mode === 'rewrite' ? tone : undefined,
      relationship,
      goal,
    });
  };

  const inputLabel =
    mode === 'subtext'
      ? '对方说的话'
      : mode === 'rewrite'
        ? '你想说的原话'
        : mode === 'reply'
          ? '对方发来的消息'
          : '需要分析的文本';

  const submitLabel =
    mode === 'subtext'
      ? '翻译成人话'
      : mode === 'rewrite'
        ? '帮我润色'
        : mode === 'reply'
          ? '生成回复'
          : '分析语气';

  return (
    <Card style={styles.card}>
      <View style={styles.labelRow}>
        <SectionTitle>{inputLabel}</SectionTitle>
        <Pressable onPress={onSample}>
          <Text style={styles.sampleLink}>试试示例</Text>
        </Pressable>
      </View>
      <TextInput
        style={styles.textInput}
        multiline
        placeholder={
          mode === 'subtext'
            ? '粘贴对方说的话，例如：你看着办吧。'
            : mode === 'rewrite'
              ? '写下你准备发送的话，例如：你能不能快一点？'
              : mode === 'reply'
                ? '粘贴对方发来的消息，例如：最近比较忙，之后再说吧。'
                : '粘贴需要分析的一段话'
        }
        placeholderTextColor={theme.textTertiary}
        value={text}
        onChangeText={setText}
        textAlignVertical="top"
      />
      <View style={styles.metaRow}>
        <Text style={[styles.charCount, textTooLong && styles.charCountError]}>
          {trimmed.length}/{MAX_TEXT}
        </Text>
        {trimmed.length > 0 && (
          <Pressable onPress={clear}>
            <Text style={styles.clearBtn}>清空</Text>
          </Pressable>
        )}
      </View>
      {textTooLong && (
        <Text style={styles.errorHint}>内容不能超过 {MAX_TEXT} 字，请精简后再试。</Text>
      )}

      <Text style={styles.fieldLabel}>沟通场景（可选）</Text>
      <ChipRow>
        {[
          { value: 'general', label: '通用 / 不确定' },
          { value: 'workplace', label: '职场沟通' },
          { value: 'friends', label: '朋友聊天' },
          { value: 'relationship', label: '亲密关系 / 暧昧' },
          { value: 'family', label: '家庭沟通' },
          { value: 'social', label: '社交与拒绝' },
          { value: 'interview', label: '面试与求职' },
          { value: 'customer', label: '客户沟通' },
          { value: 'other', label: '其他' },
        ].map((s) => (
          <Chip
            key={s.value}
            label={s.label}
            selected={scenario === s.value}
            onPress={() => setScenario(s.value as Scenario)}
          />
        ))}
      </ChipRow>

      {mode === 'subtext' && (
        <>
          <Text style={styles.fieldLabel}>分析重点（可选）</Text>
          <ChipRow>
            {FOCUS_OPTIONS.map((f) => (
              <Chip
                key={f}
                label={f}
                selected={focus === f}
                onPress={() => setFocus(focus === f ? undefined : f)}
              />
            ))}
          </ChipRow>
        </>
      )}

      {mode === 'rewrite' && (
        <>
          <Text style={styles.fieldLabel}>目标语气</Text>
          <ChipRow>
            {TONE_OPTIONS.map((t) => (
              <Chip key={t} label={t} selected={tone === t} onPress={() => setTone(t)} />
            ))}
          </ChipRow>
        </>
      )}

      {mode === 'reply' && (
        <>
          <Text style={styles.fieldLabel}>双方关系（可选）</Text>
          <ChipRow>
            {RELATIONSHIP_OPTIONS.map((r) => (
              <Chip
                key={r}
                label={r}
                selected={relationship === r}
                onPress={() => setRelationship(relationship === r ? undefined : r)}
              />
            ))}
          </ChipRow>
          <Text style={styles.fieldLabel}>我的回复目标（可选）</Text>
          <ChipRow>
            {GOAL_OPTIONS.map((g) => (
              <Chip
                key={g}
                label={g}
                selected={goal === g}
                onPress={() => setGoal(goal === g ? undefined : g)}
              />
            ))}
          </ChipRow>
        </>
      )}

      <Pressable onPress={() => setShowAdvanced(!showAdvanced)} style={styles.advToggle}>
        <Text style={styles.advToggleText}>
          {showAdvanced ? '收起补充说明' : '补充上下文（可选）'}
        </Text>
      </Pressable>
      {showAdvanced && (
        <View>
          <TextInput
            style={[styles.textInput, styles.contextInput]}
            multiline
            placeholder="如果愿意，可以补充前后文、你们的关系或发生了什么。信息越完整，分析越有参考价值。"
            placeholderTextColor={theme.textTertiary}
            value={context}
            onChangeText={setContext}
            textAlignVertical="top"
          />
          <View style={styles.metaRow}>
            <Text style={[styles.charCount, contextTooLong && styles.charCountError]}>
              {trimmedContext.length}/{MAX_CONTEXT}
            </Text>
          </View>
          {contextTooLong && (
            <Text style={styles.errorHint}>补充说明不能超过 {MAX_CONTEXT} 字。</Text>
          )}
        </View>
      )}

      <PrimaryButton label={submitLabel} onPress={submit} loading={loading} disabled={!canSubmit} />
      <Text style={styles.privacyNote}>
        输入内容会发送给 AI 服务进行分析，请避免粘贴密码、证件号、银行卡号等敏感信息。
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sampleLink: {
    fontFamily: theme.font.medium,
    fontSize: 13,
    color: theme.primaryDark,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.bg,
    padding: 14,
    minHeight: 110,
    fontFamily: theme.font.regular,
    fontSize: 15,
    color: theme.text,
    lineHeight: 22,
  },
  contextInput: {
    minHeight: 80,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -6,
  },
  charCount: {
    fontFamily: theme.font.regular,
    fontSize: 11,
    color: theme.textTertiary,
  },
  charCountError: {
    color: theme.error,
    fontFamily: theme.font.medium,
  },
  clearBtn: {
    fontFamily: theme.font.regular,
    fontSize: 12,
    color: theme.textSecondary,
  },
  errorHint: {
    fontFamily: theme.font.regular,
    fontSize: 12,
    color: theme.error,
    marginTop: -4,
  },
  fieldLabel: {
    fontFamily: theme.font.medium,
    fontSize: 13,
    color: theme.textSecondary,
  },
  advToggle: {
    paddingVertical: 4,
  },
  advToggleText: {
    fontFamily: theme.font.medium,
    fontSize: 13,
    color: theme.primaryDark,
  },
  privacyNote: {
    fontFamily: theme.font.regular,
    fontSize: 11,
    color: theme.textTertiary,
    lineHeight: 17,
  },
});
