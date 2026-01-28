// LLM Provider Types
export type LLMProvider = 'anthropic' | 'openai' | 'gemini';

// Widget Position Type
export type WidgetPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface ApiKeys {
  anthropic?: string;
  openai?: string;
  gemini?: string;
}

export interface SystemPrompts {
  profileAnalysis: string;
  messageGeneration: string;
}

export interface MessageOptions {
  vibes: string[];
  relationships: string[];
  channels: string[];
}

// Profile Data Types
export interface ProfileData {
  name: string;
  headline: string;
  about: string;
  experience: string[];
  location: string;
  certifications?: string[];
  projects?: string[];
  recommendations?: string[];
  interests?: string[];
  activity?: string[];
}

export interface ProfileAnalysis {
  interests: string[];
  alignmentSuggestion: string;
}

// Storage Types
export interface StorageData {
  // API Configuration
  activeProvider: LLMProvider;
  apiKeys: ApiKeys;
  model: string;

  // Behavior Settings
  autoFetchProfile: boolean;
  widgetPosition: WidgetPosition;

  // Prompts
  systemPrompts: SystemPrompts;

  // Message Options (customizable vibes and relationships)
  messageOptions: MessageOptions;

  // Message Generation Defaults
  businessContext: string;
  defaultVibe: string;
  defaultRelationship: string;
  defaultChannel: string;
}

// Available Models by Provider
export const AVAILABLE_MODELS: Record<LLMProvider, Array<{ id: string; name: string }>> = {
  anthropic: [
    { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku (Fast)' },
  ],
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
  ],
  gemini: [
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
  ],
};

// Default Message Options
export const DEFAULT_MESSAGE_OPTIONS: MessageOptions = {
  vibes: ['casual', 'professional', 'enthusiastic', 'friendly'],
  relationships: ['cold', 'met-before', 'referral', 'mutual-connection'],
  channels: ['connect-note', 'inmail', 'post-accept'],
};

// Default System Prompts
export const DEFAULT_SYSTEM_PROMPTS: SystemPrompts = {
  profileAnalysis: `You are analyzing a LinkedIn profile to identify:
1. Key professional interests and focus areas
2. How someone could meaningfully connect with this person

Return a JSON object with:
- "interests": array of 3-5 short interest tags
- "alignmentSuggestion": 2-3 sentences on how to align/connect

Be specific and actionable. Focus on genuine connection points.
Return ONLY valid JSON, no markdown or explanation.`,

  messageGeneration: `You are crafting a LinkedIn connection message. Consider:
- The recipient's background and interests
- The sender's context and goals
- The relationship type (cold, warm, referral)
- The desired tone/vibe

Create a personalized, genuine message that:
1. References something specific from their profile
2. Provides clear value or reason to connect
3. Is concise (2-3 sentences max)
4. Ends with a light question or call to action

Return ONLY the message text.`,
};

// Message Types
export type MessageType =
  | 'GET_PROFILE_DATA'
  | 'PROFILE_DATA_RESPONSE'
  | 'ANALYZE_PROFILE'
  | 'ANALYZE_PROFILE_RESPONSE'
  | 'GENERATE_MESSAGE'
  | 'GENERATE_MESSAGE_RESPONSE'
  | 'CHECK_LINKEDIN_TAB'
  | 'TOGGLE_WIDGET'
  | 'GET_CACHED_ANALYSIS'
  | 'CACHED_ANALYSIS_RESPONSE';

export interface BaseMessage {
  type: MessageType;
}

export interface GetProfileDataMessage extends BaseMessage {
  type: 'GET_PROFILE_DATA';
}

export interface ProfileDataResponseMessage extends BaseMessage {
  type: 'PROFILE_DATA_RESPONSE';
  data: ProfileData | null;
  error?: string;
}

export interface AnalyzeProfileRequest extends BaseMessage {
  type: 'ANALYZE_PROFILE';
  profileData: ProfileData;
}

export interface AnalyzeProfileResponse extends BaseMessage {
  type: 'ANALYZE_PROFILE_RESPONSE';
  analysis?: ProfileAnalysis;
  error?: string;
}

export interface GenerateMessageRequest extends BaseMessage {
  type: 'GENERATE_MESSAGE';
  profileData: ProfileData;
  profileAnalysis?: ProfileAnalysis;
  vibe: string;
  relationship: string;
  channel: string;
  customContext: string;
  businessContext?: string;
}

export interface GenerateMessageResponse extends BaseMessage {
  type: 'GENERATE_MESSAGE_RESPONSE';
  message?: string;
  error?: string;
}

export interface CheckLinkedInTabMessage extends BaseMessage {
  type: 'CHECK_LINKEDIN_TAB';
}

export interface ToggleWidgetMessage extends BaseMessage {
  type: 'TOGGLE_WIDGET';
}

export interface GetCachedAnalysisMessage extends BaseMessage {
  type: 'GET_CACHED_ANALYSIS';
  profileUrl: string;
}

export interface CachedAnalysisResponse extends BaseMessage {
  type: 'CACHED_ANALYSIS_RESPONSE';
  analysis?: ProfileAnalysis;
  profileData?: ProfileData;
}

export type ExtensionMessage =
  | GetProfileDataMessage
  | ProfileDataResponseMessage
  | AnalyzeProfileRequest
  | AnalyzeProfileResponse
  | GenerateMessageRequest
  | GenerateMessageResponse
  | CheckLinkedInTabMessage
  | ToggleWidgetMessage
  | GetCachedAnalysisMessage
  | CachedAnalysisResponse;
