export interface AdminSubmission {
  id: string;
  industry: string;
  position: string;
  result: string;
  comment: string | null;
  created_at: string;
  company_id: string;
  company_name: string;
  company_slug: string;
}

export interface AdminSubmissionsPage {
  submissions: AdminSubmission[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminCompany {
  id: string;
  name: string;
  name_normalized: string;
  logo_url: string | null;
}

export interface AdminCompaniesPage {
  companies: AdminCompany[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminCompanyUpdateBody {
  name: string;
}
