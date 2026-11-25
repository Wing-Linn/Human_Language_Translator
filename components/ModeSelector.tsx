import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Mode, MODE_META, TranslationData } from '@/lib/types';
import { theme } from '@/constants/theme';
import { Card } from './ui';

const MODES: Mode[] = ['subtext', 'rewrite', 'reply', 'emotion'];

export function ModeSelector({
  mode,
  onChange,
}: {
  mode: Mode;
  onChange: (m: Mode) => void;
}) {
  return (
    <View style={styles.grid}>
      {MODES.map((m) => {
        const meta = MODE_META[m];
        const active = m === mode;
        return (
          <Pressable key={m} onPress={() => onChange(m)} style={styles.item}>
            <View style={[styles.cardInner, active && styles.cardActive]}>
              <Text style={[styles.label, active && styles.labelActive]}>{meta.label}</Text>
              <Text style={styles.desc}>{meta.description}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  item: {
    width: '47.5%',
    flexGrow: 1,
  },
  cardInner: {
    backgroundColor: theme.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 14,
    minHeight: 88,
  },
  cardActive: {
    borderColor: theme.primary,
    backgroundColor: theme.primaryLight,
    borderWidth: 2,
    paddingLeft: 13,
    paddingRight: 13,
  },
  label: {
    fontFamily: theme.font.bold,
    fontSize: 15,
    color: theme.text,
    lineHeight: 21,
  },
  labelActive: {
    color: theme.primaryDark,
  },
  desc: {
    fontFamily: theme.font.regular,
    fontSize: 11,
    color: theme.textSecondary,
    lineHeight: 17,
    marginTop: 4,
  },
});
