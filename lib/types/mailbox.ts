export interface MailboxSummary {
  id: string;
  type: "user" | "shared";
  name: string;
  email: string | null;
}

export interface ConnectSharedPayload {
  slug: string;
  name: string;
  roles: string[];
}

export interface MailFolder {
  folderId: string;
  folderName?: string;
  path?: string;
  unreadCount?: number;
}

export interface MailMessage {
  messageId: string;
  folderId: string;
  subject?: string;
  fromAddress?: string;
  sender?: string;
  summary?: string;
  receivedTime?: string;
  sentDateInGMT?: string;
  hasAttachment?: string | boolean;
  status?: string; // read/unread flag from Zoho
}

export interface MailMessageContent {
  content?: string;
  subject?: string;
  fromAddress?: string;
  toAddress?: string;
  receivedTime?: string;
}

export interface SendMailPayload {
  toAddress: string;
  ccAddress?: string;
  bccAddress?: string;
  subject: string;
  content: string;
  mailFormat?: "html" | "plaintext";
}
