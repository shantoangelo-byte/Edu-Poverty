import { Download } from 'lucide-react';
import type { ImpactMetrics } from '../types';

interface ImpactDashboardProps {
  impact: ImpactMetrics | null;
}

export function ImpactDashboard({ impact }: ImpactDashboardProps) {
  if (!impact) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white border border-[#E7E5E0] rounded-xl p-10 text-center text-sm text-[#57534E]">
          Loading SDG 1 impact metrics...
        </div>
      </div>
    );
  }

  function handleExportCsv() {
    if (!impact) return;
    const rows = [
      ['Metric', 'Value', 'Unit / Context'],
      ['Registered Users', String(impact.registeredUsers), 'Community members across 5 states'],
      ['Job Opportunities Published', String(impact.jobOpportunities), 'Verified employer postings'],
      ['Successful Job Applications', String(impact.successfulApplications), 'Shortlisted or accepted'],
      ['Entrepreneurs Supported', String(impact.entrepreneursSupported), 'Registered micro-businesses'],
      ['People Trained', String(impact.peopleTrained), 'Completed vocational or digital courses'],
      ['Households Connected to Assistance', String(impact.householdsAssisted), 'Verified support requests'],
      [],
      ['State / Hub', 'Members', 'Businesses', 'Job Placements'],
      ...impact.regionalBreakdown.map((r) => [
        r.state,
        String(r.members),
        String(r.businesses),
        String(r.placements),
      ]),
    ];

    const csv = rows
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'edupoverty-sdg1-impact-report.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E7E5E0] pb-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-[#57534E]">
            SDG 1 Accountability & Measurement
          </p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold text-[#1C1917]">
            Community Impact Dashboard
          </h1>
          <p className="mt-2 text-sm text-[#57534E] max-w-2xl">
            Live platform outcomes combining the baseline South Sudan pilot cohort with every new
            registration, job placement, business record, training completion, and assistance
            referral.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#1C1917] bg-white border border-[#D6D3CD] rounded-lg hover:bg-[#F3F0EA] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          Download Impact CSV
        </button>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 border border-[#E7E5E0] rounded-xl bg-white divide-y sm:divide-y-0 sm:divide-x divide-[#E7E5E0]">
        <div className="p-5">
          <p className="font-mono tabular-nums text-3xl font-semibold text-[#1C1917]">
            {impact.registeredUsers}
          </p>
          <p className="mt-1 text-xs font-medium text-[#44403C]">Registered Users</p>
        </div>
        <div className="p-5">
          <p className="font-mono tabular-nums text-3xl font-semibold text-[#1C1917]">
            {impact.jobOpportunities}
          </p>
          <p className="mt-1 text-xs font-medium text-[#44403C]">Job Opportunities</p>
        </div>
        <div className="p-5">
          <p className="font-mono tabular-nums text-3xl font-semibold text-[#15803D]">
            {impact.successfulApplications}
          </p>
          <p className="mt-1 text-xs font-medium text-[#44403C]">Successful Placements</p>
        </div>
        <div className="p-5">
          <p className="font-mono tabular-nums text-3xl font-semibold text-[#1C1917]">
            {impact.entrepreneursSupported}
          </p>
          <p className="mt-1 text-xs font-medium text-[#44403C]">Entrepreneurs Supported</p>
        </div>
        <div className="p-5">
          <p className="font-mono tabular-nums text-3xl font-semibold text-[#1C1917]">
            {impact.peopleTrained}
          </p>
          <p className="mt-1 text-xs font-medium text-[#44403C]">People Trained</p>
        </div>
        <div className="p-5">
          <p className="font-mono tabular-nums text-3xl font-semibold text-[#1C1917]">
            {impact.householdsAssisted}
          </p>
          <p className="mt-1 text-xs font-medium text-[#44403C]">Households Assisted</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Progress Against Programme Targets */}
        <section className="lg:col-span-5 bg-white border border-[#E7E5E0] rounded-xl p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-[#1C1917]">Service Target Attainment</h2>
            <p className="text-xs text-[#57534E] mt-1">
              Current active volume against annual SDG 1 programme targets
            </p>
          </div>

          <div className="space-y-4">
            {impact.serviceDistribution.map((item) => {
              const pct = Math.min(100, Math.round((item.activeCount / item.targetCount) * 100));
              return (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#1C1917]">{item.label}</span>
                    <span className="font-mono tabular-nums text-[#57534E]">
                      {item.activeCount} / {item.targetCount} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#EFECE5] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#14532D] rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Regional Breakdown Table */}
        <section className="lg:col-span-7 bg-white border border-[#E7E5E0] rounded-xl overflow-hidden">
          <div className="p-6 border-b border-[#E7E5E0]">
            <h2 className="text-lg font-semibold text-[#1C1917]">Regional Reach by State Hub</h2>
            <p className="text-xs text-[#57534E] mt-1">
              Distribution of registered citizens, small businesses, and job placements
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E7E5E0] bg-[#FAF8F4] text-xs font-medium text-[#57534E]">
                  <th className="py-3 px-6">State / Regional Hub</th>
                  <th className="py-3 px-4 text-right">Members</th>
                  <th className="py-3 px-4 text-right">Businesses</th>
                  <th className="py-3 px-6 text-right">Placements</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E0] text-sm">
                {impact.regionalBreakdown.map((row) => (
                  <tr key={row.state} className="hover:bg-[#FAF8F4]/70">
                    <td className="py-3.5 px-6 font-medium text-[#1C1917]">{row.state}</td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-[#44403C]">
                      {row.members}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-[#44403C]">
                      {row.businesses}
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono tabular-nums font-medium text-[#14532D]">
                      {row.placements}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
