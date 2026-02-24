import { WebClient } from "@slack/web-api";
import { shadowMeAgent } from "../agents/shadow-me";

// 3. 最小限のハンドラー（Next.js等のAPI Routeを想定）
export async function POST(req: Request) {
  const body = await req.json();

  // A. SlackのURL検証用（これがないとSlackの設定が完了できません） [1]
  if (body.type === "url_verification") {
    return new Response(JSON.stringify({ challenge: body.challenge }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const event = body.event;
  // B. 処理すべきイベント（メンション）以外や、ボット自身の投稿は無視 [2]
  if (!event || event.bot_id || event.type !== "app_mention") {
    return new Response("OK");
  }

  // C. AIによる回答生成
  // 本来はクリーンアップが必要ですが、最小限のためテキストをそのまま渡します [3, 4]
  const result = await shadowMeAgent.generate(event.text);

  // D. Slack SDKを使って返信を送信 [5, 6]
  const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
  await slack.chat.postMessage({
    channel: event.channel,
    text: result.text,
    thread_ts: event.ts, // スレッドで返信
  });

  return new Response("OK");
}
