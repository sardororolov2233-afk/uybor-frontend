export interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;         // RENT | SALE
  property_type: string;    // APARTMENT | HOUSE | COMMERCIAL | LAND
  rooms: number;
  area: number | null;
  address: string;
  lat: number | null;
  lon: number | null;
  status: string;
  images: string[];
  created_at: string;
  updated_at: string;
  // JOIN orqali keladigan user ma'lumotlari
  users?: {
    username: string | null;
    first_name: string | null;
    phone_number: string | null;
  };
}

export interface User {
  id: string;
  telegram_id: number;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  language: string;
  role: string;
  created_at: string;
}
