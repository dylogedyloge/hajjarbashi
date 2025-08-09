export interface Country {
  id: string;
  name: string;
}

export interface City {
  id: string;
  name: string;
}

export interface PaginationData {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
}


