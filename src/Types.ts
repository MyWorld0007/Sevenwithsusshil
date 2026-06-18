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
  smtp_host?: string;
  smtp_port?: string | number;
  smtp_user?: string;
  smtp_pass?: string;
  journey_step1_title?: string;
  journey_step1_desc?: string;
  journey_step2_title?: string;
  journey_step2_desc?: string;
  journey_step3_title?: string;
  journey_step3_desc?: string;
}

export interface Testimonial {
  id: number;
  text: string;
  initial: string;
  name: string;
  loc: string;
  date?: string;
  rating?: number;
  status?: string;
  helpful_count?: number;
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
  operator_id?: number | null;
  operator_name?: string | null;
  operator_whatsapp?: string | null;
  display_order?: number;
}

export interface PathwayCard {
  id?: number;
  card_number: string;
  title: string;
  slug: string;
  short_desc: string;
  display_order?: number;
}

export interface Partner {
  id?: number;
  name: string;
  gratitude: string;
  title: string;
  description: string;
  profile_photo: string;
  whatsapp?: string;
  display_order?: number;
}
