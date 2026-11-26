import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Building2,
  Calculator,
  HandHeart,
  Sprout,
} from 'lucide-react';
import type { AppSection, ImpactMetrics, ServiceTab } from '../types';
import { SafeImage } from './SafeImage';

interface OverviewPageProps {
  impact: ImpactMetrics | null;
  onOpenService: (tab: ServiceTab) => void;
  onNavigate: (section: AppSection) => void;
}

const CHALLENGES = [
  {
    index: '01',
    title: 'Youth & Adult Unemployment',
    detail:
      'Qualified job seekers and skilled tradespeople lack a trusted, centralized bridge to verified NGO, cooperative, and private-sector employers across states.',
  },
  {
    index: '02',
    title: 'Low Household Income',
    detail:
      'Smallholder farmers and informal vendors face middleman price deductions, post-harvest losses, and fragmented access to reliable regional buyers.',
  },
  {
    index: '03',
    title: 'Limited Financial Access',
    detail:
      'Micro-entrepreneurs and vulnerable households struggle to separate working capital, build savings history, or qualify for livelihood grants.',
  },
];

const JOURNEY_STEPS = [
  {
    step: 'Step 1',
    title: 'Register Your Profile',
    description: 'Join as a Job Seeker, Entrepreneur, Farmer, or Household in under two minutes.',
  },
  {
    step: 'Step 2',
    title: 'Select a Livelihood Service',
    description: 'Navigate directly to verified jobs, business registration, training, agriculture, or grants.',
  },
  {
    step: 'Step 3',
    title: 'Receive Verified Opportunities',
    description: 'Filter listings by South Sudan state and county, inspect requirements, and plan household cash flow.',
  },
  {
    step: 'Step 4',
    title: 'Take Action & Track Outcomes',
    description: 'Apply for work, register an enterprise, complete training, and follow status updates in your workspace.',
  },
];

const ACADEMIC_PILLARS = [
  {
    number: '01',
    heading: 'Problem Identification',
    summary:
      'Grounds every workflow in South Sudan’s three structural poverty drivers: high youth underemployment, low agricultural value capture, and exclusion from formal financial services.',
  },
  {
    number: '02',
    heading: 'Digital Innovation',
    summary:
      'Replaces fragmented noticeboards and word-of-mouth referrals with a unified, low-bandwidth platform combining opportunities, financial budgeting tools, and transparent verification.',
  },
  {
    number: '03',
    heading: 'Working Implementation',
    summary:
      'Every module executes real client-server workflows: authenticated member workspaces, persistent applications, small business registration, interactive SSP budgeting, and admin governance.',
  },
  {
    number: '04',
    heading: 'Long-Term Sustainability',
    summary:
      'Designed for joint stewardship with local vocational hubs, agricultural cooperatives, and community NGOs, keeping verified listings current without heavy infrastructure overhead.',
  },
  {
    number: '05',
    heading: 'Measurable SDG 1 Impact',
    summary:
      'Tracks live registrations, successful job placements, verified micro-enterprises, training completions, and household assistance referrals across five states.',
  },
];

export function OverviewPage({ impact, onOpenService, onNavigate }: OverviewPageProps) {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Split */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 lg:pt-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-between py-2">
            <div className="space-y-6">
              <p className="text-xs font-medium uppercase tracking-widest text-[#57534E]">
                SDG 1 — No Poverty · South Sudan Economic Empowerment
              </p>

              <h1
                className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-[#1C1917] leading-[1.12]"
                style={{ textWrap: 'balance' }}
              >
                Practical pathways from poverty to dignified livelihoods
              </h1>

              <p className="text-base sm:text-lg text-[#44403C] leading-relaxed max-w-xl">
                EduPoverty connects job seekers, small business owners, smallholder farmers, and
                vulnerable households across South Sudan with verified work, vocational skills,
                agricultural buyers, financial literacy tools, and social assistance.
              </p>
            </div>

            <div className="pt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => onOpenService('jobs')}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-white bg-[#14532D] rounded-lg hover:bg-[#166534] transition-colors min-h-[44px] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14532D]"
              >
                Explore 6 Core Services
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-[#1C1917] bg-white border border-[#D6D3CD] rounded-lg hover:bg-[#F3F0EA] transition-colors min-h-[44px] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14532D]"
              >
                Open Member Workspace
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 min-h-[300px] lg:min-h-[440px]">
            <div className="h-full w-full overflow-hidden rounded-xl border border-[#E7E5E0] bg-[#EFECE5]">
              <SafeImage
                src="/src/assets/images/hero_south_sudan_community_1795682290857.jpg"
                alt="Young South Sudanese entrepreneurs and community members collaborating with laptops and notebooks in Juba"
                className="w-full h-full object-cover"
                fallbackLabel="Community Digital & Livelihood Hub — Juba"
              />
            </div>
          </div>
        </div>

        {/* 4-Column Live Impact Strip below Hero Split */}
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 border border-[#E7E5E0] rounded-xl bg-white divide-y sm:divide-y-0 sm:divide-x divide-[#E7E5E0]">
          <div className="p-6">
            <p className="font-mono tabular-nums text-3xl sm:text-4xl font-semibold text-[#1C1917]">
              {impact ? impact.registeredUsers : 500}
            </p>
            <p className="mt-1.5 text-sm font-medium text-[#44403C]">Registered Citizens</p>
            <p className="mt-0.5 text-xs text-[#78716C]">Active cohort · 5 states</p>
          </div>

          <div className="p-6">
            <p className="font-mono tabular-nums text-3xl sm:text-4xl font-semibold text-[#1C1917]">
              {impact ? impact.jobOpportunities : 120}
            </p>
            <p className="mt-1.5 text-sm font-medium text-[#44403C]">Verified Job Listings</p>
            <p className="mt-0.5 text-xs text-[#78716C]">Employer-vetted roles</p>
          </div>

          <div className="p-6">
            <p className="font-mono tabular-nums text-3xl sm:text-4xl font-semibold text-[#1C1917]">
              {impact ? impact.entrepreneursSupported : 80}
            </p>
            <p className="mt-1.5 text-sm font-medium text-[#44403C]">Entrepreneurs Supported</p>
            <p className="mt-0.5 text-xs text-[#78716C]">Registered micro-businesses</p>
          </div>

          <div className="p-6">
            <p className="font-mono tabular-nums text-3xl sm:text-4xl font-semibold text-[#1C1917]">
              {impact ? impact.peopleTrained : 150}
            </p>
            <p className="mt-1.5 text-sm font-medium text-[#44403C]">People Trained</p>
            <p className="mt-0.5 text-xs text-[#78716C]">Vocational & digital tracks</p>
          </div>
        </div>
      </section>

      {/* Problem Identification */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-[#E7E5E0] pt-14">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-widest text-[#57534E]">
              Problem Context · South Sudan
            </p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-[#1C1917]">
              Three interconnected barriers keeping families in poverty
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            {CHALLENGES.map((item) => (
              <div
                key={item.index}
                className="bg-white border border-[#E7E5E0] rounded-xl p-6 flex flex-col justify-between"
              >
                <div>
                  <span className="font-mono text-xs font-medium text-[#14532D]">
                    {item.index}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold text-[#1C1917]">{item.title}</h3>
                  <p className="mt-2.5 text-sm text-[#57534E] leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Six Core Services */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-[#E7E5E0] pt-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-widest text-[#57534E]">
                Platform Architecture
              </p>
              <h2 className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-[#1C1917]">
                Six integrated services for economic resilience
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onOpenService('jobs')}
              className="text-sm font-medium text-[#14532D] hover:underline inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Launch full service directory
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {/* Featured Visual Trio (Training, Agriculture, Small Business) */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              type="button"
              onClick={() => onOpenService('business')}
              className="group text-left bg-white border border-[#E7E5E0] rounded-xl overflow-hidden hover:border-[#14532D]/50 transition-colors cursor-pointer"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-[#EFECE5]">
                <SafeImage
                  src="/src/assets/images/service_small_business_1795682293751.jpg"
                  alt="Small business owner updating her shop ledger"
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between text-xs text-[#57534E]">
                  <span>02 · Entrepreneurship</span>
                  <Building2 className="w-4 h-4 text-[#14532D]" aria-hidden="true" />
                </div>
                <h3 className="mt-2 text-lg font-semibold text-[#1C1917]">
                  Small Business Support
                </h3>
                <p className="mt-2 text-sm text-[#57534E] leading-relaxed">
                  Register micro-enterprises, access cooperative launch guides, and unlock partner
                  capital readiness.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onOpenService('training')}
              className="group text-left bg-white border border-[#E7E5E0] rounded-xl overflow-hidden hover:border-[#14532D]/50 transition-colors cursor-pointer"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-[#EFECE5]">
                <SafeImage
                  src="/src/assets/images/service_vocational_training_1795682292000.jpg"
                  alt="Vocational solar wiring and tailoring apprentices training"
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between text-xs text-[#57534E]">
                  <span>03 · Skills Development</span>
                  <BookOpen className="w-4 h-4 text-[#14532D]" aria-hidden="true" />
                </div>
                <h3 className="mt-2 text-lg font-semibold text-[#1C1917]">
                  Vocational & Digital Training
                </h3>
                <p className="mt-2 text-sm text-[#57534E] leading-relaxed">
                  Enroll in solar installation, commercial tailoring, digital ledgers, and
                  entrepreneurship workshops.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onOpenService('agriculture')}
              className="group text-left bg-white border border-[#E7E5E0] rounded-xl overflow-hidden hover:border-[#14532D]/50 transition-colors cursor-pointer"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-[#EFECE5]">
                <SafeImage
                  src="/src/assets/images/service_agriculture_market_1795682292642.jpg"
                  alt="South Sudanese farmers examining harvested sesame and sorghum"
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between text-xs text-[#57534E]">
                  <span>04 · Rural Livelihoods</span>
                  <Sprout className="w-4 h-4 text-[#14532D]" aria-hidden="true" />
                </div>
                <h3 className="mt-2 text-lg font-semibold text-[#1C1917]">
                  Agricultural Opportunities
                </h3>
                <p className="mt-2 text-sm text-[#57534E] leading-relaxed">
                  Connect smallholder farmers directly to guaranteed crop buyer contracts, seed
                  kits, and irrigation cooperatives.
                </p>
              </div>
            </button>
          </div>

          {/* Remaining 3 Core Services */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              type="button"
              onClick={() => onOpenService('jobs')}
              className="text-left bg-white border border-[#E7E5E0] rounded-xl p-6 hover:border-[#14532D]/50 transition-colors cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-[#57534E]">
                  <span>01 · Employment Bridge</span>
                  <Briefcase className="w-4 h-4 text-[#14532D]" aria-hidden="true" />
                </div>
                <h3 className="mt-3 text-lg font-semibold text-[#1C1917]">Job Opportunities</h3>
                <p className="mt-2 text-sm text-[#57534E] leading-relaxed">
                  Browse verified roles and apprenticeships across Juba, Wau, Bor, Yei, Torit, and
                  Malakal with direct applications.
                </p>
              </div>
              <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-[#14532D]">
                Browse open positions
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </span>
            </button>

            <button
              type="button"
              onClick={() => onOpenService('finance')}
              className="text-left bg-white border border-[#E7E5E0] rounded-xl p-6 hover:border-[#14532D]/50 transition-colors cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-[#57534E]">
                  <span>05 · Financial Inclusion</span>
                  <Calculator className="w-4 h-4 text-[#14532D]" aria-hidden="true" />
                </div>
                <h3 className="mt-3 text-lg font-semibold text-[#1C1917]">Financial Education</h3>
                <p className="mt-2 text-sm text-[#57534E] leading-relaxed">
                  Plan household budgets in SSP, model Village Savings (VSLA) targets, and complete
                  money-management lessons.
                </p>
              </div>
              <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-[#14532D]">
                Open budget planner
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </span>
            </button>

            <button
              type="button"
              onClick={() => onOpenService('assistance')}
              className="text-left bg-white border border-[#E7E5E0] rounded-xl p-6 hover:border-[#14532D]/50 transition-colors cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-[#57534E]">
                  <span>06 · Social Protection</span>
                  <HandHeart className="w-4 h-4 text-[#14532D]" aria-hidden="true" />
                </div>
                <h3 className="mt-3 text-lg font-semibold text-[#1C1917]">
                  Support & Assistance
                </h3>
                <p className="mt-2 text-sm text-[#57534E] leading-relaxed">
                  Discover verified equipment grants, youth vocational scholarships, and household
                  resilience transfers.
                </p>
              </div>
              <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-[#14532D]">
                Check programme eligibility
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* User Journey & Academic Framework */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-[#E7E5E0] pt-14 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <p className="text-xs font-medium uppercase tracking-widest text-[#57534E]">
              How It Works
            </p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-[#1C1917]">
              From registration to measurable livelihood progress
            </h2>
            <p className="mt-3 text-sm text-[#57534E] leading-relaxed">
              Designed for low-friction onboarding across urban centers and rural payams, every
              step translates directly into tracked personal and community outcomes.
            </p>

            <div className="mt-8 divide-y divide-[#E7E5E0] border-t border-b border-[#E7E5E0]">
              {JOURNEY_STEPS.map((item) => (
                <div key={item.step} className="py-4 flex gap-4">
                  <span className="font-mono text-xs font-medium text-[#14532D] shrink-0 pt-0.5">
                    {item.step}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-[#1C1917]">{item.title}</h3>
                    <p className="mt-1 text-sm text-[#57534E]">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 bg-white border border-[#E7E5E0] rounded-xl p-6 sm:p-8">
            <p className="text-xs font-medium uppercase tracking-widest text-[#57534E]">
              Project Architecture & Evaluation
            </p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-[#1C1917]">
              Five pillars of impact & sustainability
            </h3>

            <div className="mt-6 divide-y divide-[#E7E5E0]">
              {ACADEMIC_PILLARS.map((pillar) => (
                <div key={pillar.number} className="py-4 first:pt-2 last:pb-0 flex gap-4">
                  <span className="font-mono text-xs font-semibold text-[#57534E] pt-0.5 shrink-0">
                    {pillar.number}
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-[#1C1917]">{pillar.heading}</h4>
                    <p className="mt-1 text-sm text-[#57534E] leading-relaxed">{pillar.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
