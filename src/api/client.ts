import type {
  AgricultureJoin,
  AgricultureOpportunity,
  AssistanceProgram,
  AssistanceRequest,
  FinancialLesson,
  ImpactMetrics,
  JobApplication,
  JobListing,
  MemberDashboardData,
  SmallBusiness,
  TrainingCourse,
  TrainingEnrollment,
  UserProfile,
  UserRole,
} from '../types';

export interface CatalogResponse {
  jobs: JobListing[];
  businesses: SmallBusiness[];
  trainingCourses: TrainingCourse[];
  agricultureOpportunities: AgricultureOpportunity[];
  financialLessons: FinancialLesson[];
  assistancePrograms: AssistanceProgram[];
}

export interface AdminOverviewResponse {
  users: UserProfile[];
  applications: JobApplication[];
  businesses: SmallBusiness[];
  assistanceRequests: AssistanceRequest[];
  jobs: JobListing[];
  assistancePrograms: AssistanceProgram[];
  impact: ImpactMetrics;
}

async function request<T>(
  url: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data as T;
}

export const api = {
  getCatalog: () => request<CatalogResponse>('/api/catalog'),
  getImpact: () => request<ImpactMetrics>('/api/impact'),

  register: (payload: {
    fullName: string;
    email: string;
    password: string;
    role: UserRole;
    location: string;
    phone: string;
  }) =>
    request<{ token: string; user: UserProfile }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    request<{ token: string; user: UserProfile }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  demoLogin: () =>
    request<{ token: string; user: UserProfile }>('/api/auth/demo', {
      method: 'POST',
    }),

  getMemberDashboard: (token: string) =>
    request<MemberDashboardData>('/api/member/dashboard', {}, token),

  applyForJob: (
    jobId: string,
    payload: { skillsSummary: string; coverNote: string },
    token: string
  ) =>
    request<{ application: JobApplication }>(
      `/api/jobs/${encodeURIComponent(jobId)}/apply`,
      { method: 'POST', body: JSON.stringify(payload) },
      token
    ),

  registerBusiness: (
    payload: {
      businessName: string;
      sector: string;
      location: string;
      employeesCount: number;
      monthlyRevenueGoalSSP: number;
      capitalNeededSSP: number;
      description: string;
    },
    token: string
  ) =>
    request<{ business: SmallBusiness }>(
      '/api/businesses',
      { method: 'POST', body: JSON.stringify(payload) },
      token
    ),

  completeTraining: (courseId: string, token: string) =>
    request<{ enrollment: TrainingEnrollment }>(
      `/api/training/${encodeURIComponent(courseId)}/complete`,
      { method: 'POST' },
      token
    ),

  joinAgriculture: (
    opportunityId: string,
    payload: { acreageNote: string },
    token: string
  ) =>
    request<{ joinRecord: AgricultureJoin }>(
      `/api/agriculture/${encodeURIComponent(opportunityId)}/join`,
      { method: 'POST', body: JSON.stringify(payload) },
      token
    ),

  completeFinancialLesson: (lessonId: string, token: string) =>
    request<{ lessonId: string; completed: boolean }>(
      `/api/financial/${encodeURIComponent(lessonId)}/complete`,
      { method: 'POST' },
      token
    ),

  applyAssistance: (
    programId: string,
    payload: { householdSize: number; needStatement: string },
    token: string
  ) =>
    request<{ request: AssistanceRequest }>(
      `/api/assistance/${encodeURIComponent(programId)}/apply`,
      { method: 'POST', body: JSON.stringify(payload) },
      token
    ),

  getAdminStatus: () =>
    request<{ configured: boolean; usingEnv: boolean }>('/api/admin/status'),

  bootstrapAdmin: (passcode: string) =>
    request<{ token: string }>('/api/admin/bootstrap', {
      method: 'POST',
      body: JSON.stringify({ passcode }),
    }),

  loginAdmin: (passcode: string) =>
    request<{ token: string }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ passcode }),
    }),

  getAdminOverview: (adminToken: string) =>
    request<AdminOverviewResponse>('/api/admin/overview', {}, adminToken),

  createAdminJob: (
    payload: {
      title: string;
      employer: string;
      location: string;
      sector: string;
      employmentType: 'Full-Time' | 'Part-Time' | 'Apprenticeship' | 'Contract';
      monthlySalarySSP: number;
      summary: string;
      requirements: string[];
    },
    adminToken: string
  ) =>
    request<{ job: JobListing }>(
      '/api/admin/jobs',
      { method: 'POST', body: JSON.stringify(payload) },
      adminToken
    ),

  updateApplicationStatus: (
    id: string,
    status: JobApplication['status'],
    adminToken: string
  ) =>
    request<{ application: JobApplication }>(
      `/api/admin/applications/${encodeURIComponent(id)}`,
      { method: 'PATCH', body: JSON.stringify({ status }) },
      adminToken
    ),

  updateBusinessStatus: (
    id: string,
    status: SmallBusiness['status'],
    adminToken: string
  ) =>
    request<{ business: SmallBusiness }>(
      `/api/admin/businesses/${encodeURIComponent(id)}`,
      { method: 'PATCH', body: JSON.stringify({ status }) },
      adminToken
    ),

  updateAssistanceStatus: (
    id: string,
    status: AssistanceRequest['status'],
    adminToken: string
  ) =>
    request<{ request: AssistanceRequest }>(
      `/api/admin/assistance-requests/${encodeURIComponent(id)}`,
      { method: 'PATCH', body: JSON.stringify({ status }) },
      adminToken
    ),
};
