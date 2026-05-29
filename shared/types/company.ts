export interface CompanyListItem {
  id: string;
  name: string;
  name_normalized: string;
}

export interface CompanyOverviewItem {
  id: string;
  name: string;
  name_normalized: string;
  review_count: number;
  avg_rating: number | null;
  accept_rate: number | null;
  ghost_rate: number | null;
}
