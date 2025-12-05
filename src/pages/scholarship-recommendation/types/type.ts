export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export interface ScholarshipRecommendation {
  id: string;
  nama: string;
  jenis: string;
  penyelenggara: string;
  open_registration: string;
  close_registration: string;
  match_score: number; // Backend returns integer (85), not decimal (0.85)
}

export interface AIRecommendationResponse {
  search_summary: string;
  total_found: number;
  recommendations: ScholarshipRecommendation[];
}

// Backend API response wrapper
export interface BackendApiResponse {
  code: number;
  message: string;
  status: boolean;
  data: AIRecommendationResponse;
}

export interface RekomendasiBeasiswaRequest {
  age?: number;
  gender?: string; // "LAKI_LAKI" or "PEREMPUAN"
  kota_kabupaten?: string;
  provinsi?: string;
  education_level?: string; // lowercase: "sma", "s1", etc.
  ipk?: number;
  status_beasiswa_aktif?: boolean;
  status_keluarga_tidak_mampu?: boolean;
  status_disabilitas?: boolean;
  semester?: number;
  faculty_id?: string;
  major_id?: string;
  user_prompt: string;
  limit: number;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  recommendations: ScholarshipRecommendation[];
}

// Frontend display interface
export interface ScholarshipRecommendationDisplay {
  id: string;
  title: string;
  provider: string;
  deadline: string;
  amount: string;
  requirements: string[];
  description: string;
  eligibility: string;
  link: string;
  match_score?: number;
}
