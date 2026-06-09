export interface Settings {
  id: number;
  whatsapp: string;
  email: string;
  whatsapp_message: string;
  email_subject: string;
  email_body: string;
  gemini_api_key?: string;
  about_title?: string;
  about_para1?: string;
  about_para2?: string;
  profile_photo?: string;
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

export interface PricingService {
  id?: number;
  title: string;
  price: string;
  rawPrice: string;
  description: string;
  iconText: string;
  features: string | string[]; // holds serialized array from DB, parsed as string[] in the UI
  display_order?: number;
}
