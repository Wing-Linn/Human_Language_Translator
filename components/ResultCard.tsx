import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Star } from 'lucide-react-native';
import { TranslationData } from '@/lib/types';
import { theme, confidenceLabel, confidenceColor } from '@/constants/theme';
import { Card, CopyButton } from './ui';

function Bullets({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <View style={styles.bulletWrap}>
      {items.map((item, i) => (
        <View key={i} style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function ConfidenceTag({ level }: { level: string }) {
  return (
    <View
      style={[
        styles.confidenceTag,
        { backgroundColor: confidenceColor[level] !== undefined ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.04)' },
      ]}
    >
      <Text style={[styles.confidenceText, { color: confidenceColor[level] ?? theme.textSecondary }]}>
        {confidenceLabel[level] ?? ''}
      </Text>
    </View>
  );
}

function FavoriteInline({ onAdd }: { onAdd: () => void }) {
  const [added, setAdded] = React.useState(false);
  const handle = () => {
    onAdd();
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };
  return (
    <Pressable onPress={handle} style={styles.favBtnWrap}>
      <Star
        size={15}
        color={theme.orangeDark}
        strokeWidth={2}
        fill={added ? theme.orange : 'transparent'}
      />
      <Text style={styles.favBtnText}>{added ? '已收藏' : '收藏'}</Text>
    </Pressable>
  );
}

export function ResultCard({
  result,
  onFavorite,
}: {
  result: TranslationData;
  onFavorite?: (content: string, label?: string) => void;
}) {
  const showInterpretations = result.interpretations && result.interpretations.length > 0;
  const showVariants = result.variants && result.variants.length > 0;

  return (
    <View style={styles.wrap}>
      <Card>
        <Text style={styles.title}>{result.title}</Text>
      </Card>

      {result.literalMeaning ? (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>直译</Text>
          <Text style={styles.bodyText}>{result.literalMeaning}</Text>
          <View style={styles.copyRow}>
            <CopyButton text={result.literalMeaning} />
            {onFavorite && <FavoriteInline onAdd={() => onFavorite(result.literalMeaning!, '直译')} />}
          </View>
        </Card>
      ) : null}

      {result.humanTranslation ? (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>人话版</Text>
          <Text style={[styles.bodyText, styles.humanText]}>{result.humanTranslation}</Text>
          <View style={styles.copyRow}>
            <CopyButton text={result.humanTranslation} />
            {onFavorite && (
              <FavoriteInline onAdd={() => onFavorite(result.humanTranslation!, '人话版')} />
            )}
          </View>
        </Card>
      ) : null}

      {showInterpretations ? (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>可能的潜台词</Text>
          {result.interpretations!.map((item, i) => (
            <View key={i} style={styles.interpItem}>
              <View style={styles.interpHeader}>
                <Text style={styles.interpIndex}>{i + 1}</Text>
                <Text style={styles.interpText}>{item.text}</Text>
              </View>
              {item.evidence ? <Text style={styles.evidence}>依据：{item.evidence}</Text> : null}
              <View style={styles.interpFooter}>
                <ConfidenceTag level={item.confidence} />
                <CopyButton text={item.text} />
              </View>
            </View>
          ))}
        </Card>
      ) : null}

      {showVariants ? (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>可选版本</Text>
          {result.variants!.map((v, i) => (
            <View key={i} style={styles.variantItem}>
              <View style={styles.variantHeader}>
                <Text style={styles.variantStyle}>{v.style}</Text>
              </View>
              <Text style={[styles.bodyText, styles.variantContent]}>{v.content}</Text>
              {v.description ? <Text style={styles.evidence}>{v.description}</Text> : null}
              <View style={styles.copyRow}>
                <CopyButton text={v.content} label="复制" />
                {onFavorite && <FavoriteInline onAdd={() => onFavorite(v.content, v.style)} />}
              </View>
            </View>
          ))}
        </Card>
      ) : null}

      {result.emotionCues && result.emotionCues.length > 0 ? (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>语气与情绪线索</Text>
          {result.emotionCues.map((cue, i) => (
            <View key={i} style={styles.interpItem}>
              <View style={styles.interpHeader}>
                <Text style={styles.interpText}>{cue.label}</Text>
              </View>
              {cue.evidence ? <Text style={styles.evidence}>依据：{cue.evidence}</Text> : null}
              <View style={styles.interpFooter}>
                <ConfidenceTag level={cue.confidence} />
              </View>
            </View>
          ))}
        </Card>
      ) : null}

      {result.alternatives && result.alternatives.length > 0 ? (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>其他可能</Text>
          <Bullets items={result.alternatives} />
        </Card>
      ) : null}

      {result.suggestions && result.suggestions.length > 0 ? (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>建议怎么做</Text>
          <Bullets items={result.suggestions} />
        </Card>
      ) : null}

      {result.uncertaintyNote ? (
        <View style={styles.uncertaintyBox}>
          <Text style={styles.uncertaintyText}>{result.uncertaintyNote}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  title: {
    fontFamily: theme.font.bold,
    fontSize: 17,
    color: theme.primaryDark,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontFamily: theme.font.bold,
    fontSize: 15,
    color: theme.text,
  },
  bodyText: {
    fontFamily: theme.font.regular,
    fontSize: 15,
    color: theme.text,
    lineHeight: 23,
  },
  humanText: {
    fontFamily: theme.font.medium,
    color: theme.primaryDark,
  },
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  interpItem: {
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: 12,
    gap: 8,
  },
  interpHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  interpIndex: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.primaryLight,
    color: theme.primaryDark,
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 12,
    fontFamily: theme.font.bold,
    overflow: 'hidden',
  },
  interpText: {
    fontFamily: theme.font.medium,
    fontSize: 14,
    color: theme.text,
    lineHeight: 21,
    flex: 1,
  },
  evidence: {
    fontFamily: theme.font.regular,
    fontSize: 12,
    color: theme.textSecondary,
    lineHeight: 18,
  },
  interpFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confidenceTag: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  confidenceText: {
    fontFamily: theme.font.medium,
    fontSize: 11,
  },
  variantItem: {
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: 12,
    gap: 8,
  },
  variantHeader: {
    backgroundColor: theme.primaryLight,
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  variantStyle: {
    fontFamily: theme.font.medium,
    fontSize: 12,
    color: theme.primaryDark,
  },
  variantContent: {
    fontFamily: theme.font.medium,
  },
  bulletWrap: {
    gap: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.primary,
    marginTop: 9,
  },
  bulletText: {
    fontFamily: theme.font.regular,
    fontSize: 14,
    color: theme.text,
    lineHeight: 21,
    flex: 1,
  },
  uncertaintyBox: {
    backgroundColor: theme.blueLight,
    borderRadius: theme.radius.sm,
    padding: 14,
  },
  uncertaintyText: {
    fontFamily: theme.font.regular,
    fontSize: 12,
    color: theme.blueDark,
    lineHeight: 19,
  },
  favBtnWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FBF3E4',
  },
  favBtnText: {
    fontFamily: theme.font.medium,
    fontSize: 12,
    color: theme.orangeDark,
  },
});
