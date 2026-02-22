export interface SlackEvent {
  type: string;
  event?: {
    type: string;
    user: string;
    text: string;
    ts: string;
    channel: string;
    thread_ts?: string;
  };
  challenge?: string;
}

export interface SlackConfig {
  botToken: string;
  signingSecret: string;
  agentId: string;
}
