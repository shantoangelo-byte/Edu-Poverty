import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import type {
  AgricultureJoin,
  AgricultureOpportunity,
  AssistanceProgram,
  AssistanceRequest,
  FinancialLesson,
  ImpactMetrics,
  JobApplication,
  JobListing,
  SmallBusiness,
  TrainingCourse,
  TrainingEnrollment,
  UserProfile,
  UserRole,
} from '../types.ts';

export interface StoredUser extends UserProfile {
  passwordHash: string;
}

export interface DatabaseState {
  adminPasscodeHash: string | null;
  users: StoredUser[];
  jobs: JobListing[];
  applications: JobApplication[];
  businesses: SmallBusiness[];
  trainingCourses: TrainingCourse[];
  trainingEnrollments: TrainingEnrollment[];
  agricultureOpportunities: AgricultureOpportunity[];
  agricultureJoins: AgricultureJoin[];
  financialLessons: FinancialLesson[];
  completedFinancialLessons: { userId: string; lessonId: string; completedAt: string }[];
  assistancePrograms: AssistanceProgram[];
  assistanceRequests: AssistanceRequest[];
  baselineOffsets: {
    registeredUsers: number;
    jobOpportunities: number;
    successfulApplications: number;
    entrepreneursSupported: number;
    peopleTrained: number;
    householdsAssisted: number;
  };
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'edupoverty-db.json');

export function hashSecret(secret: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(secret, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifySecret(secret: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  if (!salt || !keyHex) return false;
  const keyBuf = Buffer.from(keyHex, 'hex');
  const derivedBuf = crypto.scryptSync(secret, salt, 64);
  if (keyBuf.length !== derivedBuf.length) return false;
  return crypto.timingSafeEqual(keyBuf, derivedBuf);
}

function createInitialSeed(): DatabaseState {
  const demoUserId = 'usr_amina_juba';
  const secondUserId = 'usr_david_wau';

  return {
    adminPasscodeHash: null,
    baselineOffsets: {
      registeredUsers: 498,
      jobOpportunities: 112,
      successfulApplications: 94,
      entrepreneursSupported: 76,
      peopleTrained: 147,
      householdsAssisted: 62,
    },
    users: [
      {
        id: demoUserId,
        fullName: 'Amina Deng',
        email: 'amina.deng@community.ss',
        role: 'Entrepreneur',
        location: 'Juba, Central Equatoria',
        phone: '+211 920 140 812',
        createdAt: '2026-10-12T08:30:00.000Z',
        passwordHash: hashSecret(crypto.randomBytes(24).toString('hex')),
      },
      {
        id: secondUserId,
        fullName: 'David Kuol',
        email: 'david.kuol@community.ss',
        role: 'Farmer',
        location: 'Wau, Western Bahr el Ghazal',
        phone: '+211 912 553 209',
        createdAt: '2026-10-18T11:15:00.000Z',
        passwordHash: hashSecret(crypto.randomBytes(24).toString('hex')),
      },
    ],
    jobs: [
      {
        id: 'job_solar_tech',
        title: 'Solar Microgrid Installation Technician',
        employer: 'Equatoria Clean Energy Co-op',
        location: 'Juba, Central Equatoria',
        sector: 'Renewable Energy',
        employmentType: 'Full-Time',
        monthlySalarySSP: 185000,
        summary:
          'Install, inspect, and maintain community solar kiosks and cold-storage battery systems across peri-urban Juba markets.',
        requirements: [
          'Basic electrical or solar wiring training',
          'Ability to travel within Central Equatoria',
          'Safety checklist compliance',
        ],
        verified: true,
        postedAt: '2026-11-18T09:00:00.000Z',
      },
      {
        id: 'job_coop_bookkeeper',
        title: 'Agricultural Cooperative Bookkeeper',
        employer: 'Bahr el Ghazal Sesame Growers Union',
        location: 'Wau, Western Bahr el Ghazal',
        sector: 'Agribusiness & Finance',
        employmentType: 'Full-Time',
        monthlySalarySSP: 160000,
        summary:
          'Maintain harvest intake ledgers, member payout records, and seasonal input loan tracking for 140 smallholder farmers.',
        requirements: [
          'Numeracy and basic ledger or spreadsheet skills',
          'Experience with VSLA or cooperative accounts',
          'Fluency in English and local languages',
        ],
        verified: true,
        postedAt: '2026-11-19T10:30:00.000Z',
      },
      {
        id: 'job_wash_assistant',
        title: 'Community Water & Sanitation Field Assistant',
        employer: 'Nile Resilience Humanitarian Partner',
        location: 'Bor, Jonglei',
        sector: 'Community Health & WASH',
        employmentType: 'Contract',
        monthlySalarySSP: 175000,
        summary:
          'Support borehole maintenance committees, water quality testing, and household hygiene awareness sessions.',
        requirements: [
          'Secondary school certificate or equivalent field experience',
          'Strong community mobilization skills',
          'Commitment to weekly field reporting',
        ],
        verified: true,
        postedAt: '2026-11-20T08:15:00.000Z',
      },
      {
        id: 'job_mobile_agent',
        title: 'Digital Financial Services & Mobile Money Agent',
        employer: 'Savannah Pay Network',
        location: 'Yei, Central Equatoria',
        sector: 'Financial Inclusion',
        employmentType: 'Full-Time',
        monthlySalarySSP: 140000,
        summary:
          'Assist market traders and households with digital savings deposits, merchant payments, and fraud-safe mobile wallet onboarding.',
        requirements: [
          'Trustworthy cash-handling record',
          'Smartphone literacy and clear communication',
          'Valid national identification',
        ],
        verified: true,
        postedAt: '2026-11-21T12:00:00.000Z',
      },
      {
        id: 'job_tailor_apprentice',
        title: 'Paid Garment & School Uniform Apprentice',
        employer: 'Konyo Konyo Women Tailoring Guild',
        location: 'Juba, Central Equatoria',
        sector: 'Vocational Trades',
        employmentType: 'Apprenticeship',
        monthlySalarySSP: 95000,
        summary:
          'Six-month paid apprenticeship producing school uniforms and protective workwear with pathway to cooperative ownership.',
        requirements: [
          'No prior formal experience required; eagerness to learn',
          'Commitment to full workshop schedule',
        ],
        verified: true,
        postedAt: '2026-11-22T07:45:00.000Z',
      },
      {
        id: 'job_logistics_clerk',
        title: 'Grain Storage & Market Logistics Clerk',
        employer: 'Upper Nile Food Security Hub',
        location: 'Malakal, Upper Nile',
        sector: 'Supply Chain',
        employmentType: 'Full-Time',
        monthlySalarySSP: 155000,
        summary:
          'Coordinate warehouse stock rotation, moisture inspections, and transport dispatch for regional grain reserves.',
        requirements: [
          'Inventory tracking experience',
          'Attention to storage hygiene and weight records',
        ],
        verified: true,
        postedAt: '2026-11-23T14:20:00.000Z',
      },
      {
        id: 'job_carpentry_lead',
        title: 'School Furniture Carpentry Artisan',
        employer: 'Torit Youth Builders Collective',
        location: 'Torit, Eastern Equatoria',
        sector: 'Construction & Trades',
        employmentType: 'Part-Time',
        monthlySalarySSP: 130000,
        summary:
          'Build durable wooden desks, benches, and storage shelving for community primary schools across Torit County.',
        requirements: [
          '2+ years practical carpentry experience',
          'Ability to mentor junior youth trainees',
        ],
        verified: true,
        postedAt: '2026-11-24T09:10:00.000Z',
      },
      {
        id: 'job_agro_extension',
        title: 'Junior Agronomy Extension Mentor',
        employer: 'Green Valley Farmers Alliance',
        location: 'Yei, Central Equatoria',
        sector: 'Agriculture',
        employmentType: 'Full-Time',
        monthlySalarySSP: 168000,
        summary:
          'Train farmer groups on drought-tolerant sorghum spacing, organic composting, and post-harvest hermetic storage.',
        requirements: [
          'Certificate in agriculture or proven field farming background',
          'Willingness to visit 5 rural payams monthly',
        ],
        verified: true,
        postedAt: '2026-11-25T11:00:00.000Z',
      },
    ],
    applications: [
      {
        id: 'app_seed_1',
        jobId: 'job_coop_bookkeeper',
        jobTitle: 'Agricultural Cooperative Bookkeeper',
        employer: 'Bahr el Ghazal Sesame Growers Union',
        userId: demoUserId,
        applicantName: 'Amina Deng',
        applicantEmail: 'amina.deng@community.ss',
        location: 'Juba, Central Equatoria',
        skillsSummary: '3 years managing retail shop ledgers and VSLA group savings records.',
        coverNote: 'Looking to support structured cooperative accounting and transparent farmer payouts.',
        status: 'Shortlisted',
        appliedAt: '2026-11-20T10:00:00.000Z',
      },
      {
        id: 'app_seed_2',
        jobId: 'job_agro_extension',
        jobTitle: 'Junior Agronomy Extension Mentor',
        employer: 'Green Valley Farmers Alliance',
        userId: secondUserId,
        applicantName: 'David Kuol',
        applicantEmail: 'david.kuol@community.ss',
        location: 'Wau, Western Bahr el Ghazal',
        skillsSummary: 'Smallholder sesame & groundnut farmer leading a 22-member cooperative.',
        coverNote: 'Experienced in post-harvest drying and peer farmer workshops.',
        status: 'Accepted',
        appliedAt: '2026-11-19T14:00:00.000Z',
      },
    ],
    businesses: [
      {
        id: 'biz_seed_1',
        ownerUserId: demoUserId,
        ownerName: 'Amina Deng',
        businessName: 'Gudele Tailoring & Dry Goods',
        sector: 'Retail & Textiles',
        location: 'Juba, Central Equatoria',
        employeesCount: 3,
        monthlyRevenueGoalSSP: 420000,
        capitalNeededSSP: 350000,
        description:
          'Neighborhood tailoring studio and staple grain store employing two young women apprentices in Gudele.',
        status: 'Verified',
        registeredAt: '2026-10-28T09:30:00.000Z',
      },
      {
        id: 'biz_seed_2',
        ownerUserId: secondUserId,
        ownerName: 'David Kuol',
        businessName: 'Wau Solar Grain Mill Co-op',
        sector: 'Agro-Processing',
        location: 'Wau, Western Bahr el Ghazal',
        employeesCount: 5,
        monthlyRevenueGoalSSP: 680000,
        capitalNeededSSP: 500000,
        description:
          'Community-owned solar-powered sorghum and maize milling service reducing processing costs for local households.',
        status: 'Grant Supported',
        registeredAt: '2026-11-04T13:20:00.000Z',
      },
      {
        id: 'biz_seed_3',
        ownerUserId: 'usr_mary_torit',
        ownerName: 'Mary Achol',
        businessName: 'Torit Fresh Bakery Collective',
        sector: 'Food Production',
        location: 'Torit, Eastern Equatoria',
        employeesCount: 4,
        monthlyRevenueGoalSSP: 390000,
        capitalNeededSSP: 280000,
        description:
          'Women-led bread and sorghum-flour pastry bakery supplying local schools and morning market vendors.',
        status: 'Verified',
        registeredAt: '2026-11-11T08:00:00.000Z',
      },
      {
        id: 'biz_seed_4',
        ownerUserId: 'usr_james_yei',
        ownerName: 'James Ladu',
        businessName: 'Yei Solar Charging & Repair Kiosk',
        sector: 'Energy & Electronics',
        location: 'Yei, Central Equatoria',
        employeesCount: 2,
        monthlyRevenueGoalSSP: 310000,
        capitalNeededSSP: 220000,
        description:
          'Off-grid phone charging, solar lantern repair, and mobile money access point for rural commuters.',
        status: 'Pending Review',
        registeredAt: '2026-11-22T15:40:00.000Z',
      },
    ],
    trainingCourses: [
      {
        id: 'trn_solar_101',
        title: 'Off-Grid Solar Wiring & Battery Maintenance',
        provider: 'Juba Technical Skills Hub',
        category: 'Vocational',
        format: 'In-Person',
        location: 'Juba, Central Equatoria',
        durationWeeks: 6,
        hoursTotal: 72,
        summary:
          'Practical hands-on training in sizing panels, wiring charge controllers, and troubleshooting community solar installations.',
        outcomes: [
          'Safe DC circuit wiring & testing',
          'Preventive battery maintenance',
          'Ready for energy technician roles',
        ],
      },
      {
        id: 'trn_digital_biz',
        title: 'Digital Literacy & Mobile Ledger Management',
        provider: 'South Sudan Youth Innovation Network',
        category: 'Digital Skills',
        format: 'Hybrid',
        location: 'National / Remote + Hubs',
        durationWeeks: 4,
        hoursTotal: 32,
        summary:
          'Learn smartphone productivity, digital record-keeping, safe mobile payments, and online job application skills.',
        outcomes: [
          'Spreadsheet & digital inventory tracking',
          'Professional CV & application writing',
          'Mobile payment fraud protection',
        ],
      },
      {
        id: 'trn_micro_ent',
        title: 'Starting & Growing a Resilient Micro-Enterprise',
        provider: 'Equatoria Women Enterprise Academy',
        category: 'Entrepreneurship',
        format: 'In-Person',
        location: 'Yei, Central Equatoria',
        durationWeeks: 5,
        hoursTotal: 40,
        summary:
          'Step-by-step guidance on pricing goods, separating household and business cash, customer retention, and supplier negotiation.',
        outcomes: [
          'Break-even & profit margin calculation',
          'One-page business growth plan',
          'Cooperative registration readiness',
        ],
      },
      {
        id: 'trn_tailoring',
        title: 'Commercial Tailoring & Pattern Making',
        provider: 'Konyo Konyo Artisans Guild',
        category: 'Trades',
        format: 'In-Person',
        location: 'Juba, Central Equatoria',
        durationWeeks: 8,
        hoursTotal: 96,
        summary:
          'Master sewing machine upkeep, school uniform cutting, quality finishing, and batch order fulfilment.',
        outcomes: [
          'Uniform & garment measurement standards',
          'Machine calibration & repair basics',
          'Direct linkage to school supply tenders',
        ],
      },
      {
        id: 'trn_agronomy',
        title: 'Climate-Resilient Post-Harvest & Storage Skills',
        provider: 'Upper Nile Agri-Extension Institute',
        category: 'Vocational',
        format: 'Offline Mobile',
        location: 'Malakal & Wau Hubs',
        durationWeeks: 3,
        hoursTotal: 24,
        summary:
          'Reduce grain spoilage using solar drying, moisture checks, and hermetic storage bags to sell at peak market prices.',
        outcomes: [
          'Cut post-harvest loss below 5%',
          'Grade sesame & sorghum for export buyers',
          'Form village grain-bulking groups',
        ],
      },
    ],
    trainingEnrollments: [
      {
        id: 'enr_seed_1',
        courseId: 'trn_micro_ent',
        courseTitle: 'Starting & Growing a Resilient Micro-Enterprise',
        userId: demoUserId,
        completed: true,
        updatedAt: '2026-11-15T16:00:00.000Z',
      },
      {
        id: 'enr_seed_2',
        courseId: 'trn_agronomy',
        courseTitle: 'Climate-Resilient Post-Harvest & Storage Skills',
        userId: secondUserId,
        completed: true,
        updatedAt: '2026-11-16T12:00:00.000Z',
      },
      {
        id: 'enr_seed_3',
        courseId: 'trn_digital_biz',
        courseTitle: 'Digital Literacy & Mobile Ledger Management',
        userId: secondUserId,
        completed: true,
        updatedAt: '2026-11-20T09:00:00.000Z',
      },
    ],
    agricultureOpportunities: [
      {
        id: 'agr_sesame_contract',
        title: '2027 White Sesame Cooperative Offtake Contract',
        cooperative: 'Wau & Tonj Producers Alliance',
        cropOrFocus: 'White Sesame',
        location: 'Wau, Western Bahr el Ghazal',
        opportunityType: 'Buyer Contract',
        priceOrGrantNote: 'Guaranteed floor price + 15% quality premium',
        summary:
          'Connects smallholder farmers directly to regional agro-processors, eliminating middleman price deductions and providing certified sacks.',
      },
      {
        id: 'agr_sorghum_seeds',
        title: 'Drought-Tolerant Sorghum & Groundnut Seed Pack',
        cooperative: 'Jonglei Resilience Farm Network',
        cropOrFocus: 'Sorghum & Groundnuts',
        location: 'Bor, Jonglei',
        opportunityType: 'Seed & Tool Support',
        priceOrGrantNote: 'Subsidized seed kit + hand tools for registered households',
        summary:
          'Provides improved short-cycle sorghum varieties and planting guidance ahead of the upcoming rainy season.',
      },
      {
        id: 'agr_irrigation',
        title: 'Solar Drip Irrigation Shared Plot Programme',
        cooperative: 'Yei River Vegetable Growers',
        cropOrFocus: 'Tomatoes, Onions & Leafy Greens',
        location: 'Yei, Central Equatoria',
        opportunityType: 'Irrigation',
        priceOrGrantNote: 'Shared pump access for 30 peri-urban youth farmers',
        summary:
          'Enables year-round dry-season vegetable harvests for reliable weekly household income in local markets.',
      },
      {
        id: 'agr_agronomy_clinic',
        title: 'Weekly Soil Fertility & Composting Field School',
        cooperative: 'Torit Farmers Cooperative',
        cropOrFocus: 'Maize & Cowpeas',
        location: 'Torit, Eastern Equatoria',
        opportunityType: 'Agronomy Training',
        priceOrGrantNote: 'Free field demonstrations every Thursday morning',
        summary:
          'Hands-on training in intercropping cowpeas with maize to boost yields naturally without costly synthetic fertilizers.',
      },
    ],
    agricultureJoins: [
      {
        id: 'agj_seed_1',
        opportunityId: 'agr_sesame_contract',
        opportunityTitle: '2027 White Sesame Cooperative Offtake Contract',
        userId: secondUserId,
        farmerName: 'David Kuol',
        location: 'Wau, Western Bahr el Ghazal',
        acreageNote: '4 acres white sesame cooperative plot',
        joinedAt: '2026-11-12T10:00:00.000Z',
      },
    ],
    financialLessons: [
      {
        id: 'fin_budgeting',
        title: 'Separating Household & Business Cash Flow',
        topic: 'Budgeting',
        durationMinutes: 15,
        summary:
          'Learn how to pay yourself a fixed weekly household allowance while protecting working capital so inventory never runs dry.',
        keyTakeaways: [
          'Keep two separate cash envelopes or mobile wallets',
          'Track daily sales before subtracting personal expenses',
          'Set aside 10% of profit for emergency restocking',
        ],
      },
      {
        id: 'fin_vsla',
        title: 'Village Savings & Loan Associations (VSLA) Guide',
        topic: 'Group Savings (VSLA)',
        durationMinutes: 20,
        summary:
          'How 15–25 community members pool weekly shares safely to fund emergency needs and micro-enterprise loans without predatory rates.',
        keyTakeaways: [
          'Transparent triple-lock cashbox & ledger governance',
          'Social fund allocation for urgent family health needs',
          'Annual share-out discipline ahead of school fees or planting',
        ],
      },
      {
        id: 'fin_credit',
        title: 'Evaluating Micro-Loans & Avoiding Debt Traps',
        topic: 'Responsible Credit',
        durationMinutes: 18,
        summary:
          'Calculate true repayment costs before borrowing and match loan timelines to real harvest or shop revenue cycles.',
        keyTakeaways: [
          'Never borrow for consumption without an income plan',
          'Verify total interest and service fees in writing',
          'Keep monthly loan payments below 25% of net profit',
        ],
      },
      {
        id: 'fin_mobile',
        title: 'Safe Mobile Money & Digital Savings Habits',
        topic: 'Mobile Money',
        durationMinutes: 12,
        summary:
          'Protect your mobile wallet PIN, verify agent receipts, and use goal-locked digital savings for school fees and tools.',
        keyTakeaways: [
          'Never share PIN codes or confirmation SMS messages',
          'Count cash before approving agent cash-out prompts',
          'Keep paper backup receipts for cooperative transfers',
        ],
      },
    ],
    completedFinancialLessons: [
      {
        userId: demoUserId,
        lessonId: 'fin_budgeting',
        completedAt: '2026-11-14T11:00:00.000Z',
      },
    ],
    assistancePrograms: [
      {
        id: 'ast_women_livelihood',
        title: 'Women Micro-Enterprise Resilience Grant',
        organization: 'South Sudan Livelihood Trust',
        category: 'Women Enterprise Fund',
        location: 'Central & Eastern Equatoria',
        supportValue: '300,000 SSP starter equipment grant',
        eligibility: 'Registered women-owned micro-businesses operating for 3+ months or completing training.',
        deadline: '2026-12-20',
      },
      {
        id: 'ast_youth_tools',
        title: 'Youth Vocational Toolkit & Apprenticeship Stipend',
        organization: 'Juba & Yei Youth Empowerment Coalition',
        category: 'Youth Scholarship',
        location: 'Juba, Yei & Torit',
        supportValue: 'Full tuition + 80,000 SSP starter tool kit',
        eligibility: 'Youth aged 18–30 enrolled in solar, carpentry, or tailoring training tracks.',
        deadline: '2026-12-31',
      },
      {
        id: 'ast_agri_resilience',
        title: 'Vulnerable Household Seed & Food Security Support',
        organization: 'Bahr el Ghazal Community Relief Network',
        category: 'Household Relief',
        location: 'Wau, Malakal & Bor',
        supportValue: 'Seasonal seed pack + 120,000 SSP cash transfer',
        eligibility: 'Food-insecure rural households with dependents or flood-affected plots.',
        deadline: '2026-12-15',
      },
      {
        id: 'ast_coop_matching',
        title: 'Cooperative Equipment Matching Grant',
        organization: 'Nile Economic Inclusion Facility',
        category: 'Livelihood Grant',
        location: 'National (All States)',
        supportValue: 'Up to 650,000 SSP matching capital (70/30)',
        eligibility: 'Verified cooperative of 3+ entrepreneurs or farmers with active ledger records.',
        deadline: '2027-01-15',
      },
    ],
    assistanceRequests: [
      {
        id: 'asr_seed_1',
        programId: 'ast_women_livelihood',
        programTitle: 'Women Micro-Enterprise Resilience Grant',
        userId: demoUserId,
        applicantName: 'Amina Deng',
        householdSize: 5,
        location: 'Juba, Central Equatoria',
        needStatement: 'Requesting two treadle sewing machines to train two additional youth apprentices.',
        status: 'Verified Eligible',
        submittedAt: '2026-11-18T15:00:00.000Z',
      },
    ],
  };
}

let cachedState: DatabaseState | null = null;

export function loadStore(): DatabaseState {
  if (cachedState) return cachedState;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      cachedState = JSON.parse(raw) as DatabaseState;
      return cachedState;
    }
  } catch {
    // Re-seed if file is missing or unreadable
  }
  cachedState = createInitialSeed();
  saveStore(cachedState);
  return cachedState;
}

export function saveStore(state: DatabaseState): void {
  cachedState = state;
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

export function computeImpactMetrics(state: DatabaseState): ImpactMetrics {
  const registeredUsers = state.baselineOffsets.registeredUsers + state.users.length;
  const jobOpportunities = state.baselineOffsets.jobOpportunities + state.jobs.length;
  const acceptedOrShortlisted = state.applications.filter(
    (a) => a.status === 'Accepted' || a.status === 'Shortlisted'
  ).length;
  const successfulApplications =
    state.baselineOffsets.successfulApplications + acceptedOrShortlisted;
  const entrepreneursSupported =
    state.baselineOffsets.entrepreneursSupported + state.businesses.length;
  const completedTrainings = state.trainingEnrollments.filter((t) => t.completed).length;
  const peopleTrained = state.baselineOffsets.peopleTrained + completedTrainings;
  const householdsAssisted =
    state.baselineOffsets.householdsAssisted + state.assistanceRequests.length;

  return {
    registeredUsers,
    jobOpportunities,
    successfulApplications,
    entrepreneursSupported,
    peopleTrained,
    householdsAssisted,
    agricultureParticipants: 64 + state.agricultureJoins.length,
    regionalBreakdown: [
      {
        state: 'Central Equatoria (Juba, Yei)',
        members: 185 + state.users.filter((u) => u.location.includes('Central Equatoria')).length,
        businesses: 34 + state.businesses.filter((b) => b.location.includes('Central Equatoria')).length,
        placements: 42 + state.applications.filter((a) => a.location.includes('Central Equatoria')).length,
      },
      {
        state: 'Western Bahr el Ghazal (Wau)',
        members: 112 + state.users.filter((u) => u.location.includes('Wau')).length,
        businesses: 19 + state.businesses.filter((b) => b.location.includes('Wau')).length,
        placements: 24 + state.applications.filter((a) => a.location.includes('Wau')).length,
      },
      {
        state: 'Jonglei (Bor)',
        members: 84 + state.users.filter((u) => u.location.includes('Bor')).length,
        businesses: 12 + state.businesses.filter((b) => b.location.includes('Bor')).length,
        placements: 14,
      },
      {
        state: 'Upper Nile (Malakal)',
        members: 68 + state.users.filter((u) => u.location.includes('Malakal')).length,
        businesses: 9 + state.businesses.filter((b) => b.location.includes('Malakal')).length,
        placements: 11,
      },
      {
        state: 'Eastern Equatoria (Torit)',
        members: 51 + state.users.filter((u) => u.location.includes('Torit')).length,
        businesses: 6 + state.businesses.filter((b) => b.location.includes('Torit')).length,
        placements: 9,
      },
    ],
    serviceDistribution: [
      { label: 'Job Opportunities & Placements', activeCount: jobOpportunities, targetCount: 150 },
      { label: 'Small Businesses Supported', activeCount: entrepreneursSupported, targetCount: 100 },
      { label: 'Skills & Vocational Training', activeCount: peopleTrained, targetCount: 200 },
      { label: 'Agricultural Cooperatives', activeCount: 64 + state.agricultureJoins.length, targetCount: 90 },
      { label: 'Social & Grant Assistance', activeCount: householdsAssisted, targetCount: 85 },
    ],
  };
}

export function sanitizeRole(role: unknown): UserRole {
  if (
    role === 'Job Seeker' ||
    role === 'Entrepreneur' ||
    role === 'Farmer' ||
    role === 'Household'
  ) {
    return role;
  }
  return 'Job Seeker';
}
