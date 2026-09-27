/** Reserved Social Studio types. Features arrive when the owner ports that module. */

export interface BrandKit {
  tokens: Record<string, unknown>;
  logoAssetId: string;
  fonts: string[];
  voiceRules: string[];
  characters: string[];
}

export type SocialPlatform = "instagram" | "facebook" | "tiktok";

export type SocialFormat = "square_1080" | "portrait_1080x1350" | "story_1080x1920";

export type SocialPostStatus = "draft" | "approved" | "scheduled" | "published";

export interface SocialPostDraft {
  id: string;
  platform: SocialPlatform;
  format: SocialFormat;
  captionKa: string;
  hashtags: string[];
  sourceMaterialId?: string;
  templateId: string;
  templateData: Record<string, unknown>;
  assetIds: string[];
  status: SocialPostStatus;
  scheduledAt?: string;
}

export interface SocialRenderer {
  render(
    templateId: string,
    data: unknown,
    format: SocialFormat,
  ): Promise<{ assetId: string }>;
}

export type AgentEvent =
  | { type: "token"; text: string }
  | { type: "tool_call"; name: string }
  | { type: "done" }
  | { type: "error"; message: string };

export interface SocialAgent {
  run(input: {
    promptKa: string;
    sourceMaterialId?: string;
    count?: number;
  }): AsyncIterable<AgentEvent>;
}
