export interface DailyNote {
  text: string;
  note?: string;
}

export const DAILY_NOTES: DailyNote[] = [
  { text: '不确定对方的意思时，问清楚比猜准确。', note: '猜错的成本通常比直接问一句高得多。' },
  { text: '拒绝可以温柔，但不必含糊。', note: '含糊的拒绝往往让对方多等一次。' },
  { text: '把需求说具体，是对彼此时间的尊重。', note: '“尽快”不如“今天下班前”。' },
  { text: '真正的高情商，不是永远说好。', note: '是让别人舒服的同时，也不委屈自己。' },
  { text: '别把标点符号当测谎仪。', note: '句号未必冷淡，可能只是输入习惯。' },
  { text: '表达清楚不是冒犯，猜来猜去才最费电。', note: '' },
  { text: '回复慢不一定是生气，可能只是在忙。', note: '先给对方一个解释的机会。' },
  { text: '“都可以”也是一种答案，但不一定是唯一答案。', note: '' },
  { text: '有情绪时先描述事实，再说出期待。', note: '“你迟到了20分钟，我有点着急。”' },
  { text: '重要的决定，不要只靠一条消息来判断。', note: '' },
  { text: '礼貌和立场可以同时存在。', note: '“我理解你的难处，但我这边确实排不开。”' },
  { text: '听不懂的时候，重复一遍你的理解，是最快的确认方式。', note: '' },
  { text: '关心可以具体一点：比起“还好吗”，“吃饭了吗”更容易被接住。', note: '' },
  { text: '对方没问，不代表不想听；但你说了，对方才有得选。', note: '' },
  { text: '沟通的目标是互相明白，不是赢。', note: '' },
];

export function pickDailyNote(excludeText?: string): DailyNote {
  let pool = DAILY_NOTES;
  if (excludeText && pool.length > 1) {
    pool = pool.filter((n) => n.text !== excludeText);
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

export function dailyNoteOfTheDay(): DailyNote {
  const day = Math.floor(Date.now() / 86400000);
  return DAILY_NOTES[day % DAILY_NOTES.length];
}

export interface SampleInput {
  text: string;
  mode: 'subtext' | 'rewrite' | 'reply';
  scenario?: string;
}

export const SAMPLES: SampleInput[] = [
  { text: '你看着办吧。', mode: 'subtext' },
  { text: '最近比较忙。', mode: 'subtext' },
  { text: '下次有机会再合作。', mode: 'subtext' },
  { text: '这个方案也不是不行。', mode: 'subtext' },
  { text: '你能不能快一点？我等很久了。', mode: 'rewrite', scenario: 'workplace' },
  { text: '这个需求我做不了。', mode: 'rewrite', scenario: 'workplace' },
  { text: '最近比较忙，之后再说吧。', mode: 'reply' },
  { text: '这个事情你能帮我一下吗？', mode: 'reply' },
];
