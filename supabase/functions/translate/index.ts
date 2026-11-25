type Confidence = 'low' | 'medium' | 'high';

type Scenario =
  | 'general'
  | 'workplace'
  | 'friends'
  | 'relationship'
  | 'family'
  | 'social'
  | 'interview'
  | 'customer'
  | 'other';

interface TextVariant {
  style: string;
  content: string;
  description: string;
}

interface TranslateRequest {
  mode: 'subtext' | 'rewrite' | 'reply' | 'emotion';
  text: string;
  scenario: Scenario;
  context?: string;
  options?: {
    focus?: string;
    tone?: string;
    relationship?: string;
    goal?: string;
  };
  aiConfig?: { apiKey?: unknown; baseUrl?: unknown; model?: unknown };
}

interface TranslationData {
  mode: TranslateRequest['mode'];
  title: string;
  literalMeaning?: string;
  humanTranslation?: string;
  interpretations?: { text: string; evidence: string; confidence: Confidence }[];
  emotionCues?: { label: string; evidence: string; confidence: Confidence }[];
  alternatives?: string[];
  suggestions?: string[];
  variants?: TextVariant[];
  uncertaintyNote?: string;
}

const TIMEOUT_MS = 55000;

const SCENARIO_LABELS: Record<Scenario, string> = {
  general: '通用',
  workplace: '职场沟通',
  friends: '朋友聊天',
  relationship: '亲密关系/暧昧',
  family: '家庭沟通',
  social: '社交与拒绝',
  interview: '面试与求职',
  customer: '客户沟通',
  other: '其他',
};

interface FieldError {
  field: string;
  message: string;
}

function validateRequest(body: any): { req: TranslateRequest } | { error: FieldError } {
  if (!body || typeof body !== 'object') {
    return { error: { field: 'body', message: '请求格式不正确。' } };
  }
  const mode = body.mode;
  if (mode !== 'subtext' && mode !== 'rewrite' && mode !== 'reply' && mode !== 'emotion') {
    return { error: { field: 'mode', message: '未知的翻译模式。' } };
  }
  const text = typeof body.text === 'string' ? body.text.trim() : '';
  if (text.length < 2) {
    return { error: { field: 'text', message: '请至少输入 2 个字符。' } };
  }
  if (text.length > 3000) {
    return { error: { field: 'text', message: '输入内容不能超过 3000 字。' } };
  }
  const context = typeof body.context === 'string' ? body.context.trim() : '';
  if (context.length > 1500) {
    return { error: { field: 'context', message: '补充说明不能超过 1500 字。' } };
  }
  const scenario: Scenario = body.scenario in SCENARIO_LABELS ? body.scenario : 'general';
  return {
    req: {
      mode,
      text,
      scenario,
      context,
      options:
        body.options && typeof body.options === 'object'
          ? {
              focus: typeof body.options.focus === 'string' ? body.options.focus.slice(0, 30) : undefined,
              tone: typeof body.options.tone === 'string' ? body.options.tone.slice(0, 30) : undefined,
              relationship:
                typeof body.options.relationship === 'string'
                  ? body.options.relationship.slice(0, 30)
                  : undefined,
              goal: typeof body.options.goal === 'string' ? body.options.goal.slice(0, 30) : undefined,
            }
          : undefined,
    },
  };
}

function corsResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
      'Content-Type': 'application/json',
    },
  });
}

const CONFIDENCES: Confidence[] = ['low', 'medium', 'high'];

function coerceConfidence(v: unknown): Confidence {
  return typeof v === 'string' && CONFIDENCES.includes(v as Confidence) ? (v as Confidence) : 'medium';
}

function clampText(v: unknown, max: number): string {
  return typeof v === 'string' ? v.slice(0, max) : '';
}

function coerceVariants(v: unknown, max: number): TextVariant[] {
  if (!Array.isArray(v)) return [];
  return v.slice(0, max).map((item) => ({
    style: clampText((item as any)?.style, 30) || '建议',
    content: clampText((item as any)?.content, 1500),
    description: clampText((item as any)?.description, 300),
  }));
}

function validateModelOutput(mode: TranslateRequest['mode'], raw: any): TranslationData | null {
  if (!raw || typeof raw !== 'object') return null;
  const base = {
    mode,
    title: clampText(raw.title, 60) || '分析结果',
  };

  if (mode === 'subtext' || mode === 'emotion') {
    const interpretations = Array.isArray(raw.interpretations)
      ? raw.interpretations.slice(0, 3).map((i: any) => ({
          text: clampText(i?.text, 500),
          evidence: clampText(i?.evidence, 500),
          confidence: coerceConfidence(i?.confidence),
        }))
      : [];
    const emotionCues = Array.isArray(raw.emotionCues)
      ? raw.emotionCues.slice(0, 3).map((i: any) => ({
          label: clampText(i?.label, 50),
          evidence: clampText(i?.evidence, 500),
          confidence: coerceConfidence(i?.confidence),
        }))
      : [];
    if (mode === 'subtext' && interpretations.length === 0) return null;
    return {
      ...base,
      literalMeaning: clampText(raw.literalMeaning, 800),
      humanTranslation: clampText(raw.humanTranslation, 800),
      interpretations,
      emotionCues,
      alternatives: Array.isArray(raw.alternatives)
        ? raw.alternatives.slice(0, 3).map((a: any) => clampText(a, 300)).filter(Boolean)
        : [],
      suggestions: Array.isArray(raw.suggestions)
        ? raw.suggestions.slice(0, 3).map((a: any) => clampText(a, 500)).filter(Boolean)
        : [],
      uncertaintyNote:
        clampText(raw.uncertaintyNote, 300) ||
        '以上是基于文字和有限上下文的可能解读，不代表对方真实想法。',
    };
  }

  if (mode === 'rewrite' || mode === 'reply') {
    const variants = coerceVariants(raw.variants, mode === 'reply' ? 4 : 3);
    if (variants.length === 0) return null;
    return {
      ...base,
      uncertaintyNote:
        clampText(raw.uncertaintyNote, 300) ||
        (mode === 'reply'
          ? '回复仅供参考，发送前可以根据你们的关系再调整一下。'
          : '版本仅供参考，请确认转换后的表达仍符合你的真实想法。'),
    };
  }

  return null;
}

function buildSystemPrompt(req: TranslateRequest): string {
  const common = [
    '你是一个沟通辅助助手，帮助用户理解聊天内容或改善表达。你不是读心者。',
    '只根据用户提供的文本和上下文进行分析，区分“文本明确表达的内容”和“合理推测”。',
    '存在歧义时必须提供多种解释，为每个推测给出文本依据。',
    '不输出确定性的心理判断，不臆测性别、身份、人格、心理疾病或关系状态。',
    '不把简短回复自动判定为负面情绪；回复简短不等于生气，冷淡不等于不喜欢。',
    '输出简体中文。输出必须是合法 JSON，不使用 Markdown 代码围栏，不在 JSON 之外添加任何解释文字。',
  ].join('\n');

  if (req.mode === 'subtext') {
    return `${common}

任务：分析别人说的话，输出潜台词解读。JSON 字段：
- "title"：一句话概括这次分析，例如"这句话可能在表达什么"
- "literalMeaning"：字面意思，简洁中文
- "humanTranslation"：用一句自然的话概括可能的真实沟通含义，存在多种解释时不要只给唯一结论
- "interpretations"：1~3 个可能解释的数组，每项 { "text": 解释内容, "evidence": 支持线索, "confidence": "low"|"medium"|"high" }
- "emotionCues"：0~3 个语气情绪线索，每项 { "label": 线索, "evidence": 依据（引用措辞或标点）, "confidence": "low"|"medium"|"high" }
- "alternatives"：1~3 条其他可能（如对方确实很忙、只是表达习惯不同）
- "suggestions"：1~3 条低风险的沟通建议，可包含具体可用的问法
- "uncertaintyNote"：固定的不确定性提示
对缺少上下文的短句，降低 confidence 等级。禁止输出"对方一定生气""他就是不在乎你"等武断结论。`;
  }

  if (req.mode === 'emotion') {
    return `${common}

任务：分析一段话的语气与情绪线索。JSON 字段：
- "title"：一句话概括，例如"这段话的语气线索"
- "emotionCues"：最多 3 项，每项 { "label": 情绪或态度线索, "evidence": 依据（引用输入中的短语或标点）, "confidence": "low"|"medium"|"high" }
- "alternatives"：1~3 条可能的其他解释
- "suggestions"：1~2 条建议（例如如何进一步确认）
- "uncertaintyNote"：固定的不确定性提示
对"嗯""哦""好"等极短输入，返回低把握程度和信息不足说明。`;
  }

  if (req.mode === 'rewrite') {
    return `${common}

任务：把用户想说的话转换成更合适的表达。必须保留用户的核心诉求，不增加未经确认的事实、承诺或道歉，不把合理的拒绝改成无条件答应。JSON 字段：
- "title"：一句话概括，例如"几种更得体的说法"
- "variants"：2~3 个版本，每项 { "style": 风格名称, "content": 转换后的文本, "description": 简短说明（适合什么情况） }
用户指定了目标语气时，围绕该语气生成候选。语言自然，不油腻，不模板化。礼貌坚定时不能把明确拒绝改成模糊答应。`;
  }

  return `${common}

任务：帮用户回复收到的消息。生成 3~4 条可直接发送的回复，像真实聊天，不要写成小作文。根据关系、场景和用户目标调整称呼、语气和正式程度。不假设对方性别，不生成操控、羞辱、威胁或激化矛盾的内容；复杂冲突优先提供澄清、表达感受、提出具体诉求等低冲突方式。信息不足时优先生成中性、开放式回复。JSON 字段：
- "title"：一句话概括，例如"几种可选的回复"
- "variants"：3~4 条回复，每项 { "style": 风格标签（如 温和自然 / 高情商得体 / 幽默轻松 / 简洁有边界）, "content": 可直接发送的回复文本, "description": 适用说明 }`;
}

function buildUserPrompt(req: TranslateRequest): string {
  const parts: string[] = [];
  if (req.mode === 'subtext') {
    parts.push('对方说的话：');
  } else if (req.mode === 'rewrite') {
    parts.push('我想说的话：');
    if (req.options?.tone) parts.push(`目标语气：${req.options.tone}`);
  } else if (req.mode === 'reply') {
    parts.push('对方发来的消息：');
    if (req.options?.relationship) parts.push(`双方关系：${req.options.relationship}`);
    if (req.options?.goal) parts.push(`我的回复目标：${req.options.goal}`);
  } else {
    parts.push('需要分析的文本：');
  }
  parts.push(req.text);
  if (req.mode === 'subtext' && req.options?.focus) {
    parts.push(`分析侧重点：${req.options.focus}`);
  }
  parts.push(`沟通场景：${SCENARIO_LABELS[req.scenario]}`);
  if (req.context) parts.push(`补充上下文：${req.context}`);
  return parts.join('\n');
}

function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenceMatch ? fenceMatch[1] : trimmed;
}

function extractJson(text: string): any | null {
  const cleaned = stripCodeFence(text);
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function callAi(req: TranslateRequest, env: Record<string, string | undefined>): Promise<any> {
  const clientKey =
    typeof req.aiConfig?.apiKey === 'string' ? req.aiConfig.apiKey.trim().slice(0, 200) : '';
  const clientBase =
    typeof req.aiConfig?.baseUrl === 'string' ? req.aiConfig.baseUrl.trim().slice(0, 300) : '';
  const clientModel =
    typeof req.aiConfig?.model === 'string' ? req.aiConfig.model.trim().slice(0, 100) : '';

  const apiKey = clientKey || env.AI_API_KEY;
  const model = clientModel || env.AI_MODEL;
  const baseUrl =
    (clientBase || env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');

  if (!apiKey || !model) {
    throw { kind: 'not_configured' as const, fromClient: Boolean(clientKey && clientModel) };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS - 2000);

  try {
    const resp = await fetch(`${baseUrl.replace(/\/+$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: buildSystemPrompt(req) },
          { role: 'user', content: buildUserPrompt(req) },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    if (!resp.ok) {
      if (resp.status === 401 || resp.status === 403) {
        throw { kind: 'provider_auth' as const };
      }
      if (resp.status === 429) {
        throw { kind: 'rate_limit' as const };
      }
      throw { kind: 'provider_error' as const, status: resp.status };
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || content.length === 0) {
      return null;
    }
    return extractJson(content);
  } catch (e: any) {
    if (e && e.name === 'AbortError') {
      throw { kind: 'timeout' as const };
    }
    if (e && typeof e === 'object' && 'kind' in e) {
      throw e;
    }
    throw { kind: 'network' as const };
  } finally {
    clearTimeout(timer);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return corsResponse(null, 200);
  }

  if (req.method === 'GET') {
    return corsResponse({ success: true, status: 'ok' }, 200);
  }

  if (req.method !== 'POST') {
    return corsResponse(
      { success: false, error: { code: 'METHOD_NOT_ALLOWED', message: '不支持的请求方式。' } },
      405
    );
  }

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return corsResponse(
      { success: false, error: { code: 'BAD_JSON', message: '请求内容格式不正确。' } },
      400
    );
  }

  const validated = validateRequest(body);
  if ('error' in validated) {
    return corsResponse(
      {
        success: false,
        error: { code: 'INVALID_REQUEST', message: validated.error.message },
      },
      400
    );
  }

  const parsed = extractJson;
  void parsed;

  try {
    const raw = await callAi(validated.req, Deno.env.toObject());
    if (raw === null) {
      return corsResponse(
        {
          success: false,
          error: { code: 'AI_BAD_OUTPUT', message: 'AI 返回的内容无法解析，请重新生成试试。' },
        },
        502
      );
    }

    const result = validateModelOutput(validated.req.mode, raw);
    if (!result) {
      return corsResponse(
        {
          success: false,
          error: { code: 'AI_BAD_OUTPUT', message: 'AI 返回的内容不完整，请重新生成试试。' },
        },
        502
      );
    }

    return corsResponse({ success: true, data: result }, 200);
  } catch (e: any) {
    const kind = e && typeof e === 'object' && 'kind' in e ? e.kind : 'network';

    if (kind === 'not_configured') {
      const fromClient = e && typeof e === 'object' && e.fromClient === true;
      return corsResponse(
        {
          success: false,
          error: {
            code: 'AI_NOT_CONFIGURED',
            message: fromClient
              ? 'AI 服务连接失败，请检查「设置」里填写的 API Key、接口地址和模型名称是否正确。'
              : 'AI 服务尚未配置，请到「设置」里填写 AI 服务的 API Key 和模型名称。',
          },
        },
        503
      );
    }
    if (kind === 'timeout') {
      return corsResponse(
        { success: false, error: { code: 'AI_TIMEOUT', message: '分析超时了，请稍后再试。' } },
        504
      );
    }
    if (kind === 'rate_limit') {
      return corsResponse(
        {
          success: false,
          error: { code: 'AI_RATE_LIMITED', message: '当前请求有点多，请稍等片刻再试。' },
        },
        502
      );
    }
    if (kind === 'provider_auth') {
      return corsResponse(
        {
          success: false,
          error: {
            code: 'AI_AUTH_FAILED',
            message: 'AI 服务鉴权失败，请检查「设置」里填写的 API Key 是否有效。',
          },
        },
        502
      );
    }

    return corsResponse(
      { success: false, error: { code: 'AI_PROVIDER_ERROR', message: 'AI 服务暂时不可用，请稍后再试。' } },
      502
    );
  }
});
