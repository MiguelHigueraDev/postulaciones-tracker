export interface CompanyListItem {
  id: string;
  name: string;
  name_normalized: string;
}

export interface CompanyOverviewItem {
  id: string;
  name: string;
  name_normalized: string;
  logo_url: string | null;
  review_count: number;
  avg_rating: number | null;
  accept_rate: number | null;
  ghost_rate: number | null;
  offer_rate: number | null;
  avg_stages: number | null;
  avg_response_days: number | null;
  remote_rate: number | null;
  avg_salary: number | null;
}
