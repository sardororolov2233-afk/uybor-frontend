export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency?: string;
  location: string;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  userId: string;
  createdAt: string;
  phone?: string;
  telegram?: string;
  goal?: string;
  propertyType?: string;
  mortgage?: boolean;
  postedBy?: string;
  buildingType?: string;
  floor?: number;
  maxFloors?: number;
  area?: number;
  renovation?: string;
}

export interface User {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}
