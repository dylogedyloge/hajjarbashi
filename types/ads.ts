export type Ad = {
  id: string;
  created_at?: number;
  updated_at?: number;
  status?: string | number;
  views?: number;
  weight?: number;
  sale_unit_type?: string;
  price: number;
  colors?: string[];
  category?: {
    id: string;
    name: string;
    description?: string;
    image?: string;
    colors?: string[];
  };
  form?: string;
  surface?: { id: string; name: string };
  grade?: string;
  is_chat_enabled?: boolean;
  contact_info_enabled?: boolean;
  express?: boolean;
  minimum_order?: number;
  description?: string;
  origin_country?: { id: string; name: string };
  origin_city?: { id: string; name: string };
  size?: { h?: number; w?: number; l?: number };
  media?: Array<{
    index: number;
    media_path?: string;
    media_thumb_path?: string;
  }>;
  cover?: string;
  cover_thumb?: string;
  benefits?: string[];
  defects?: string[];
  weight_range_type?: string;
  size_range_type?: string;
  bookmarked?: boolean;
  receiving_ports_details?: Array<{
    id: string;
    name: string;
    city_name: string | null;
    ownership: string;
  }>;
  export_ports_details?: Array<{
    id: string;
    name: string;
    city_name: string | null;
    ownership: string;
  }>;
  image?: string;
  stone_type?: string;
  origin?: string;
  source_port?: string;
  color?: string | string[];
  price_unit?: string;
  published_at?: string;
  is_featured?: boolean;
  is_express?: boolean;
};

export type AdsFilters = {
  min_price?: number;
  max_price?: number;
  form?: string;
  category_ids?: string[];
  colors?: string[];
  surface_ids?: string[];
  size_range_type?: string;
  receiving_ports?: string[];
  export_ports?: string[];
  origin_country_ids?: string[];
  grade?: string;
  express?: boolean;
  promoted?: boolean;
  search_description?: string;
  sort?: string;
};

export type Media = { media_thumb_path?: string; media_path?: string };

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  colors?: string[];
  // Optional origin metadata provided by API
  origin_city_id?: string;
  origin_country_id?: string;
  origin_city_name?: string;
  origin_country_name?: string;
  children?: Category[];
}

export interface Surface {
  id: string;
  name: string;
  description?: string;
}

export interface Port {
  id: string;
  name: string;
  city_name: string;
  ownership: string;
  mtpa?: string;
}


