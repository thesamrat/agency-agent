// ─── Core Domain Types ────────────────────────────────────────────────────────

export interface DepthLayers {
  layer_1: string; // One-line essence
  layer_2: string; // 3-paragraph accessible prose
  layer_3: string; // Traditional commentary synthesis
  layer_4: string; // Sanskrit source reference
}

export interface Translation {
  commentator: string;
  text: string;
}

export interface CommentatorMeta {
  name: string;
  tradition: string;
  period?: string;
  school?: string;
}

export interface Commentary {
  commentator: CommentatorMeta;
  text: string;
}

export interface Verse {
  verse_ref: string; // "BG 2.47"
  chapter_number: number;
  verse_number: number;
  sanskrit_devanagari: string;
  sanskrit_iast: string;
  depth_layers: DepthLayers;
  translations: Translation[];
  commentaries: Commentary[];
}

export interface VersePreview {
  verse_ref: string;
  chapter_number: number;
  verse_number: number;
  sanskrit_devanagari: string;
  depth_layers: Pick<DepthLayers, 'layer_1'>;
}

// ─── Chapter Types ─────────────────────────────────────────────────────────────

export type YogaType =
  | 'Arjuna Vishada Yoga'
  | 'Sankhya Yoga'
  | 'Karma Yoga'
  | 'Jnana-Karma-Sanyasa Yoga'
  | 'Karma-Vairagya Yoga'
  | 'Abhyasa Yoga'
  | 'Paramahamsa Vijnana Yoga'
  | 'Aksara-Parabrahman Yoga'
  | 'Raja-Vidya-Raja-Guhya Yoga'
  | 'Vibhuti-Vistara-Yoga'
  | 'Vishvarupa-Sandarsana Yoga'
  | 'Bhakti Yoga'
  | 'Kshetra-Kshetrajna Vibhaga Yoga'
  | 'Gunatraya-Vibhaga Yoga'
  | 'Purushottama Yoga'
  | 'Daivasura-Sampad-Vibhaga Yoga'
  | 'Sraddhatraya-Vibhaga Yoga'
  | 'Moksha-Sanyasa Yoga';

export interface Chapter {
  number: number;
  title_english: string;
  title_sanskrit: string;
  yoga_type: YogaType;
  summary: string;
  verse_count: number;
  verses_read?: number; // client-side progress
}

// ─── Search Types ──────────────────────────────────────────────────────────────

export type SearchType = 'semantic' | 'exact' | 'commentator';

export interface SearchFilters {
  type: SearchType;
  chapter?: number;
  commentator?: string;
}

export interface SearchResult {
  verse_ref: string;
  chapter_number: number;
  verse_number: number;
  sanskrit_devanagari: string;
  depth_layers: Pick<DepthLayers, 'layer_1'>;
  highlight?: string; // matched snippet
  score?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
  filters: SearchFilters;
}

// ─── AI Q&A Types ─────────────────────────────────────────────────────────────

export interface Citation {
  verse_ref: string;
  commentator: string;
  tradition: string;
  link: string;
}

export interface AIQueryRequest {
  question: string;
  context_verse_ref?: string;
}

export interface AIStreamChunk {
  text: string;
}

export interface AIStreamCitations {
  citations: Citation[];
}

export interface AIStreamDone {
  interaction_id: string;
  tokens_used: number;
}

export type AIStreamEvent =
  | { event: 'chunk'; data: AIStreamChunk }
  | { event: 'citations'; data: AIStreamCitations }
  | { event: 'done'; data: AIStreamDone };

export interface AIInteraction {
  id: string;
  question: string;
  answer: string;
  citations: Citation[];
  tokens_used: number;
  feedback?: 'up' | 'down';
  created_at: string;
}

// ─── User / Auth Types ────────────────────────────────────────────────────────

export type SubscriptionTier = 'free' | 'scholar';

export interface UserSubscription {
  tier: SubscriptionTier;
  queries_used: number;
  queries_limit: number; // 10 for free, Infinity for scholar
  reset_date?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  subscription: UserSubscription;
  preferences: UserPreferences;
}

export interface UserPreferences {
  default_script: 'devanagari' | 'iast' | 'both';
  default_depth_layer: 1 | 2 | 3 | 4;
  font_size: 'normal' | 'large' | 'xlarge';
  audio_autoplay: boolean;
}

// ─── Share Types ───────────────────────────────────────────────────────────────

export interface ShareCardRequest {
  verse_ref: string;
  depth_layer: 1 | 2 | 3 | 4;
  include_sanskrit: boolean;
  theme: 'light' | 'saffron' | 'dark';
}

export interface ShareCardResponse {
  image_url: string;
  share_url: string;
  verse_ref: string;
}

// ─── Reading History ──────────────────────────────────────────────────────────

export interface ReadingHistoryEntry {
  verse_ref: string;
  viewed_at: string;
  depth_reached: 1 | 2 | 3 | 4;
}

// ─── API Response Wrappers ────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  has_next: boolean;
}

export interface APIError {
  code: string;
  message: string;
  status: number;
}
