// TakeDocument API
export interface ParagraphBlock {
  kind: "paragraph";
  text: string;
}
export interface DocumentBlock {
  kind: "document";
  excerptId: string;
  highlightedRange: [number, number];
  viewRange: [number, number];
}
export interface VideoBlock {
  kind: "video";
  videoId: string;
  range?: [number, number];
}
export type TakeBlock = ParagraphBlock | DocumentBlock | VideoBlock;
export interface TakeDocument {
  title: string;
  blocks: TakeBlock[];
}

// UI-only login cookie
export interface LoginCookie {
  username: string;
}

// For submitting drafts
export interface DraftRev {
  draftid: number;
  lastrevid: number;
}
export interface DraftPost {
  parentRev?: DraftRev;
  title: string;
  blocks: any;
}
