import { useMemo, useState, type FormEvent } from 'react';
import {
  CheckCircle2,
  MapPin,
  Search,
  UserCheck,
  X,
} from 'lucide-react';
import { api, type CatalogResponse } from '../api/client';
import type {
  JobListing,
  MemberDashboardData,
  ServiceTab,
  UserProfile,
} from '../types';

interface ServicesHubProps {
  activeTab: ServiceTab;
  onTabChange: (tab: ServiceTab) => void;
  catalog: CatalogResponse;
  user: UserProfile | null;
  memberToken: string | null;
  dashboard: MemberDashboardData | null;
  onDataChanged: () => Promise<void>;
  onRequireAuth: () => void;
  onDemoLogin: () => Promise<void>;
}

const SERVICE_TABS: { id: ServiceTab; label: string }[] = [
  { id: 'jobs', label: 'Job Opportunities' },
  { id: 'business', label: 'Small Business' },
  { id: 'training', label: 'Skills Training' },
  { id: 'agriculture', label: 'Agriculture' },
  { id: 'finance', label: 'Financial Literacy' },
  { id: 'assistance', label: 'Assistance' },
];

const LOCATION_FILTERS = [
  'All Locations',
  'Juba',
  'Wau',
  'Yei',
  'Torit',
  'Bor',
  'Malakal',
];

function formatSSP(amount: number): string {
  return `${amount.toLocaleString('en-US')} SSP`;
}

export function ServicesHub({
  activeTab,
  onTabChange,
  catalog,
  user,
  memberToken,
  dashboard,
  onDataChanged,
  onRequireAuth,
  onDemoLogin,
}: ServicesHubProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Job Application Modal State
  const [applyingJob, setApplyingJob] = useState<JobListing | null>(null);
  const [skillsSummary, setSkillsSummary] = useState('');
  const [coverNote, setCoverNote] = useState('');

  // Business Registration Form State
  const [bizName, setBizName] = useState('');
  const [bizSector, setBizSector] = useState('Retail & Textiles');
  const [bizLocation, setBizLocation] = useState('Juba, Central Equatoria');
  const [bizEmployees, setBizEmployees] = useState('2');
  const [bizRevenueGoal, setBizRevenueGoal] = useState('350000');
  const [bizCapital, setBizCapital] = useState('250000');
  const [bizDescription, setBizDescription] = useState('');

  // Agriculture Join Modal State
  const [joiningAgId, setJoiningAgId] = useState<string | null>(null);
  const [acreageNote, setAcreageNote] = useState('');

  // Assistance Request Modal State
  const [applyingProgramId, setApplyingProgramId] = useState<string | null>(null);
  const [householdSize, setHouseholdSize] = useState('4');
  const [needStatement, setNeedStatement] = useState('');

  // Financial Budget Planner State
  const [monthlyIncome, setMonthlyIncome] = useState(180000);
  const [foodAndHome, setFoodAndHome] = useState(85000);
  const [schoolAndHealth, setSchoolAndHealth] = useState(32000);
  const [businessReinvest, setBusinessReinvest] = useState(30000);
  const [savingsGoal, setSavingsGoal] = useState(250000);

  const budgetSummary = useMemo(() => {
    const totalExpenses = foodAndHome + schoolAndHealth + businessReinvest;
    const netSurplus = monthlyIncome - totalExpenses;
    const savingsRate = monthlyIncome > 0 ? Math.round((netSurplus / monthlyIncome) * 100) : 0;
    const monthsToGoal =
      netSurplus > 0 ? Math.ceil(savingsGoal / netSurplus) : null;
    const weeklyVslaShare = netSurplus > 0 ? Math.round((netSurplus * 0.5) / 4) : 0;
    return { totalExpenses, netSurplus, savingsRate, monthsToGoal, weeklyVslaShare };
  }, [monthlyIncome, foodAndHome, schoolAndHealth, businessReinvest, savingsGoal]);

  const appliedJobIds = useMemo(
    () => new Set((dashboard?.applications || []).map((a) => a.jobId)),
    [dashboard]
  );
  const completedTrainingIds = useMemo(
    () => new Set((dashboard?.trainingEnrollments || []).filter((t) => t.completed).map((t) => t.courseId)),
    [dashboard]
  );
  const joinedAgIds = useMemo(
    () => new Set((dashboard?.agricultureJoins || []).map((j) => j.opportunityId)),
    [dashboard]
  );
  const completedFinanceIds = useMemo(
    () => new Set(dashboard?.completedFinancialLessons || []),
    [dashboard]
  );
  const appliedProgramIds = useMemo(
    () => new Set((dashboard?.assistanceRequests || []).map((r) => r.programId)),
    [dashboard]
  );

  const matchesFilter = (textBlob: string, locationText: string) => {
    const q = searchQuery.trim().toLowerCase();
    const locOk =
      locationFilter === 'All Locations' ||
      locationText.toLowerCase().includes(locationFilter.toLowerCase()) ||
      locationText.toLowerCase().includes('national');
    const qOk = !q || textBlob.toLowerCase().includes(q) || locationText.toLowerCase().includes(q);
    return locOk && qOk;
  };

  const filteredJobs = catalog.jobs.filter((j) =>
    matchesFilter(`${j.title} ${j.employer} ${j.sector} ${j.summary}`, j.location)
  );
  const filteredBusinesses = catalog.businesses.filter((b) =>
    matchesFilter(`${b.businessName} ${b.ownerName} ${b.sector} ${b.description}`, b.location)
  );
  const filteredCourses = catalog.trainingCourses.filter((c) =>
    matchesFilter(`${c.title} ${c.provider} ${c.category} ${c.summary}`, c.location)
  );
  const filteredAg = catalog.agricultureOpportunities.filter((a) =>
    matchesFilter(`${a.title} ${a.cooperative} ${a.cropOrFocus} ${a.summary}`, a.location)
  );
  const filteredAssistance = catalog.assistancePrograms.filter((p) =>
    matchesFilter(`${p.title} ${p.organization} ${p.category} ${p.eligibility}`, p.location)
  );

  async function handleJobApply(e: FormEvent) {
    e.preventDefault();
    if (!applyingJob || !memberToken) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      await api.applyForJob(applyingJob.id, { skillsSummary, coverNote }, memberToken);
      await onDataChanged();
      setFeedback({
        type: 'success',
        text: `Application submitted for ${applyingJob.title}. Track status in My Workspace.`,
      });
      setApplyingJob(null);
      setSkillsSummary('');
      setCoverNote('');
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Unable to submit application.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBusinessSubmit(e: FormEvent) {
    e.preventDefault();
    if (!memberToken) {
      onRequireAuth();
      return;
    }
    setSubmitting(true);
    setFeedback(null);
    try {
      await api.registerBusiness(
        {
          businessName: bizName,
          sector: bizSector,
          location: bizLocation,
          employeesCount: Number(bizEmployees) || 1,
          monthlyRevenueGoalSSP: Number(bizRevenueGoal) || 200000,
          capitalNeededSSP: Number(bizCapital) || 150000,
          description: bizDescription,
        },
        memberToken
      );
      await onDataChanged();
      setFeedback({
        type: 'success',
        text: `${bizName} has been registered for community & partner verification.`,
      });
      setBizName('');
      setBizDescription('');
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Unable to register business.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCompleteTraining(courseId: string, courseTitle: string) {
    if (!memberToken) {
      onRequireAuth();
      return;
    }
    setSubmitting(true);
    setFeedback(null);
    try {
      await api.completeTraining(courseId, memberToken);
      await onDataChanged();
      setFeedback({
        type: 'success',
        text: `Marked "${courseTitle}" as completed in your training record.`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Could not update training record.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleJoinAgriculture(e: FormEvent) {
    e.preventDefault();
    if (!joiningAgId || !memberToken) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      await api.joinAgriculture(joiningAgId, { acreageNote }, memberToken);
      await onDataChanged();
      setFeedback({
        type: 'success',
        text: 'Your cooperative participation request has been recorded.',
      });
      setJoiningAgId(null);
      setAcreageNote('');
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Could not register cooperative interest.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCompleteFinanceLesson(lessonId: string, title: string) {
    if (!memberToken) {
      onRequireAuth();
      return;
    }
    setSubmitting(true);
    setFeedback(null);
    try {
      await api.completeFinancialLesson(lessonId, memberToken);
      await onDataChanged();
      setFeedback({
        type: 'success',
        text: `Completed financial module: ${title}.`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Could not record lesson completion.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAssistanceApply(e: FormEvent) {
    e.preventDefault();
    if (!applyingProgramId || !memberToken) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      await api.applyAssistance(
        applyingProgramId,
        { householdSize: Number(householdSize) || 4, needStatement },
        memberToken
      );
      await onDataChanged();
      setFeedback({
        type: 'success',
        text: 'Assistance application submitted for eligibility verification.',
      });
      setApplyingProgramId(null);
      setNeedStatement('');
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Could not submit assistance request.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Auth Reminder Banner */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[#E7E5E0] pb-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-[#57534E]">
            EduPoverty Services Directory
          </p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold text-[#1C1917]">
            Verified pathways & practical tools
          </h1>
        </div>

        {!user ? (
          <div className="flex flex-wrap items-center gap-3 bg-white border border-[#E7E5E0] rounded-xl px-4 py-3">
            <span className="text-sm text-[#44403C]">
              Sign in to apply, register a business, or save training progress.
            </span>
            <button
              type="button"
              onClick={onDemoLogin}
              className="px-3.5 py-2 text-xs font-medium text-[#14532D] bg-[#14532D]/10 rounded-lg hover:bg-[#14532D]/15 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Try Sample Account
            </button>
            <button
              type="button"
              onClick={onRequireAuth}
              className="px-3.5 py-2 text-xs font-medium text-white bg-[#14532D] rounded-lg hover:bg-[#166534] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Sign In / Register
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 text-sm text-[#44403C] bg-white border border-[#E7E5E0] rounded-xl px-4 py-2.5">
            <UserCheck className="w-4 h-4 text-[#14532D]" aria-hidden="true" />
            <span>
              Signed in as <strong className="text-[#1C1917]">{user.fullName}</strong> · {user.role}
            </span>
          </div>
        )}
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          role="status"
          className={`flex items-center justify-between gap-4 px-4 py-3 rounded-xl border text-sm ${
            feedback.type === 'success'
              ? 'bg-[#15803D]/5 border-[#15803D]/30 text-[#14532D]'
              : 'bg-[#B91C1C]/5 border-[#B91C1C]/30 text-[#991B1B]'
          }`}
        >
          <span>{feedback.text}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="p-1 hover:opacity-70 cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Segmented Service Tabs */}
      <div
        className="flex items-center gap-1.5 p-1.5 bg-[#EFECE5] rounded-xl overflow-x-auto"
        role="tablist"
        aria-label="Platform Services"
      >
        {SERVICE_TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                onTabChange(tab.id);
                setFeedback(null);
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[40px] cursor-pointer ${
                active
                  ? 'bg-white text-[#1C1917] shadow-xs'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search & Location Filter (for directory views) */}
      {activeTab !== 'finance' && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search
              className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, skill, cooperative, or sector..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E7E5E0] rounded-lg text-sm text-[#1C1917] placeholder:text-[#78716C] focus:outline-none focus:border-[#14532D]"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <MapPin className="w-4 h-4 text-[#78716C]" aria-hidden="true" />
            <label htmlFor="location-filter" className="sr-only">
              Filter by location
            </label>
            <select
              id="location-filter"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-3.5 py-2.5 bg-white border border-[#E7E5E0] rounded-lg text-sm text-[#1C1917] focus:outline-none focus:border-[#14532D] min-h-[42px]"
            >
              {LOCATION_FILTERS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* TAB 1: JOB OPPORTUNITIES */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#57534E]">
            <span>Showing {filteredJobs.length} verified roles across South Sudan</span>
            <span>Sorted by newest posting</span>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="bg-white border border-[#E7E5E0] rounded-xl p-10 text-center">
              <p className="text-sm font-medium text-[#1C1917]">No matching job opportunities</p>
              <p className="mt-1 text-sm text-[#57534E]">
                Try clearing your search filter or switching to All Locations.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredJobs.map((job) => {
                const alreadyApplied = appliedJobIds.has(job.id);
                return (
                  <article
                    key={job.id}
                    className="bg-white border border-[#E7E5E0] rounded-xl p-6 flex flex-col justify-between gap-5"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#57534E]">
                        <span>{job.sector}</span>
                        <span aria-hidden="true">·</span>
                        <span>{job.employmentType}</span>
                        <span aria-hidden="true">·</span>
                        <span>{job.location}</span>
                      </div>

                      <h2 className="mt-2 text-lg font-semibold text-[#1C1917]">{job.title}</h2>
                      <p className="text-sm font-medium text-[#44403C]">{job.employer}</p>

                      <p className="mt-3 text-sm text-[#57534E] leading-relaxed">{job.summary}</p>

                      <ul className="mt-4 space-y-1 text-xs text-[#44403C]">
                        {job.requirements.map((req) => (
                          <li key={req} className="flex items-start gap-2">
                            <span className="text-[#14532D] font-semibold" aria-hidden="true">
                              —
                            </span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-[#E7E5E0] flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs text-[#78716C]">Monthly Compensation</p>
                        <p className="font-mono tabular-nums text-sm font-semibold text-[#1C1917]">
                          {formatSSP(job.monthlySalarySSP)}
                        </p>
                      </div>

                      {alreadyApplied ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#15803D]">
                          <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                          Applied
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (!user) {
                              onRequireAuth();
                              return;
                            }
                            setApplyingJob(job);
                          }}
                          className="px-4 py-2 text-sm font-medium text-white bg-[#14532D] rounded-lg hover:bg-[#166534] transition-colors whitespace-nowrap shrink-0 min-h-[40px] cursor-pointer"
                        >
                          Apply Now
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SMALL BUSINESS SUPPORT */}
      {activeTab === 'business' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Registration Form */}
          <div className="lg:col-span-5 bg-white border border-[#E7E5E0] rounded-xl p-6">
            <p className="text-xs font-medium uppercase tracking-widest text-[#57534E]">
              Entrepreneurship Intake
            </p>
            <h2 className="mt-1.5 font-display text-2xl font-semibold text-[#1C1917]">
              Register a small business
            </h2>
            <p className="mt-2 text-sm text-[#57534E]">
              Enter your micro-enterprise details to receive verification and eligibility for
              cooperative matching grants.
            </p>

            <form onSubmit={handleBusinessSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="biz-name" className="block text-xs font-medium text-[#44403C] mb-1">
                  Business Name
                </label>
                <input
                  id="biz-name"
                  required
                  value={bizName}
                  onChange={(e) => setBizName(e.target.value)}
                  placeholder="e.g., Malakal Solar Cold Storage"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E7E5E0] rounded-lg text-sm text-[#1C1917] focus:outline-none focus:border-[#14532D]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="biz-sector" className="block text-xs font-medium text-[#44403C] mb-1">
                    Sector
                  </label>
                  <select
                    id="biz-sector"
                    value={bizSector}
                    onChange={(e) => setBizSector(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#FAF8F4] border border-[#E7E5E0] rounded-lg text-sm text-[#1C1917] focus:outline-none focus:border-[#14532D]"
                  >
                    <option value="Retail & Textiles">Retail & Textiles</option>
                    <option value="Agro-Processing">Agro-Processing</option>
                    <option value="Food Production">Food Production</option>
                    <option value="Energy & Electronics">Energy & Electronics</option>
                    <option value="Vocational Services">Vocational Services</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="biz-location" className="block text-xs font-medium text-[#44403C] mb-1">
                    Location
                  </label>
                  <input
                    id="biz-location"
                    required
                    value={bizLocation}
                    onChange={(e) => setBizLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E7E5E0] rounded-lg text-sm text-[#1C1917] focus:outline-none focus:border-[#14532D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="biz-emp" className="block text-xs font-medium text-[#44403C] mb-1">
                    Staff
                  </label>
                  <input
                    id="biz-emp"
                    type="number"
                    min="1"
                    value={bizEmployees}
                    onChange={(e) => setBizEmployees(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#FAF8F4] border border-[#E7E5E0] rounded-lg text-sm font-mono tabular-nums text-[#1C1917]"
                  />
                </div>
                <div>
                  <label htmlFor="biz-rev" className="block text-xs font-medium text-[#44403C] mb-1">
                    Monthly Goal
                  </label>
                  <input
                    id="biz-rev"
                    type="number"
                    min="10000"
                    step="10000"
                    value={bizRevenueGoal}
                    onChange={(e) => setBizRevenueGoal(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#FAF8F4] border border-[#E7E5E0] rounded-lg text-sm font-mono tabular-nums text-[#1C1917]"
                  />
                </div>
                <div>
                  <label htmlFor="biz-cap" className="block text-xs font-medium text-[#44403C] mb-1">
                    Capital Need
                  </label>
                  <input
                    id="biz-cap"
                    type="number"
                    min="0"
                    step="10000"
                    value={bizCapital}
                    onChange={(e) => setBizCapital(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#FAF8F4] border border-[#E7E5E0] rounded-lg text-sm font-mono tabular-nums text-[#1C1917]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="biz-desc" className="block text-xs font-medium text-[#44403C] mb-1">
                  Products / Services & Community Need
                </label>
                <textarea
                  id="biz-desc"
                  required
                  rows={3}
                  value={bizDescription}
                  onChange={(e) => setBizDescription(e.target.value)}
                  placeholder="Describe what your business sells, who it serves, and how support will grow household income."
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E7E5E0] rounded-lg text-sm text-[#1C1917] focus:outline-none focus:border-[#14532D]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-4 py-3 text-sm font-medium text-white bg-[#14532D] rounded-lg hover:bg-[#166534] disabled:opacity-60 transition-colors cursor-pointer min-h-[44px]"
              >
                {submitting ? 'Submitting Registration...' : 'Submit Business Registration'}
              </button>
            </form>
          </div>

          {/* Registered Small Businesses Directory */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between text-xs text-[#57534E]">
              <span>{filteredBusinesses.length} registered community enterprises</span>
              <span>Verified for partner support</span>
            </div>

            <div className="space-y-4">
              {filteredBusinesses.map((biz) => (
                <article
                  key={biz.id}
                  className="bg-white border border-[#E7E5E0] rounded-xl p-6 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="text-[#57534E]">
                      <span>{biz.sector}</span>
                      <span aria-hidden="true"> · </span>
                      <span>{biz.location}</span>
                      <span aria-hidden="true"> · </span>
                      <span>Owner: {biz.ownerName}</span>
                    </div>
                    <span
                      className={`font-medium ${
                        biz.status === 'Grant Supported' || biz.status === 'Verified'
                          ? 'text-[#15803D]'
                          : 'text-[#B45309]'
                      }`}
                    >
                      Status: {biz.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-[#1C1917]">{biz.businessName}</h3>
                  <p className="text-sm text-[#57534E] leading-relaxed">{biz.description}</p>

                  <div className="pt-3 border-t border-[#E7E5E0] grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-[#78716C] block">Local Jobs</span>
                      <span className="font-mono tabular-nums font-semibold text-[#1C1917]">
                        {biz.employeesCount} people
                      </span>
                    </div>
                    <div>
                      <span className="text-[#78716C] block">Monthly Goal</span>
                      <span className="font-mono tabular-nums font-semibold text-[#1C1917]">
                        {formatSSP(biz.monthlyRevenueGoalSSP)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#78716C] block">Capital Need</span>
                      <span className="font-mono tabular-nums font-semibold text-[#1C1917]">
                        {formatSSP(biz.capitalNeededSSP)}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SKILLS DEVELOPMENT */}
      {activeTab === 'training' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCourses.map((course) => {
            const completed = completedTrainingIds.has(course.id);
            return (
              <article
                key={course.id}
                className="bg-white border border-[#E7E5E0] rounded-xl p-6 flex flex-col justify-between gap-5"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#57534E]">
                    <span>{course.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{course.format}</span>
                    <span aria-hidden="true">·</span>
                    <span>{course.location}</span>
                  </div>
                  <h2 className="mt-2 text-lg font-semibold text-[#1C1917]">{course.title}</h2>
                  <p className="text-sm font-medium text-[#44403C]">{course.provider}</p>
                  <p className="mt-3 text-sm text-[#57534E] leading-relaxed">{course.summary}</p>

                  <ul className="mt-4 space-y-1 text-xs text-[#44403C]">
                    {course.outcomes.map((out) => (
                      <li key={out} className="flex items-start gap-2">
                        <span className="text-[#14532D] font-semibold" aria-hidden="true">
                          —
                        </span>
                        <span>{out}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-[#E7E5E0] flex items-center justify-between gap-4">
                  <div className="text-xs text-[#57534E] font-mono tabular-nums">
                    {course.durationWeeks} weeks · {course.hoursTotal} hours
                  </div>

                  {completed ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#15803D]">
                      <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                      Completed
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleCompleteTraining(course.id, course.title)}
                      className="px-4 py-2 text-sm font-medium text-white bg-[#14532D] rounded-lg hover:bg-[#166534] transition-colors whitespace-nowrap shrink-0 min-h-[40px] cursor-pointer"
                    >
                      Enroll & Complete
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* TAB 4: AGRICULTURAL OPPORTUNITIES */}
      {activeTab === 'agriculture' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAg.map((opp) => {
            const joined = joinedAgIds.has(opp.id);
            return (
              <article
                key={opp.id}
                className="bg-white border border-[#E7E5E0] rounded-xl p-6 flex flex-col justify-between gap-5"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#57534E]">
                    <span>{opp.opportunityType}</span>
                    <span aria-hidden="true">·</span>
                    <span>{opp.cropOrFocus}</span>
                    <span aria-hidden="true">·</span>
                    <span>{opp.location}</span>
                  </div>
                  <h2 className="mt-2 text-lg font-semibold text-[#1C1917]">{opp.title}</h2>
                  <p className="text-sm font-medium text-[#44403C]">{opp.cooperative}</p>
                  <p className="mt-3 text-sm text-[#57534E] leading-relaxed">{opp.summary}</p>
                </div>

                <div className="pt-4 border-t border-[#E7E5E0] flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-[#78716C]">Market / Support Terms</p>
                    <p className="text-xs font-semibold text-[#1C1917]">{opp.priceOrGrantNote}</p>
                  </div>

                  {joined ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#15803D]">
                      <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                      Joined
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (!user) {
                          onRequireAuth();
                          return;
                        }
                        setJoiningAgId(opp.id);
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-[#14532D] rounded-lg hover:bg-[#166534] transition-colors whitespace-nowrap shrink-0 min-h-[40px] cursor-pointer"
                    >
                      Join Cooperative
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* TAB 5: FINANCIAL EDUCATION */}
      {activeTab === 'finance' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Interactive Household & Micro-Business Budget Planner */}
          <div className="lg:col-span-5 bg-white border border-[#E7E5E0] rounded-xl p-6 space-y-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-[#57534E]">
                Interactive Tool · South Sudanese Pounds
              </p>
              <h2 className="mt-1.5 font-display text-2xl font-semibold text-[#1C1917]">
                Household & VSLA Budget Planner
              </h2>
              <p className="mt-2 text-sm text-[#57534E]">
                Test how separating business reinvestment and weekly Village Savings builds
                resilience against income shocks.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium text-[#44403C] mb-1">
                  <label htmlFor="fin-income">Monthly Household & Trade Income</label>
                  <span className="font-mono tabular-nums">{formatSSP(monthlyIncome)}</span>
                </div>
                <input
                  id="fin-income"
                  type="range"
                  min={50000}
                  max={600000}
                  step={10000}
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                  className="w-full accent-[#14532D]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-[#44403C] mb-1">
                  <label htmlFor="fin-food">Food, Water & Shelter Essentials</label>
                  <span className="font-mono tabular-nums">{formatSSP(foodAndHome)}</span>
                </div>
                <input
                  id="fin-food"
                  type="range"
                  min={20000}
                  max={300000}
                  step={5000}
                  value={foodAndHome}
                  onChange={(e) => setFoodAndHome(Number(e.target.value))}
                  className="w-full accent-[#14532D]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-[#44403C] mb-1">
                  <label htmlFor="fin-school">School Fees & Healthcare Reserve</label>
                  <span className="font-mono tabular-nums">{formatSSP(schoolAndHealth)}</span>
                </div>
                <input
                  id="fin-school"
                  type="range"
                  min={0}
                  max={150000}
                  step={5000}
                  value={schoolAndHealth}
                  onChange={(e) => setSchoolAndHealth(Number(e.target.value))}
                  className="w-full accent-[#14532D]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-[#44403C] mb-1">
                  <label htmlFor="fin-reinvest">Business Stock / Farm Input Reinvestment</label>
                  <span className="font-mono tabular-nums">{formatSSP(businessReinvest)}</span>
                </div>
                <input
                  id="fin-reinvest"
                  type="range"
                  min={0}
                  max={200000}
                  step={5000}
                  value={businessReinvest}
                  onChange={(e) => setBusinessReinvest(Number(e.target.value))}
                  className="w-full accent-[#14532D]"
                />
              </div>

              <div>
                <label htmlFor="fin-goal" className="block text-xs font-medium text-[#44403C] mb-1">
                  Target Emergency / Equipment Goal (SSP)
                </label>
                <input
                  id="fin-goal"
                  type="number"
                  min={50000}
                  step={10000}
                  value={savingsGoal}
                  onChange={(e) => setSavingsGoal(Math.max(10000, Number(e.target.value) || 0))}
                  className="w-full px-3.5 py-2 bg-[#FAF8F4] border border-[#E7E5E0] rounded-lg text-sm font-mono tabular-nums text-[#1C1917]"
                />
              </div>
            </div>

            {/* Live Budget Results */}
            <div className="pt-4 border-t border-[#E7E5E0] grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#78716C]">Monthly Net Savings</p>
                <p
                  className={`font-mono tabular-nums text-lg font-semibold ${
                    budgetSummary.netSurplus >= 0 ? 'text-[#15803D]' : 'text-[#B91C1C]'
                  }`}
                >
                  {formatSSP(budgetSummary.netSurplus)}
                </p>
                <p className="text-xs text-[#57534E] font-mono tabular-nums">
                  {budgetSummary.savingsRate}% of income
                </p>
              </div>
              <div>
                <p className="text-xs text-[#78716C]">Time to Goal</p>
                <p className="font-mono tabular-nums text-lg font-semibold text-[#1C1917]">
                  {budgetSummary.monthsToGoal
                    ? `${budgetSummary.monthsToGoal} months`
                    : 'Deficit'}
                </p>
                <p className="text-xs text-[#57534E] font-mono tabular-nums">
                  VSLA share: {formatSSP(budgetSummary.weeklyVslaShare)}/wk
                </p>
              </div>
            </div>
          </div>

          {/* Financial Literacy Modules */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between text-xs text-[#57534E]">
              <span>4 practical money-management guides</span>
              <span>
                {completedFinanceIds.size} of {catalog.financialLessons.length} completed
              </span>
            </div>

            {catalog.financialLessons.map((lesson) => {
              const done = completedFinanceIds.has(lesson.id);
              return (
                <article
                  key={lesson.id}
                  className="bg-white border border-[#E7E5E0] rounded-xl p-6 space-y-4"
                >
                  <div className="flex items-center justify-between gap-4 text-xs text-[#57534E]">
                    <span>
                      {lesson.topic} · {lesson.durationMinutes} min read
                    </span>
                    {done && (
                      <span className="inline-flex items-center gap-1 font-medium text-[#15803D]">
                        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                        Completed
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-[#1C1917]">{lesson.title}</h3>
                    <p className="mt-1.5 text-sm text-[#57534E] leading-relaxed">{lesson.summary}</p>
                  </div>

                  <ul className="space-y-1 text-xs text-[#44403C]">
                    {lesson.keyTakeaways.map((tip) => (
                      <li key={tip} className="flex items-start gap-2">
                        <span className="text-[#14532D] font-semibold" aria-hidden="true">
                          —
                        </span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>

                  {!done && (
                    <div className="pt-2">
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => handleCompleteFinanceLesson(lesson.id, lesson.title)}
                        className="px-4 py-2 text-xs font-medium text-[#14532D] bg-[#14532D]/10 rounded-lg hover:bg-[#14532D]/15 transition-colors cursor-pointer"
                      >
                        Mark Lesson Complete
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 6: SUPPORT & ASSISTANCE */}
      {activeTab === 'assistance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAssistance.map((program) => {
            const applied = appliedProgramIds.has(program.id);
            return (
              <article
                key={program.id}
                className="bg-white border border-[#E7E5E0] rounded-xl p-6 flex flex-col justify-between gap-5"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#57534E]">
                    <span>{program.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{program.location}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">Due {program.deadline}</span>
                  </div>
                  <h2 className="mt-2 text-lg font-semibold text-[#1C1917]">{program.title}</h2>
                  <p className="text-sm font-medium text-[#44403C]">{program.organization}</p>

                  <div className="mt-4 space-y-2 text-sm">
                    <p className="text-[#1C1917]">
                      <span className="text-xs uppercase tracking-wider text-[#78716C] block">
                        Support Provided
                      </span>
                      <span className="font-medium">{program.supportValue}</span>
                    </p>
                    <p className="text-[#57534E]">
                      <span className="text-xs uppercase tracking-wider text-[#78716C] block">
                        Eligibility Criteria
                      </span>
                      <span>{program.eligibility}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E7E5E0] flex items-center justify-end">
                  {applied ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#15803D]">
                      <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                      Request Submitted
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (!user) {
                          onRequireAuth();
                          return;
                        }
                        setApplyingProgramId(program.id);
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-[#14532D] rounded-lg hover:bg-[#166534] transition-colors whitespace-nowrap shrink-0 min-h-[40px] cursor-pointer"
                    >
                      Apply for Support
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal: Apply for Job */}
      {applyingJob && (
        <div
          className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="apply-job-title"
        >
          <div className="bg-white border border-[#E7E5E0] rounded-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-[#57534E]">{applyingJob.employer}</p>
                <h3 id="apply-job-title" className="text-lg font-semibold text-[#1C1917]">
                  Apply: {applyingJob.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setApplyingJob(null)}
                className="p-1.5 rounded-lg hover:bg-[#F3F0EA] cursor-pointer"
                aria-label="Close application form"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleJobApply} className="space-y-4">
              <div>
                <label htmlFor="job-skills" className="block text-xs font-medium text-[#44403C] mb-1">
                  Relevant Skills & Experience
                </label>
                <textarea
                  id="job-skills"
                  required
                  rows={3}
                  value={skillsSummary}
                  onChange={(e) => setSkillsSummary(e.target.value)}
                  placeholder="Summarize your practical experience, training certificates, or previous roles."
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E7E5E0] rounded-lg text-sm text-[#1C1917]"
                />
              </div>

              <div>
                <label htmlFor="job-cover" className="block text-xs font-medium text-[#44403C] mb-1">
                  Availability & Note to Employer
                </label>
                <textarea
                  id="job-cover"
                  rows={2}
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  placeholder="Share when you can start or any community references."
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E7E5E0] rounded-lg text-sm text-[#1C1917]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setApplyingJob(null)}
                  className="px-4 py-2 text-sm font-medium text-[#44403C] border border-[#E7E5E0] rounded-lg hover:bg-[#FAF8F4] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#14532D] rounded-lg hover:bg-[#166534] disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Join Agriculture Cooperative */}
      {joiningAgId && (
        <div
          className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="join-ag-title"
        >
          <div className="bg-white border border-[#E7E5E0] rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <h3 id="join-ag-title" className="text-lg font-semibold text-[#1C1917]">
                Join Cooperative Programme
              </h3>
              <button
                type="button"
                onClick={() => setJoiningAgId(null)}
                className="p-1.5 rounded-lg hover:bg-[#F3F0EA] cursor-pointer"
                aria-label="Close cooperative modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleJoinAgriculture} className="space-y-4">
              <div>
                <label htmlFor="ag-acreage" className="block text-xs font-medium text-[#44403C] mb-1">
                  Farm Plot / Crop Details
                </label>
                <textarea
                  id="ag-acreage"
                  required
                  rows={3}
                  value={acreageNote}
                  onChange={(e) => setAcreageNote(e.target.value)}
                  placeholder="e.g., 3 acres in Yei cultivating sorghum and groundnuts."
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E7E5E0] rounded-lg text-sm text-[#1C1917]"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setJoiningAgId(null)}
                  className="px-4 py-2 text-sm font-medium text-[#44403C] border border-[#E7E5E0] rounded-lg hover:bg-[#FAF8F4] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#14532D] rounded-lg hover:bg-[#166534] cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Confirm Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Apply for Assistance */}
      {applyingProgramId && (
        <div
          className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="apply-assist-title"
        >
          <div className="bg-white border border-[#E7E5E0] rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <h3 id="apply-assist-title" className="text-lg font-semibold text-[#1C1917]">
                Submit Support & Grant Application
              </h3>
              <button
                type="button"
                onClick={() => setApplyingProgramId(null)}
                className="p-1.5 rounded-lg hover:bg-[#F3F0EA] cursor-pointer"
                aria-label="Close assistance modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssistanceApply} className="space-y-4">
              <div>
                <label htmlFor="assist-size" className="block text-xs font-medium text-[#44403C] mb-1">
                  Household Dependents Count
                </label>
                <input
                  id="assist-size"
                  type="number"
                  min={1}
                  max={30}
                  value={householdSize}
                  onChange={(e) => setHouseholdSize(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E7E5E0] rounded-lg text-sm font-mono tabular-nums text-[#1C1917]"
                />
              </div>

              <div>
                <label htmlFor="assist-need" className="block text-xs font-medium text-[#44403C] mb-1">
                  How this support improves your livelihood
                </label>
                <textarea
                  id="assist-need"
                  required
                  rows={3}
                  value={needStatement}
                  onChange={(e) => setNeedStatement(e.target.value)}
                  placeholder="Describe your household situation, training, or business plan."
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E7E5E0] rounded-lg text-sm text-[#1C1917]"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setApplyingProgramId(null)}
                  className="px-4 py-2 text-sm font-medium text-[#44403C] border border-[#E7E5E0] rounded-lg hover:bg-[#FAF8F4] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#14532D] rounded-lg hover:bg-[#166534] cursor-pointer"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
