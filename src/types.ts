export type UserRole = 'Job Seeker' | 'Entrepreneur' | 'Farmer' | 'Household';

export type ServiceTab =
  | 'jobs'
  | 'business'
  | 'training'
  | 'agriculture'
  | 'finance'
  | 'assistance';

export type AppSection = 'overview' | 'services' | 'dashboard' | 'impact' | 'admin';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  location: string;
  phone: string;
  createdAt: string;
}

export interface JobListing {
  id: string;
  title: string;
  employer: string;
  location: string;
  sector: string;
  employmentType: 'Full-Time' | 'Part-Time' | 'Apprenticeship' | 'Contract';
  monthlySalarySSP: number;
  summary: string;
  requirements: string[];
  verified: boolean;
  postedAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  employer: string;
  userId: string;
  applicantName: string;
  applicantEmail: string;
  location: string;
  skillsSummary: string;
  coverNote: string;
  status: 'Submitted' | 'Under Review' | 'Shortlisted' | 'Accepted';
  appliedAt: string;
}

export interface SmallBusiness {
  id: string;
  ownerUserId: string;
  ownerName: string;
  businessName: string;
  sector: string;
  location: string;
  employeesCount: number;
  monthlyRevenueGoalSSP: number;
  capitalNeededSSP: number;
  description: string;
  status: 'Pending Review' | 'Verified' | 'Grant Supported';
  registeredAt: string;
}

export interface TrainingCourse {
  id: string;
  title: string;
  provider: string;
  category: 'Vocational' | 'Digital Skills' | 'Entrepreneurship' | 'Trades';
  format: 'In-Person' | 'Hybrid' | 'Offline Mobile';
  location: string;
  durationWeeks: number;
  hoursTotal: number;
  summary: string;
  outcomes: string[];
}

export interface TrainingEnrollment {
  id: string;
  courseId: string;
  courseTitle: string;
  userId: string;
  completed: boolean;
  updatedAt: string;
}

export interface AgricultureOpportunity {
  id: string;
  title: string;
  cooperative: string;
  cropOrFocus: string;
  location: string;
  opportunityType: 'Buyer Contract' | 'Seed & Tool Support' | 'Agronomy Training' | 'Irrigation';
  priceOrGrantNote: string;
  summary: string;
}

export interface AgricultureJoin {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  userId: string;
  farmerName: string;
  location: string;
  acreageNote: string;
  joinedAt: string;
}

export interface FinancialLesson {
  id: string;
  title: string;
  topic: 'Budgeting' | 'Group Savings (VSLA)' | 'Responsible Credit' | 'Mobile Money';
  durationMinutes: number;
  summary: string;
  keyTakeaways: string[];
}

export interface AssistanceProgram {
  id: string;
  title: string;
  organization: string;
  category: 'Livelihood Grant' | 'Youth Scholarship' | 'Women Enterprise Fund' | 'Household Relief';
  location: string;
  supportValue: string;
  eligibility: string;
  deadline: string;
}

export interface AssistanceRequest {
  id: string;
  programId: string;
  programTitle: string;
  userId: string;
  applicantName: string;
  householdSize: number;
  location: string;
  needStatement: string;
  status: 'Submitted' | 'Verified Eligible' | 'Approved';
  submittedAt: string;
}

export interface ImpactMetrics {
  registeredUsers: number;
  jobOpportunities: number;
  successfulApplications: number;
  entrepreneursSupported: number;
  peopleTrained: number;
  householdsAssisted: number;
  agricultureParticipants: number;
  regionalBreakdown: {
    state: string;
    members: number;
    businesses: number;
    placements: number;
  }[];
  serviceDistribution: {
    label: string;
    activeCount: number;
    targetCount: number;
  }[];
}

export interface MemberDashboardData {
  profile: UserProfile;
  applications: JobApplication[];
  businesses: SmallBusiness[];
  trainingEnrollments: TrainingEnrollment[];
  completedFinancialLessons: string[];
  agricultureJoins: AgricultureJoin[];
  assistanceRequests: AssistanceRequest[];
}
