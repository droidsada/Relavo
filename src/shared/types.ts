export interface ProfileData {
  name: string;
  headline: string;
  about: string;
  experience: string[];
  location: string;
}

export interface StorageData {
  apiKey: string;
  businessContext: string;
  tone: string;
}

export type MessageType =
  | 'GET_PROFILE_DATA'
  | 'PROFILE_DATA_RESPONSE'
  | 'GENERATE_MESSAGE'
  | 'GENERATE_MESSAGE_RESPONSE'
  | 'CHECK_LINKEDIN_TAB'
  | 'TOGGLE_WIDGET';

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

export interface GenerateMessageRequest extends BaseMessage {
  type: 'GENERATE_MESSAGE';
  profileData: ProfileData;
  businessContext: string;
  tone: string;
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

export type ExtensionMessage =
  | GetProfileDataMessage
  | ProfileDataResponseMessage
  | GenerateMessageRequest
  | GenerateMessageResponse
  | CheckLinkedInTabMessage
  | ToggleWidgetMessage;
