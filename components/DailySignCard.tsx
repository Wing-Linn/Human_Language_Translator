import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Quote } from 'lucide-react-native';
import { DailyNote, dailyNoteOfTheDay, pickDailyNote } from '@/lib/dailyNotes';
import { theme } from '@/constants/theme';
import { Card } from './ui';

export function DailySignCard() {
  const [note, setNote] = React.useState<DailyNote>(() => dailyNoteOfTheDay());

  const shuffle = () => setNote(pickDailyNote(note.text));

  return (
    <Card style={styles.card}>
      <View style={styles.quoteIcon}>
        <Quote size={18} color={theme.primary} strokeWidth={2} fill={theme.primaryLight} />
      </View>
      <Text style={styles.noteText}>{note.text}</Text>
      {note.note ? <Text style={styles.noteSub}>{note.note}</Text> : null}
      <Pressable onPress={shuffle} style={styles.shuffleBtn}>
        <Text style={styles.shuffleText}>换一句</Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.primaryLight,
    borderColor: '#D5EBE1',
    gap: 8,
  },
  quoteIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteText: {
    fontFamily: theme.font.bold,
    fontSize: 15,
    color: theme.text,
    lineHeight: 22,
  },
  noteSub: {
    fontFamily: theme.font.regular,
    fontSize: 12,
    color: theme.textSecondary,
    lineHeight: 19,
  },
  shuffleBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5EBE1',
    marginTop: 4,
  },
  shuffleText: {
    fontFamily: theme.font.medium,
    fontSize: 12,
    color: theme.primaryDark,
  },
});
