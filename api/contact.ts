const CONTACT_TYPES = {
  general: { label: '総合窓口', recipientEnv: 'CONTACT_GENERAL_TO' },
  welfare: { label: '福祉・DX伴走支援', recipientEnv: 'CONTACT_WELFARE_TO' },
  lab: { label: 'ツール開発・データ分析', recipientEnv: 'CONTACT_LAB_TO' },
} as const;

type ContactType = keyof typeof CONTACT_TYPES;

const json = (body: Record<string, unknown>, status = 200) =>
  Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });

const isContactType = (value: string): value is ContactType => value in CONTACT_TYPES;

const stringValue = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const singleLine = (value: unknown) => stringValue(value).replace(/[\r\n]+/g, ' ');

const isValidEmail = (value: string) =>
  value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export default {
  async fetch(request: Request) {
    if (request.method !== 'POST') {
      return json({ ok: false, message: 'POSTメソッドで送信してください。' }, 405);
    }

    const contentType = request.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      return json({ ok: false, message: '送信形式が正しくありません。' }, 415);
    }

    let body: Record<string, unknown>;
    try {
      const rawBody = await request.text();
      if (rawBody.length > 20_000) {
        return json({ ok: false, message: '送信内容が大きすぎます。' }, 413);
      }
      const parsed: unknown = JSON.parse(rawBody);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid body');
      body = parsed as Record<string, unknown>;
    } catch {
      return json({ ok: false, message: '送信内容を読み取れませんでした。' }, 400);
    }

    const type = singleLine(body.type);
    const name = singleLine(body.name);
    const email = singleLine(body.email);
    const organization = singleLine(body.organization);
    const subject = singleLine(body.subject);
    const message = stringValue(body.message);
    const website = singleLine(body.website);

    // Botには成功したように応答し、メールは送信しない。
    if (website) return json({ ok: true, message: 'お問い合わせを受け付けました。' });

    if (
      !isContactType(type) ||
      !name || name.length > 100 ||
      !isValidEmail(email) ||
      organization.length > 200 ||
      !subject || subject.length > 200 ||
      !message || message.length > 5_000 ||
      body.privacy !== true
    ) {
      return json({ ok: false, message: '入力内容を確認してください。' }, 400);
    }

    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.CONTACT_FROM_EMAIL;
    const recipient = process.env[CONTACT_TYPES[type].recipientEnv];

    if (!apiKey || !fromEmail || !recipient) {
      console.error('Contact form environment variables are not configured.');
      return json({ ok: false, message: '現在送信できません。時間をおいて再度お試しください。' }, 503);
    }

    const desk = CONTACT_TYPES[type].label;
    const mailText = [
      `窓口: ${desk}`,
      `お名前: ${name}`,
      `メールアドレス: ${email}`,
      `所属・事業所名: ${organization || '未入力'}`,
      `件名: ${subject}`,
      '',
      'お問い合わせ内容:',
      message,
    ].join('\n');

    try {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': crypto.randomUUID(),
        },
        body: JSON.stringify({
          from: `AUL DoX お問い合わせ <${fromEmail}>`,
          to: [recipient],
          reply_to: email,
          subject: `【${desk}】${subject}`,
          text: mailText,
        }),
      });

      if (!resendResponse.ok) {
        console.error('Resend API error:', resendResponse.status, await resendResponse.text());
        return json({ ok: false, message: '送信に失敗しました。時間をおいて再度お試しください。' }, 502);
      }

      return json({ ok: true, message: 'お問い合わせを受け付けました。' });
    } catch (error) {
      console.error('Contact form send error:', error);
      return json({ ok: false, message: '送信に失敗しました。時間をおいて再度お試しください。' }, 502);
    }
  },
};
