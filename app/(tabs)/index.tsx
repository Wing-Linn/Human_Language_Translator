import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Mode, MODE_META, TranslationData, scenarioLabel } from '@/lib/types';
import { theme } from '@/constants/theme';
import { ScreenScroll, ErrorBanner, LoadingHint } from '@/components/ui';
import { ModeSelector } from '@/components/ModeSelector';
import { InputWorkspace, WorkspaceSubmit } from '@/components/InputWorkspace';
import { ResultCard } from '@/components/ResultCard';
import { DailySignCard } from '@/components/DailySignCard';
import { SAMPLES } from '@/lib/dailyNotes';
import { translate, ApiError } from '@/lib/api';
import {
  loadAiConfig,
  loadSettings,
  saveHistoryEntry,
  saveFavoriteEntry,
} from '@/lib/storage';

export default function TranslateScreen() {
  const [mode, setMode] = React.useState<Mode>('subtext');
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<TranslationData | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [lastSubmit, setLastSubmit] = React.useState<WorkspaceSubmit | null>(null);
  const [lastMode, setLastMode] = React.useState<Mode>('subtext');
  const [autoSaved, setAutoSaved] = React.useState(false);

  const submit = async (payload: WorkspaceSubmit) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setLastSubmit(payload);
    setLastMode(mode);
    try {
      const data = await translate(
        {
          mode,
          text: payload.text,
          scenario: payload.scenario,
          context: payload.context,
          options: {
            focus: payload.focus,
            tone: payload.tone,
            relationship: payload.relationship,
            goal: payload.goal,
          },
        },
        loadAiConfig()
      );
      setResult(data);
      const settings = loadSettings();
      if (settings.autoSaveHistory) {
        saveHistoryEntry({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          mode,
          inputText: payload.text,
          scenario: payload.scenario,
          context: payload.context,
          result: data,
          createdAt: Date.now(),
        });
        setAutoSaved(true);
      } else {
        setAutoSaved(false);
      }
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
      } else {
        setError('出了点问题，请稍后再试。');
      }
    } finally {
      setLoading(false);
    }
  };

  const regenerate = () => {
    if (lastSubmit) submit(lastSubmit);
  };

  const [sampleSeed, setSampleSeed] = React.useState<{ mode: Mode; text: string } | null>(null);

  const fillSample = () => {
    const pool = SAMPLES.filter((s) => s.mode === mode);
    const sample = pool[Math.floor(Math.random() * pool.length)] ?? SAMPLES[0];
    setSampleSeed({ mode, text: sample.text });
  };

  const handleFavorite = (content: string, label?: string) => {
    saveFavoriteEntry({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      mode: lastMode,
      inputText: lastSubmit?.text ?? '',
      content,
      label,
      createdAt: Date.now(),
    });
  };

  return (
    <ScreenScroll>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>人话翻译器</Text>
        <Text style={styles.headerSubtitle}>听懂弦外之音，说出言外之意。</Text>
      </View>

      <ModeSelector mode={mode} onChange={setMode} />

      <InputWorkspace
        key={`${mode}-${sampleSeed?.text ?? ''}`}
        mode={mode}
        onSubmit={submit}
        loading={loading}
        onSample={fillSample}
        initialText={sampleSeed && sampleSeed.mode === mode ? sampleSeed.text : ''}
      />

      {error ? <ErrorBanner message={error} onRetry={loading ? undefined : regenerate} /> : null}
      {loading ? <LoadingHint /> : null}

      {result ? (
        <View>
          <ResultCard result={result} onFavorite={handleFavorite} />
          <Text style={styles.savedNote}>
            {autoSaved
              ? '这条结果已保存到本机历史记录。'
              : '自动保存已关闭，这条结果不会写入历史。'}
          </Text>
        </View>
      ) : null}

      <DailySignCard />

      <Text style={styles.footerNote}>
        记录只保存在当前设备浏览器中，不会上传到服务器。
      </Text>
    </ScreenScroll>
  );
}


const styles = StyleSheet.create({
  header: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontFamily: theme.font.bold,
    fontSize: 26,
    color: theme.text,
  },
  headerSubtitle: {
    fontFamily: theme.font.regular,
    fontSize: 14,
    color: theme.textSecondary,
  },
  savedNote: {
    fontFamily: theme.font.regular,
    fontSize: 11,
    color: theme.textTertiary,
    textAlign: 'center',
    marginTop: 8,
  },
  footerNote: {
    fontFamily: theme.font.regular,
    fontSize: 11,
    color: theme.textTertiary,
    textAlign: 'center',
    marginTop: 16,
  },
});
