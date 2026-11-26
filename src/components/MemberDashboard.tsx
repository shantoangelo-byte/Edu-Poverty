import { useState, type FormEvent } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client';
import type { MemberDashboardData, ServiceTab, UserProfile, UserRole } from '../types';

interface MemberDashboardProps {
  user: UserProfile | null;
  dashboard: MemberDashboardData | null;
  onAuthSuccess: (token: string, user: UserProfile) => Promise<void>;
  onDemoLogin: () => Promise<void>;
  onOpenService: (tab: ServiceTab) => void;
}

const ROLES: UserRole[] = ['Job Seeker', 'Entrepreneur', 'Farmer', 'Household'];
const STATES = [
  'Juba, Central Equatoria',
  'Yei, Central Equatoria',
  'Wau, Western Bahr el Ghazal',
  'Bor, Jonglei',
  'Malakal, Upper Nile',
  'Torit, Eastern Equatoria',
];

export function MemberDashboard({
  user,
  dashboard,
  onAuthSuccess,
  onDemoLogin,
  onOpenService,
}: MemberDashboardProps) {
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Job Seeker');
  const [location, setLocation] = useState(STATES[0]);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (authMode === 'register') {
        const res = await api.register({ fullName, email, password, role, location, phone });
        await onAuthSuccess(res.token, res.user);
      } else {
        const res = await api.login({ email, password });
        await onAuthSuccess(res.token, res.user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="max-w-[1040px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 space-y-5">
            <p className="text-xs font-medium uppercase tracking-widest text-[#57534E]">
              Member Onboarding
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#1C1917]">
              Create your livelihood workspace
            </h1>
            <p className="text-sm text-[#57534E] leading-relaxed">
              Register as a job seeker, small business entrepreneur, farmer, or household member to
              apply for verified opportunities, track business approvals, and record training
              certificates.
            </p>

            <div className="bg-white border border-[#E7E5E0] rounded-xl p-5 space-y-3">
              <p className="text-sm font-semibold text-[#1C1917]">
                Exploring the platform?
              </p>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Sign in with a pre-seeded community member profile (Amina Deng · Entrepreneur · Juba)
                to inspect live job applications, a verified micro-business, and training progress.
              </p>
              <button
                type="button"
                onClick={onDemoLogin}
                className="w-full px-4 py-2.5 text-sm font-medium text-[#14532D] bg-[#14532D]/10 rounded-lg hover:bg-[#14532D]/15 transition-colors cursor-pointer"
              >
                Continue as Sample Member
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white border border-[#E7E5E0] rounded-xl p-6 sm:p-8">
            <div className="flex items-center gap-2 p-1 bg-[#EFECE5] rounded-lg w-fit">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setError(null);
                }}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-white text-[#1C1917] shadow-xs'
                    : 'text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setError(null);
                }}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-white text-[#1C1917] shadow-xs'
                    : 'text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                Sign In
              </button>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-4 px-4 py-3 rounded-lg border border-[#B91C1C]/30 bg-[#B91C1C]/5 text-sm text-[#991B1B]"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {authMode === 'register' && (
                <>
                  <div>
                    <label htmlFor="reg-name" className="block text-xs font-medium text-[#44403C] mb-1">
                      Full Name
                    </label>
                    <input
                      id="reg-name"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g., Grace Nyandeng"
                      className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E7E5E0] rounded-lg text-sm text-[#1C1917]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="reg-role" className="block text-xs font-medium text-[#44403C] mb-1">
                        Primary Livelihood Role
                      </label>
                      <select
                        id="reg-role"
                        value={role}
                        onChange={(e) => setRole(e.target.value as UserRole)}
                        className="w-full px-3 py-2.5 bg-[#FAF8F4] border border-[#E7E5E0] rounded-lg text-sm text-[#1C1917]"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="reg-loc" className="block text-xs font-medium text-[#44403C] mb-1">
                        State & Town
                      </label>
                      <select
                        id="reg-loc"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-3 py-2.5 bg-[#FAF8F4] border border-[#E7E5E0] rounded-lg text-sm text-[#1C1917]"
                      >
                        {STATES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reg-phone" className="block text-xs font-medium text-[#44403C] mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      id="reg-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+211 9XX XXX XXX"
                      className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E7E5E0] rounded-lg text-sm text-[#1C1917]"
                    />
                  </div>
                </>
              )}

              <div>
                <label htmlFor="auth-email" className="block text-xs font-medium text-[#44403C] mb-1">
                  Email Address
                </label>
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.org"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E7E5E0] rounded-lg text-sm text-[#1C1917]"
                />
              </div>

              <div>
                <label htmlFor="auth-pass" className="block text-xs font-medium text-[#44403C] mb-1">
                  Password (minimum 6 characters)
                </label>
                <input
                  id="auth-pass"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E7E5E0] rounded-lg text-sm text-[#1C1917]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 text-sm font-medium text-white bg-[#14532D] rounded-lg hover:bg-[#166534] disabled:opacity-60 transition-colors cursor-pointer min-h-[44px]"
              >
                {loading
                  ? 'Please wait...'
                  : authMode === 'register'
                  ? 'Create Member Account'
                  : 'Sign In to Workspace'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const apps = dashboard?.applications || [];
  const businesses = dashboard?.businesses || [];
  const trainings = dashboard?.trainingEnrollments || [];
  const financeDone = dashboard?.completedFinancialLessons || [];
  const agJoins = dashboard?.agricultureJoins || [];
  const assistReqs = dashboard?.assistanceRequests || [];

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Member Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E7E5E0] pb-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-[#57534E]">
            Personal Livelihood Workspace · {user.role}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-[#1C1917]">
            {user.fullName}
          </h1>
          <p className="mt-1 text-sm text-[#57534E]">
            {user.location} · {user.email} · {user.phone}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpenService('jobs')}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#14532D] rounded-lg hover:bg-[#166534] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Browse New Opportunities
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {/* Personal Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 border border-[#E7E5E0] rounded-xl bg-white divide-y sm:divide-y-0 sm:divide-x divide-[#E7E5E0]">
        <div className="p-5">
          <p className="font-mono tabular-nums text-2xl font-semibold text-[#1C1917]">
            {apps.length}
          </p>
          <p className="mt-1 text-xs text-[#57534E]">Job Applications</p>
        </div>
        <div className="p-5">
          <p className="font-mono tabular-nums text-2xl font-semibold text-[#1C1917]">
            {businesses.length}
          </p>
          <p className="mt-1 text-xs text-[#57534E]">Registered Businesses</p>
        </div>
        <div className="p-5">
          <p className="font-mono tabular-nums text-2xl font-semibold text-[#1C1917]">
            {trainings.filter((t) => t.completed).length}
          </p>
          <p className="mt-1 text-xs text-[#57534E]">Trainings Completed</p>
        </div>
        <div className="p-5">
          <p className="font-mono tabular-nums text-2xl font-semibold text-[#1C1917]">
            {financeDone.length} / 4
          </p>
          <p className="mt-1 text-xs text-[#57534E]">Financial Lessons</p>
        </div>
        <div className="p-5">
          <p className="font-mono tabular-nums text-2xl font-semibold text-[#1C1917]">
            {agJoins.length + assistReqs.length}
          </p>
          <p className="mt-1 text-xs text-[#57534E]">Co-ops & Grants</p>
        </div>
      </div>

      {/* Two-Column Activity Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Job Applications */}
        <section className="bg-white border border-[#E7E5E0] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#1C1917]">Job Applications</h2>
            <button
              type="button"
              onClick={() => onOpenService('jobs')}
              className="text-xs font-medium text-[#14532D] hover:underline cursor-pointer"
            >
              Find Jobs
            </button>
          </div>

          {apps.length === 0 ? (
            <p className="text-sm text-[#57534E] py-4">
              You have not applied for a job yet. Explore verified listings to submit your first
              application.
            </p>
          ) : (
            <div className="divide-y divide-[#E7E5E0]">
              {apps.map((appItem) => (
                <div key={appItem.id} className="py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-[#1C1917]">{appItem.jobTitle}</h3>
                    <span
                      className={`text-xs font-medium ${
                        appItem.status === 'Accepted' || appItem.status === 'Shortlisted'
                          ? 'text-[#15803D]'
                          : 'text-[#B45309]'
                      }`}
                    >
                      {appItem.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#57534E] mt-0.5">
                    {appItem.employer} · Applied {appItem.appliedAt.slice(0, 10)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Registered Small Businesses */}
        <section className="bg-white border border-[#E7E5E0] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#1C1917]">Registered Small Businesses</h2>
            <button
              type="button"
              onClick={() => onOpenService('business')}
              className="text-xs font-medium text-[#14532D] hover:underline cursor-pointer"
            >
              Register Business
            </button>
          </div>

          {businesses.length === 0 ? (
            <p className="text-sm text-[#57534E] py-4">
              No businesses registered under your profile yet.
            </p>
          ) : (
            <div className="divide-y divide-[#E7E5E0]">
              {businesses.map((biz) => (
                <div key={biz.id} className="py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-[#1C1917]">{biz.businessName}</h3>
                    <span
                      className={`text-xs font-medium ${
                        biz.status === 'Verified' || biz.status === 'Grant Supported'
                          ? 'text-[#15803D]'
                          : 'text-[#B45309]'
                      }`}
                    >
                      {biz.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#57534E] mt-0.5">
                    {biz.sector} · {biz.location} · {biz.employeesCount} staff
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Skills & Financial Learning Progress */}
        <section className="bg-white border border-[#E7E5E0] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#1C1917]">Training & Learning Record</h2>
            <button
              type="button"
              onClick={() => onOpenService('training')}
              className="text-xs font-medium text-[#14532D] hover:underline cursor-pointer"
            >
              Browse Courses
            </button>
          </div>

          {trainings.length === 0 ? (
            <p className="text-sm text-[#57534E] py-4">
              Enroll in vocational or digital literacy courses to build your verified training record.
            </p>
          ) : (
            <div className="divide-y divide-[#E7E5E0]">
              {trainings.map((t) => (
                <div key={t.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#1C1917]">{t.courseTitle}</p>
                    <p className="text-xs text-[#57534E]">Updated {t.updatedAt.slice(0, 10)}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-[#15803D] shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                    Completed
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Cooperatives & Social Assistance */}
        <section className="bg-white border border-[#E7E5E0] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#1C1917]">
              Cooperatives & Assistance Requests
            </h2>
            <button
              type="button"
              onClick={() => onOpenService('assistance')}
              className="text-xs font-medium text-[#14532D] hover:underline cursor-pointer"
            >
              View Grants
            </button>
          </div>

          {agJoins.length === 0 && assistReqs.length === 0 ? (
            <p className="text-sm text-[#57534E] py-4">
              No cooperative memberships or assistance applications submitted yet.
            </p>
          ) : (
            <div className="divide-y divide-[#E7E5E0]">
              {assistReqs.map((r) => (
                <div key={r.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[#1C1917]">{r.programTitle}</p>
                    <span
                      className={`text-xs font-medium ${
                        r.status === 'Approved' || r.status === 'Verified Eligible'
                          ? 'text-[#15803D]'
                          : 'text-[#B45309]'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#57534E] mt-0.5">
                    Household size: {r.householdSize} · Submitted {r.submittedAt.slice(0, 10)}
                  </p>
                </div>
              ))}
              {agJoins.map((j) => (
                <div key={j.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[#1C1917]">{j.opportunityTitle}</p>
                    <span className="text-xs font-medium text-[#15803D]">Registered</span>
                  </div>
                  <p className="text-xs text-[#57534E] mt-0.5">{j.acreageNote}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
