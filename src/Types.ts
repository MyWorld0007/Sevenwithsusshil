export interface Settings {
  id: number;
  whatsapp: string;
  email: string;
  whatsapp_message: string;
  email_subject: string;
  email_body: string;
  gemini_api_key?: string;
}

export interface Testimonial {
  id: number;
  text: string;
  initial: string;
  name: string;
  loc: string;
  date?: string;
  rating?: number;
}

export interface LifePath {
  id: number;
  name: string;
  desc: string;
}

export interface Faq {
  id: number;
  question: string;
  answer: string;
  display_order: number;
}
