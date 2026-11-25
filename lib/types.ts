export type Mode = 'subtext' | 'rewrite' | 'reply' | 'emotion';

export type Scenario =
  | 'general'
  | 'workplace'
  | 'friends'
  | 'relationship'
  | 'family'
  | 'social'
  | 'interview'
  | 'customer'
  | 'other';

export type Confidence = 'low' | 'medium' | 'high';

export interface Interpretation {
  text: string;
  evidence: string;
  confidence: Confidence;
}

export interface EmotionCue {
  label: string;
  evidence: string;
  confidence: Confidence;
}

export interface TextVariant {
  style: string;
  content: string;
  description: string;
}

export interface TranslationData {
  mode: Mode;
  title: string;
  literalMeaning?: string;
  humanTranslation?: string;
  interpretations?: Interpretation[];
  emotionCues?: EmotionCue[];
  alternatives?: string[];
  suggestions?: string[];
  variants?: TextVariant[];
  uncertaintyNote?: string;
}

export interface TranslateRequest {
  mode: Mode;
  text: string;
  scenario: Scenario;
  context?: string;
  options?: {
    focus?: string;
    tone?: string;
    relationship?: string;
    goal?: string;
  };
}

export interface HistoryEntry {
  id: string;
  mode: Mode;
  inputText: string;
  scenario: Scenario;
  context?: string;
  result: TranslationData;
  createdAt: number;
}

export interface FavoriteEntry {
  id: string;
  mode: Mode;
  inputText: string;
  content: string;
  label?: string;
  createdAt: number;
}

export interface AppSettings {
  version: number;
  autoSaveHistory: boolean;
}

export const SCENARIOS: { value: Scenario; label: string }[] = [
  { value: 'general', label: '通用 / 不确定' },
  { value: 'workplace', label: '职场沟通' },
  { value: 'friends', label: '朋友聊天' },
  { value: 'relationship', label: '亲密关系 / 暧昧' },
  { value: 'family', label: '家庭沟通' },
  { value: 'social', label: '社交与拒绝' },
  { value: 'interview', label: '面试与求职' },
  { value: 'customer', label: '客户沟通' },
  { value: 'other', label: '其他' },
];

export const FOCUS_OPTIONS = ['综合分析', '理解态度', '判断语气', '理解拒绝'];

export const TONE_OPTIONS = [
  '高情商 / 自然得体',
  '职场专业',
  '温柔委婉',
  '礼貌坚定',
  '简洁直接',
  '轻松幽默',
  '亲切可爱',
  '有边界感',
  '更有说服力',
];

export const RELATIONSHIP_OPTIONS = [
  '同事',
  '上级',
  '下属',
  '朋友',
  '家人',
  '伴侣',
  '暧昧对象',
  '客户',
  '其他',
];

export const GOAL_OPTIONS = [
  '维持关系',
  '礼貌拒绝',
  '表达关心',
  '结束话题',
  '解释澄清',
  '推进事情',
  '争取时间',
  '表达不满',
  '设定边界',
];

export const MODE_META: Record<Mode, { label: string; icon: string; description: string }> = {
  subtext: {
    label: '潜台词翻译',
    icon: '有话直说之外的意思',
    description: '输入别人说的话，看懂字面之外的可能含义。',
  },
  rewrite: {
    label: '语气转换',
    icon: '把话说得更合适',
    description: '输入自己想说的话，换成更得体的说法。',
  },
  reply: {
    label: '帮我回复',
    icon: '不知道怎么回',
    description: '粘贴收到的消息，生成几种可直接发送的回复。',
  },
  emotion: {
    label: '情绪分析',
    icon: '语气怎么样',
    description: '分析一段话的语气与情绪线索，并给出依据。',
  },
};

export const scenarioLabel = (s: Scenario): string =>
  SCENARIOS.find((x) => x.value === s)?.label ?? '通用 / 不确定';
