import { apiClient } from "@/api/apiClient";

export interface MonthlyTrendPoint {
  monthKey: string;
  label: string;
  visits: number;
  enquiries: number;
}

export interface DashboardSummary {
  totalVisits: number;
  visitsThisMonth: number;
  visitsLastMonthDeltaPercent: number | null;
  totalEnquiries: number;
  enquiriesThisMonth: number;
  enquiriesLastMonthDeltaPercent: number | null;
  monthlyTrend: MonthlyTrendPoint[];
  recentInquiries: {
    id: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    source: string;
    createdAt?: string;
  }[];
}

interface SummaryResponse {
  summary?: DashboardSummary;
}

export async function fetchDashboardSummary() {
  const response = (await apiClient.get("/admin/dashboard/summary")) as SummaryResponse;
  if (!response.summary) {
    throw new Error("Dashboard summary missing.");
  }
  return response.summary;
}
