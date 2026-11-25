import { AiConfig, TranslateRequest, TranslationData } from './types';

export type ApiErrorKind = 'not_configured' | 'network' | 'timeout' | 'server' | 'invalid';

export class ApiError extends Error {
  kind: ApiErrorKind;
  detail?: string;

  constructor(kind: ApiErrorKind, message: string, detail?: string) {
    super(message);
    this.kind = kind;
    this.detail = detail;
  }
}

interface ApiSuccess {
  success: true;
  data: TranslationData;
}

interface ApiFailure {
  success: false;
  error: { code: string; message: string };
}

const TIMEOUT_MS = 60000;

export async function translate(
  req: TranslateRequest,
  aiConfig?: AiConfig | null
): Promise<TranslationData> {
  const baseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!baseUrl || !anonKey) {
    throw new ApiError('network', '网络配置不完整，请稍后再试。');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let resp: Response;
  try {
    resp = await fetch(`${baseUrl}/functions/v1/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${anonKey}`,
        apikey: anonKey,
      },
      body: JSON.stringify({ ...req, aiConfig: aiConfig ?? undefined }),
      signal: controller.signal,
    });
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      throw new ApiError('timeout', '请求超时了，请稍后再试。');
    }
    throw new ApiError('network', '网络连接失败，请检查网络后重试。');
  } finally {
    clearTimeout(timer);
  }

  let body: ApiSuccess | ApiFailure | null = null;
  try {
    body = (await resp.json()) as ApiSuccess | ApiFailure;
  } catch {
    body = null;
  }

  if (!resp.ok || !body || body.success !== true) {
    const err = body && body.success === false ? body.error : null;
    const code = err?.code ?? '';
    if (resp.status === 503 || code === 'AI_NOT_CONFIGURED') {
      throw new ApiError(
        'not_configured',
        'AI 服务尚未配置。请到「设置」里填写 AI 服务的 API Key 和模型名称。'
      );
    }
    if (resp.status === 504) {
      throw new ApiError('timeout', '这次分析有点久，超时了。请稍后再试。');
    }
    if (resp.status === 502 || resp.status >= 500) {
      throw new ApiError('server', 'AI 服务暂时不可用，请稍后再试。');
    }
    if (resp.status === 400) {
      throw new ApiError('invalid', err?.message ?? '输入内容有问题，请检查后重试。');
    }
    throw new ApiError('server', err?.message ?? '服务出了点问题，请稍后再试。');
  }

  const data = body.data;
  if (!data || typeof data !== 'object' || !data.title || !data.mode) {
    throw new ApiError('invalid', 'AI 返回的内容不完整，请重新生成试试。');
  }
  return data;
}
