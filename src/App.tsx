import { useCallback, useEffect, useState } from 'react';
import { api, type CatalogResponse } from './api/client';
import { AdminDashboard } from './components/AdminDashboard';
import { ImpactDashboard } from './components/ImpactDashboard';
import { MemberDashboard } from './components/MemberDashboard';
import { OverviewPage } from './components/OverviewPage';
import { ServicesHub } from './components/ServicesHub';
import { TopBar } from './components/TopBar';
import type {
  AppSection,
  ImpactMetrics,
  MemberDashboardData,
  ServiceTab,
  UserProfile,
} from './types';

export default function App() {
  const [section, setSection] = useState<AppSection>('overview');
  const [serviceTab, setServiceTab] = useState<ServiceTab>('jobs');

  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [impact, setImpact] = useState<ImpactMetrics | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [memberToken, setMemberToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [dashboard, setDashboard] = useState<MemberDashboardData | null>(null);

  const [adminToken, setAdminToken] = useState<string | null>(null);

  const loadPublicData = useCallback(async () => {
    try {
      const [catData, impData] = await Promise.all([api.getCatalog(), api.getImpact()]);
      setCatalog(catData);
      setImpact(impData);
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Unable to reach EduPoverty server.');
    }
  }, []);

  const loadMemberData = useCallback(async (token: string) => {
    try {
      const data = await api.getMemberDashboard(token);
      setDashboard(data);
      setUser(data.profile);
    } catch {
      setMemberToken(null);
      setUser(null);
      setDashboard(null);
    }
  }, []);

  useEffect(() => {
    loadPublicData();
  }, [loadPublicData]);

  const handleDataChanged = useCallback(async () => {
    await loadPublicData();
    if (memberToken) {
      await loadMemberData(memberToken);
    }
  }, [loadPublicData, loadMemberData, memberToken]);

  const handleAuthSuccess = useCallback(
    async (token: string, profile: UserProfile) => {
      setMemberToken(token);
      setUser(profile);
      await loadMemberData(token);
      await loadPublicData();
    },
    [loadMemberData, loadPublicData]
  );

  const handleDemoLogin = useCallback(async () => {
    const res = await api.demoLogin();
    await handleAuthSuccess(res.token, res.user);
  }, [handleAuthSuccess]);

  function handleNavigate(next: AppSection) {
    setSection(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleOpenService(tab: ServiceTab) {
    setServiceTab(tab);
    setSection('services');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handlePrimaryTopAction() {
    if (user) {
      setMemberToken(null);
      setUser(null);
      setDashboard(null);
      setSection('overview');
    } else {
      setSection('dashboard');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F4] text-[#1C1917]">
      <TopBar
        activeSection={section}
        onNavigate={handleNavigate}
        user={user}
        onPrimaryAction={handlePrimaryTopAction}
      />

      <main className="flex-1">
        {loadError ? (
          <div className="max-w-[720px] mx-auto px-4 py-16 text-center space-y-4">
            <h1 className="font-display text-2xl font-semibold text-[#1C1917]">
              Connecting to EduPoverty Platform
            </h1>
            <p className="text-sm text-[#57534E]">{loadError}</p>
            <button
              type="button"
              onClick={loadPublicData}
              className="px-4 py-2.5 text-sm font-medium text-white bg-[#14532D] rounded-lg hover:bg-[#166534] cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <>
            {section === 'overview' && (
              <OverviewPage
                impact={impact}
                onOpenService={handleOpenService}
                onNavigate={handleNavigate}
              />
            )}

            {section === 'services' && catalog && (
              <ServicesHub
                activeTab={serviceTab}
                onTabChange={setServiceTab}
                catalog={catalog}
                user={user}
                memberToken={memberToken}
                dashboard={dashboard}
                onDataChanged={handleDataChanged}
                onRequireAuth={() => handleNavigate('dashboard')}
                onDemoLogin={handleDemoLogin}
              />
            )}

            {section === 'dashboard' && (
              <MemberDashboard
                user={user}
                dashboard={dashboard}
                onAuthSuccess={handleAuthSuccess}
                onDemoLogin={handleDemoLogin}
                onOpenService={handleOpenService}
              />
            )}

            {section === 'impact' && <ImpactDashboard impact={impact} />}

            {section === 'admin' && (
              <AdminDashboard
                adminToken={adminToken}
                onAdminToken={setAdminToken}
                onDataChanged={handleDataChanged}
              />
            )}
          </>
        )}
      </main>

      <footer className="border-t border-[#E7E5E0] bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#57534E]">
          <div>
            <span className="font-semibold text-[#1C1917]">EduPoverty</span>
            <span className="mx-2" aria-hidden="true">
              ·
            </span>
            <span>SDG 1 Digital Economic Empowerment Platform · South Sudan</span>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={() => handleOpenService('jobs')}
              className="hover:text-[#1C1917] cursor-pointer"
            >
              Jobs
            </button>
            <button
              type="button"
              onClick={() => handleOpenService('business')}
              className="hover:text-[#1C1917] cursor-pointer"
            >
              Small Business
            </button>
            <button
              type="button"
              onClick={() => handleOpenService('training')}
              className="hover:text-[#1C1917] cursor-pointer"
            >
              Training
            </button>
            <button
              type="button"
              onClick={() => handleOpenService('finance')}
              className="hover:text-[#1C1917] cursor-pointer"
            >
              Financial Literacy
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('impact')}
              className="hover:text-[#1C1917] cursor-pointer"
            >
              Impact Report
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
