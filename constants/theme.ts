export const theme = {
  bg: '#F7FAF8',
  primary: '#63B89A',
  primaryDark: '#3E8E75',
  primaryLight: '#E8F5EF',
  blueLight: '#EAF2FA',
  blueDark: '#4A7BA6',
  orange: '#F5C98B',
  orangeDark: '#B07B2E',
  text: '#26352F',
  textSecondary: '#78877F',
  textTertiary: '#9AA8A0',
  card: '#FFFFFF',
  border: '#E7EEE9',
  error: '#C65B5B',
  errorBg: '#FBEEEE',
  radius: {
    sm: 12,
    md: 16,
    lg: 22,
  },
  font: {
    regular: 'NotoSansSC-Regular',
    medium: 'NotoSansSC-Medium',
    bold: 'NotoSansSC-Bold',
  },
};

export const confidenceLabel: Record<string, string> = {
  low: '可能性：低',
  medium: '可能性：中',
  high: '可能性：较高',
};

export const confidenceColor: Record<string, string> = {
  low: '#B07B2E',
  medium: '#4A7BA6',
  high: '#3E8E75',
};

export const modeColor: Record<string, { bg: string; fg: string }> = {
  subtext: { bg: '#E8F5EF', fg: '#3E8E75' },
  rewrite: { bg: '#EAF2FA', fg: '#4A7BA6' },
  reply: { bg: '#FBF3E4', fg: '#B07B2E' },
  emotion: { bg: '#F3EEF9', fg: '#7A5FA8' },
};
