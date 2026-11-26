import { useEffect, useState, type FormEvent } from 'react';
import { Lock, Plus, ShieldCheck } from 'lucide-react';
import { api, type AdminOverviewResponse } from '../api/client';
import type { AssistanceRequest, JobApplication, SmallBusiness } from '../types';

interface AdminDashboardProps {
  adminToken: string | null;
  onAdminToken: (token: string | null) => void;
  onDataChanged: () => Promise<void>;
}

export function AdminDashboard({
  adminToken,
  onAdminToken,
  onDataChanged,
}: AdminDashboardProps) {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [overview, setOverview] = useState<AdminOverviewResponse | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Publish New Job Form
  const [jobTitle, setJobTitle] = useState('');
  const [jobEmployer, setJobEmployer] = useState('');
  const [jobLocation, setJobLocation] = useState('Juba, Central Equatoria');
  const [jobSector, setJobSector] = useState('Community Services');
  const [jobType, setJobType] = useState<'Full-Time' | 'Part-Time' | 'Apprenticeship' | 'Contract'>('Full-Time');
  const [jobSalary, setJobSalary] = useState('150000');
  const [jobSummary, setJobSummary] = useState('');

  useEffect(() => {
    api.getAdminStatus().then((res) => setConfigured(res.configured)).catch(() => setConfigured(true));
  }, []);

  useEffect(() => {
    if (!adminToken) {
      setOverview(null);
      return;
    }
    api
      .getAdminOverview(adminToken)
      .then(setOverview)
      .catch(() => {
        onAdminToken(null);
      });
  }, [adminToken, onAdminToken]);

  async function refreshOverview() {
    if (!adminToken) return;
    const data = await api.getAdminOverview(adminToken);
    setOverview(data);
    await onDataChanged();
  }

  async function handleAdminAuth(e: FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      const res = configured
        ? await api.loginAdmin(passcode)
        : await api.bootstrapAdmin(passcode);
      onAdminToken(res.token);
      setPasscode('');
      setConfigured(true);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleCreateJob(e: FormEvent) {
    e.preventDefault();
    if (!adminToken) return;
    try {
      await api.createAdminJob(
        {
          title: jobTitle,
          employer: jobEmployer,
          location: jobLocation,
          sector: jobSector,
          employmentType: jobType,
          monthlySalarySSP: Number(jobSalary) || 120000,
          summary: jobSummary,
          requirements: ['Verified local applicant eligibility'],
        },
        adminToken
      );
      setJobTitle('');
      setJobEmployer('');
      setJobSummary('');
      setStatusMessage('Published new verified job opportunity to the public directory.');
      await refreshOverview();
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'Could not publish job.');
    }
  }

  async function handleAppStatus(id: string, status: JobApplication['status']) {
    if (!adminToken) return;
    await api.updateApplicationStatus(id, status, adminToken);
    setStatusMessage(`Updated job application status to ${status}.`);
    await refreshOverview();
  }

  async function handleBizStatus(id: string, status: SmallBusiness['status']) {
    if (!adminToken) return;
    await api.updateBusinessStatus(id, status, adminToken);
    setStatusMessage(`Updated business verification status to ${status}.`);
    await refreshOverview();
  }

  async function handleAssistStatus(id: string, status: AssistanceRequest['status']) {
    if (!adminToken) return;
    await api.updateAssistanceStatus(id, status, adminToken);
    setStatusMessage(`Updated assistance request status to ${status}.`);
    await refreshOverview();
  }

  if (!adminToken) {
    return (
      <div className="max-w-[520px] mx-auto px-4 py-14">
        <div className="bg-white border border-[#E7E5E0] rounded-xl p-8 space-y-5">
          <div className="flex items-center gap-2.5 text-[#14532D]">
            <Lock className="w-5 h-5" aria-hidden="true" />
            <span className="text-xs font-medium uppercase tracking-widest">
              Administrator Governance
            </span>
          </div>

          {configured === false ? (
            <>
              <h1 className="font-display text-2xl font-semibold text-[#1C1917]">
                First-Run Admin Setup
              </h1>
              <p className="text-sm text-[#57534E] leading-relaxed">
                No administrator passcode has been claimed yet. Set the coordinator passcode below
                to secure opportunity verification, application reviews, and grant approvals.
              </p>
            </>
          ) : (
            <>
              <h1 className="font-display text-2xl font-semibold text-[#1C1917]">
                Coordinator Sign In
              </h1>
              <p className="text-sm text-[#57534E] leading-relaxed">
                Enter your administrator passcode to verify small businesses, shortlist job
                applicants, and publish new community opportunities.
              </p>
            </>
          )}

          {authError && (
            <div
              role="alert"
              className="px-4 py-3 rounded-lg border border-[#B91C1C]/30 bg-[#B91C1C]/5 text-sm text-[#991B1B]"
            >
              {authError}
            </div>
          )}

          <form onSubmit={handleAdminAuth} className="space-y-4">
            <div>
              <label htmlFor="admin-pass" className="block text-xs font-medium text-[#44403C] mb-1">
                {configured === false
                  ? 'Create Administrator Passcode (min 8 characters)'
                  : 'Administrator Passcode'}
              </label>
              <input
                id="admin-pass"
                type="password"
                required
                minLength={configured === false ? 8 : 1}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E7E5E0] rounded-lg text-sm text-[#1C1917]"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading || configured === null}
              className="w-full px-4 py-3 text-sm font-medium text-white bg-[#14532D] rounded-lg hover:bg-[#166534] disabled:opacity-60 transition-colors cursor-pointer"
            >
              {authLoading
                ? 'Verifying...'
                : configured === false
                ? 'Claim & Lock Admin Passcode'
                : 'Unlock Admin Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E7E5E0] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-[#14532D]">
            <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            <span>Program Governance & Accountability</span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold text-[#1C1917]">
            Admin Verification Console
          </h1>
        </div>

        <button
          type="button"
          onClick={() => onAdminToken(null)}
          className="px-4 py-2 text-sm font-medium text-[#44403C] bg-white border border-[#E7E5E0] rounded-lg hover:bg-[#F3F0EA] cursor-pointer"
        >
          Lock Admin Session
        </button>
      </div>

      {statusMessage && (
        <div
          role="status"
          className="px-4 py-3 rounded-xl border border-[#15803D]/30 bg-[#15803D]/5 text-sm text-[#14532D]"
        >
          {statusMessage}
        </div>
      )}

      {!overview ? (
        <div className="bg-white border border-[#E7E5E0] rounded-xl p-8 text-sm text-[#57534E]">
          Loading administration records...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Publish Verified Job Opportunity */}
          <section className="lg:col-span-4 bg-white border border-[#E7E5E0] rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#14532D]" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-[#1C1917]">Publish Verified Job</h2>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-3.5">
              <div>
                <label htmlFor="adm-jtitle" className="block text-xs font-medium text-[#44403C] mb-1">
                  Role Title
                </label>
                <input
                  id="adm-jtitle"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., Rural Borehole Mechanic"
                  className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E7E5E0] rounded-lg text-sm"
                />
              </div>

              <div>
                <label htmlFor="adm-jemp" className="block text-xs font-medium text-[#44403C] mb-1">
                  Employer / Partner
                </label>
                <input
                  id="adm-jemp"
                  required
                  value={jobEmployer}
                  onChange={(e) => setJobEmployer(e.target.value)}
                  placeholder="e.g., Upper Nile Water Co-op"
                  className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E7E5E0] rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="adm-jloc" className="block text-xs font-medium text-[#44403C] mb-1">
                    Location
                  </label>
                  <input
                    id="adm-jloc"
                    required
                    value={jobLocation}
                    onChange={(e) => setJobLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E7E5E0] rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="adm-jsal" className="block text-xs font-medium text-[#44403C] mb-1">
                    Salary (SSP)
                  </label>
                  <input
                    id="adm-jsal"
                    type="number"
                    min={10000}
                    step={5000}
                    value={jobSalary}
                    onChange={(e) => setJobSalary(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E7E5E0] rounded-lg text-sm font-mono tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="adm-jsec" className="block text-xs font-medium text-[#44403C] mb-1">
                    Sector
                  </label>
                  <input
                    id="adm-jsec"
                    value={jobSector}
                    onChange={(e) => setJobSector(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E7E5E0] rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="adm-jtype" className="block text-xs font-medium text-[#44403C] mb-1">
                    Type
                  </label>
                  <select
                    id="adm-jtype"
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value as typeof jobType)}
                    className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E7E5E0] rounded-lg text-sm"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Apprenticeship">Apprenticeship</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="adm-jsum" className="block text-xs font-medium text-[#44403C] mb-1">
                  Role Summary
                </label>
                <textarea
                  id="adm-jsum"
                  required
                  rows={3}
                  value={jobSummary}
                  onChange={(e) => setJobSummary(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E7E5E0] rounded-lg text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2.5 text-sm font-medium text-white bg-[#14532D] rounded-lg hover:bg-[#166534] cursor-pointer"
              >
                Publish Opportunity
              </button>
            </form>
          </section>

          {/* Review Queues */}
          <div className="lg:col-span-8 space-y-6">
            {/* Job Applications Queue */}
            <section className="bg-white border border-[#E7E5E0] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E7E5E0] flex items-center justify-between">
                <h2 className="text-base font-semibold text-[#1C1917]">
                  Job Applications ({overview.applications.length})
                </h2>
              </div>
              <div className="divide-y divide-[#E7E5E0]">
                {overview.applications.map((item) => (
                  <div
                    key={item.id}
                    className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#1C1917]">
                        {item.applicantName} · {item.jobTitle}
                      </p>
                      <p className="text-xs text-[#57534E] mt-0.5">
                        {item.employer} · {item.location}
                      </p>
                      <p className="text-xs text-[#44403C] mt-1">{item.skillsSummary}</p>
                    </div>
                    <select
                      aria-label={`Status for ${item.applicantName}`}
                      value={item.status}
                      onChange={(e) =>
                        handleAppStatus(item.id, e.target.value as JobApplication['status'])
                      }
                      className="px-3 py-1.5 bg-[#FAF8F4] border border-[#E7E5E0] rounded-lg text-xs font-medium text-[#1C1917] shrink-0"
                    >
                      <option value="Submitted">Submitted</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Accepted">Accepted</option>
                    </select>
                  </div>
                ))}
              </div>
            </section>

            {/* Small Business Verification Queue */}
            <section className="bg-white border border-[#E7E5E0] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E7E5E0]">
                <h2 className="text-base font-semibold text-[#1C1917]">
                  Small Business Registrations ({overview.businesses.length})
                </h2>
              </div>
              <div className="divide-y divide-[#E7E5E0]">
                {overview.businesses.map((biz) => (
                  <div
                    key={biz.id}
                    className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#1C1917]">{biz.businessName}</p>
                      <p className="text-xs text-[#57534E] mt-0.5">
                        {biz.ownerName} · {biz.sector} · {biz.location}
                      </p>
                    </div>
                    <select
                      aria-label={`Verification status for ${biz.businessName}`}
                      value={biz.status}
                      onChange={(e) =>
                        handleBizStatus(biz.id, e.target.value as SmallBusiness['status'])
                      }
                      className="px-3 py-1.5 bg-[#FAF8F4] border border-[#E7E5E0] rounded-lg text-xs font-medium text-[#1C1917] shrink-0"
                    >
                      <option value="Pending Review">Pending Review</option>
                      <option value="Verified">Verified</option>
                      <option value="Grant Supported">Grant Supported</option>
                    </select>
                  </div>
                ))}
              </div>
            </section>

            {/* Assistance Requests Queue */}
            <section className="bg-white border border-[#E7E5E0] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E7E5E0]">
                <h2 className="text-base font-semibold text-[#1C1917]">
                  Social Assistance Requests ({overview.assistanceRequests.length})
                </h2>
              </div>
              <div className="divide-y divide-[#E7E5E0]">
                {overview.assistanceRequests.map((req) => (
                  <div
                    key={req.id}
                    className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#1C1917]">
                        {req.applicantName} · {req.programTitle}
                      </p>
                      <p className="text-xs text-[#57534E] mt-0.5">
                        Household: {req.householdSize} · {req.location}
                      </p>
                      <p className="text-xs text-[#44403C] mt-1">{req.needStatement}</p>
                    </div>
                    <select
                      aria-label={`Eligibility status for ${req.applicantName}`}
                      value={req.status}
                      onChange={(e) =>
                        handleAssistStatus(req.id, e.target.value as AssistanceRequest['status'])
                      }
                      className="px-3 py-1.5 bg-[#FAF8F4] border border-[#E7E5E0] rounded-lg text-xs font-medium text-[#1C1917] shrink-0"
                    >
                      <option value="Submitted">Submitted</option>
                      <option value="Verified Eligible">Verified Eligible</option>
                      <option value="Approved">Approved</option>
                    </select>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
