import crypto from 'crypto';
import dotenv from 'dotenv';
import express, { type NextFunction, type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  computeImpactMetrics,
  hashSecret,
  loadStore,
  sanitizeRole,
  saveStore,
  verifySecret,
  type StoredUser,
} from './src/server/store.ts';

dotenv.config();

const PORT = Number(process.env.PORT || 3000);
const SESSION_SIGNING_KEY = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

interface TokenPayload {
  sub: string;
  role: 'member' | 'admin';
  exp: number;
}

function signToken(payload: TokenPayload): string {
  const encoded = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');
  const sig = crypto
    .createHmac('sha256', SESSION_SIGNING_KEY)
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${sig}`;
}

function verifyToken(token: string): TokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  if (!encoded || !sig) return null;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SIGNING_KEY)
    .update(encoded)
    .digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8')) as TokenPayload;
    if (!parsed.sub || !parsed.exp || Date.now() > parsed.exp) return null;
    return parsed;
  } catch {
    return null;
  }
}

function extractBearer(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice(7).trim();
}

function publicUser(u: StoredUser) {
  return {
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    role: u.role,
    location: u.location,
    phone: u.phone,
    createdAt: u.createdAt,
  };
}

function requireMember(req: Request, res: Response, next: NextFunction): void {
  const token = extractBearer(req);
  if (!token) {
    res.status(401).json({ error: 'Please sign in to perform this action.' });
    return;
  }
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'member') {
    res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
    return;
  }
  const store = loadStore();
  const user = store.users.find((u) => u.id === payload.sub);
  if (!user) {
    res.status(401).json({ error: 'Account not found.' });
    return;
  }
  (req as Request & { memberUser?: StoredUser }).memberUser = user;
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const token = extractBearer(req);
  if (!token) {
    res.status(401).json({ error: 'Administrator authentication required.' });
    return;
  }
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'admin') {
    res.status(401).json({ error: 'Invalid or expired administrator session.' });
    return;
  }
  next();
}

function cleanStr(val: unknown, maxLen = 300): string {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLen);
}

function cleanPositiveInt(val: unknown, fallback = 0): number {
  const num = Number(val);
  if (!Number.isFinite(num) || num < 0) return fallback;
  return Math.round(num);
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // --- Public Catalog & Impact Endpoints ---
  app.get('/api/catalog', (_req, res) => {
    const store = loadStore();
    res.json({
      jobs: store.jobs,
      businesses: store.businesses.map((b) => ({ ...b })),
      trainingCourses: store.trainingCourses,
      agricultureOpportunities: store.agricultureOpportunities,
      financialLessons: store.financialLessons,
      assistancePrograms: store.assistancePrograms,
    });
  });

  app.get('/api/impact', (_req, res) => {
    const store = loadStore();
    res.json(computeImpactMetrics(store));
  });

  // --- Member Auth Endpoints ---
  app.post('/api/auth/register', (req, res) => {
    const fullName = cleanStr(req.body?.fullName, 100);
    const email = cleanStr(req.body?.email, 120).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const location = cleanStr(req.body?.location, 100) || 'Juba, Central Equatoria';
    const phone = cleanStr(req.body?.phone, 40) || 'Not provided';
    const role = sanitizeRole(req.body?.role);

    if (!fullName || !email || !email.includes('@') || password.length < 6) {
      res.status(400).json({
        error: 'Provide your full name, a valid email address, and a password of at least 6 characters.',
      });
      return;
    }

    const store = loadStore();
    if (store.users.some((u) => u.email.toLowerCase() === email)) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const newUser: StoredUser = {
      id: `usr_${crypto.randomUUID().slice(0, 8)}`,
      fullName,
      email,
      role,
      location,
      phone,
      createdAt: new Date().toISOString(),
      passwordHash: hashSecret(password),
    };

    store.users.push(newUser);
    saveStore(store);

    const token = signToken({
      sub: newUser.id,
      role: 'member',
      exp: Date.now() + 1000 * 60 * 60 * 24,
    });

    res.status(201).json({ token, user: publicUser(newUser) });
  });

  app.post('/api/auth/login', (req, res) => {
    const email = cleanStr(req.body?.email, 120).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const store = loadStore();
    const user = store.users.find((u) => u.email.toLowerCase() === email);
    if (!user || !verifySecret(password, user.passwordHash)) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = signToken({
      sub: user.id,
      role: 'member',
      exp: Date.now() + 1000 * 60 * 60 * 24,
    });

    res.json({ token, user: publicUser(user) });
  });

  app.post('/api/auth/demo', (_req, res) => {
    const store = loadStore();
    const demoUser = store.users[0];
    if (!demoUser) {
      res.status(404).json({ error: 'Sample community profile unavailable.' });
      return;
    }
    const token = signToken({
      sub: demoUser.id,
      role: 'member',
      exp: Date.now() + 1000 * 60 * 60 * 12,
    });
    res.json({ token, user: publicUser(demoUser) });
  });

  app.get('/api/member/dashboard', requireMember, (req, res) => {
    const user = (req as Request & { memberUser: StoredUser }).memberUser;
    const store = loadStore();

    res.json({
      profile: publicUser(user),
      applications: store.applications.filter((a) => a.userId === user.id),
      businesses: store.businesses.filter((b) => b.ownerUserId === user.id),
      trainingEnrollments: store.trainingEnrollments.filter((t) => t.userId === user.id),
      completedFinancialLessons: store.completedFinancialLessons
        .filter((f) => f.userId === user.id)
        .map((f) => f.lessonId),
      agricultureJoins: store.agricultureJoins.filter((j) => j.userId === user.id),
      assistanceRequests: store.assistanceRequests.filter((r) => r.userId === user.id),
    });
  });

  // --- Member Service Actions ---
  app.post('/api/jobs/:id/apply', requireMember, (req, res) => {
    const user = (req as Request & { memberUser: StoredUser }).memberUser;
    const store = loadStore();
    const job = store.jobs.find((j) => j.id === req.params.id);
    if (!job) {
      res.status(404).json({ error: 'Job listing not found.' });
      return;
    }

    const alreadyApplied = store.applications.some(
      (a) => a.jobId === job.id && a.userId === user.id
    );
    if (alreadyApplied) {
      res.status(409).json({ error: 'You have already submitted an application for this role.' });
      return;
    }

    const skillsSummary = cleanStr(req.body?.skillsSummary, 400);
    const coverNote = cleanStr(req.body?.coverNote, 600);
    if (!skillsSummary) {
      res.status(400).json({ error: 'Please provide a brief summary of your skills or experience.' });
      return;
    }

    const application = {
      id: `app_${crypto.randomUUID().slice(0, 8)}`,
      jobId: job.id,
      jobTitle: job.title,
      employer: job.employer,
      userId: user.id,
      applicantName: user.fullName,
      applicantEmail: user.email,
      location: user.location,
      skillsSummary,
      coverNote: coverNote || 'Ready to begin immediately.',
      status: 'Submitted' as const,
      appliedAt: new Date().toISOString(),
    };

    store.applications.unshift(application);
    saveStore(store);
    res.status(201).json({ application });
  });

  app.post('/api/businesses', requireMember, (req, res) => {
    const user = (req as Request & { memberUser: StoredUser }).memberUser;
    const businessName = cleanStr(req.body?.businessName, 120);
    const sector = cleanStr(req.body?.sector, 80);
    const location = cleanStr(req.body?.location, 100) || user.location;
    const employeesCount = Math.max(1, cleanPositiveInt(req.body?.employeesCount, 1));
    const monthlyRevenueGoalSSP = cleanPositiveInt(req.body?.monthlyRevenueGoalSSP, 200000);
    const capitalNeededSSP = cleanPositiveInt(req.body?.capitalNeededSSP, 150000);
    const description = cleanStr(req.body?.description, 500);

    if (!businessName || !sector || !description) {
      res.status(400).json({ error: 'Business name, sector, and description are required.' });
      return;
    }

    const store = loadStore();
    const business = {
      id: `biz_${crypto.randomUUID().slice(0, 8)}`,
      ownerUserId: user.id,
      ownerName: user.fullName,
      businessName,
      sector,
      location,
      employeesCount,
      monthlyRevenueGoalSSP,
      capitalNeededSSP,
      description,
      status: 'Pending Review' as const,
      registeredAt: new Date().toISOString(),
    };

    store.businesses.unshift(business);
    saveStore(store);
    res.status(201).json({ business });
  });

  app.post('/api/training/:id/complete', requireMember, (req, res) => {
    const user = (req as Request & { memberUser: StoredUser }).memberUser;
    const store = loadStore();
    const course = store.trainingCourses.find((c) => c.id === req.params.id);
    if (!course) {
      res.status(404).json({ error: 'Training course not found.' });
      return;
    }

    const existing = store.trainingEnrollments.find(
      (e) => e.courseId === course.id && e.userId === user.id
    );
    if (existing) {
      existing.completed = true;
      existing.updatedAt = new Date().toISOString();
      saveStore(store);
      res.json({ enrollment: existing });
      return;
    }

    const enrollment = {
      id: `enr_${crypto.randomUUID().slice(0, 8)}`,
      courseId: course.id,
      courseTitle: course.title,
      userId: user.id,
      completed: true,
      updatedAt: new Date().toISOString(),
    };

    store.trainingEnrollments.unshift(enrollment);
    saveStore(store);
    res.status(201).json({ enrollment });
  });

  app.post('/api/agriculture/:id/join', requireMember, (req, res) => {
    const user = (req as Request & { memberUser: StoredUser }).memberUser;
    const store = loadStore();
    const opp = store.agricultureOpportunities.find((o) => o.id === req.params.id);
    if (!opp) {
      res.status(404).json({ error: 'Agricultural opportunity not found.' });
      return;
    }

    if (store.agricultureJoins.some((j) => j.opportunityId === opp.id && j.userId === user.id)) {
      res.status(409).json({ error: 'You are already registered for this cooperative programme.' });
      return;
    }

    const acreageNote = cleanStr(req.body?.acreageNote, 240) || 'Smallholder cooperative member';
    const joinRecord = {
      id: `agj_${crypto.randomUUID().slice(0, 8)}`,
      opportunityId: opp.id,
      opportunityTitle: opp.title,
      userId: user.id,
      farmerName: user.fullName,
      location: user.location,
      acreageNote,
      joinedAt: new Date().toISOString(),
    };

    store.agricultureJoins.unshift(joinRecord);
    saveStore(store);
    res.status(201).json({ joinRecord });
  });

  app.post('/api/financial/:id/complete', requireMember, (req, res) => {
    const user = (req as Request & { memberUser: StoredUser }).memberUser;
    const store = loadStore();
    const lesson = store.financialLessons.find((l) => l.id === req.params.id);
    if (!lesson) {
      res.status(404).json({ error: 'Financial literacy lesson not found.' });
      return;
    }

    const exists = store.completedFinancialLessons.some(
      (c) => c.userId === user.id && c.lessonId === lesson.id
    );
    if (!exists) {
      store.completedFinancialLessons.push({
        userId: user.id,
        lessonId: lesson.id,
        completedAt: new Date().toISOString(),
      });
      saveStore(store);
    }

    res.json({ lessonId: lesson.id, completed: true });
  });

  app.post('/api/assistance/:id/apply', requireMember, (req, res) => {
    const user = (req as Request & { memberUser: StoredUser }).memberUser;
    const store = loadStore();
    const program = store.assistancePrograms.find((p) => p.id === req.params.id);
    if (!program) {
      res.status(404).json({ error: 'Assistance programme not found.' });
      return;
    }

    if (store.assistanceRequests.some((r) => r.programId === program.id && r.userId === user.id)) {
      res.status(409).json({ error: 'You have already applied to this programme.' });
      return;
    }

    const householdSize = Math.max(1, cleanPositiveInt(req.body?.householdSize, 4));
    const needStatement = cleanStr(req.body?.needStatement, 500);
    if (!needStatement) {
      res.status(400).json({ error: 'Please explain how this support will strengthen your household livelihood.' });
      return;
    }

    const requestRecord = {
      id: `asr_${crypto.randomUUID().slice(0, 8)}`,
      programId: program.id,
      programTitle: program.title,
      userId: user.id,
      applicantName: user.fullName,
      householdSize,
      location: user.location,
      needStatement,
      status: 'Submitted' as const,
      submittedAt: new Date().toISOString(),
    };

    store.assistanceRequests.unshift(requestRecord);
    saveStore(store);
    res.status(201).json({ request: requestRecord });
  });

  // --- Admin Auth & Governance Endpoints ---
  app.get('/api/admin/status', (_req, res) => {
    const envPasscode = (process.env.ADMIN_PASSCODE || '').trim();
    const store = loadStore();
    res.json({
      configured: Boolean(envPasscode) || Boolean(store.adminPasscodeHash),
      usingEnv: Boolean(envPasscode),
    });
  });

  app.post('/api/admin/bootstrap', (req, res) => {
    const envPasscode = (process.env.ADMIN_PASSCODE || '').trim();
    const store = loadStore();
    if (envPasscode || store.adminPasscodeHash) {
      res.status(403).json({ error: 'Administrator passcode has already been configured.' });
      return;
    }

    const passcode = typeof req.body?.passcode === 'string' ? req.body.passcode.trim() : '';
    if (passcode.length < 8) {
      res.status(400).json({ error: 'Choose an administrator passcode of at least 8 characters.' });
      return;
    }

    store.adminPasscodeHash = hashSecret(passcode);
    saveStore(store);

    const token = signToken({
      sub: 'admin',
      role: 'admin',
      exp: Date.now() + 1000 * 60 * 60 * 8,
    });

    res.status(201).json({ token });
  });

  app.post('/api/admin/login', (req, res) => {
    const passcode = typeof req.body?.passcode === 'string' ? req.body.passcode.trim() : '';
    if (!passcode) {
      res.status(400).json({ error: 'Passcode is required.' });
      return;
    }

    const envPasscode = (process.env.ADMIN_PASSCODE || '').trim();
    const store = loadStore();

    let valid = false;
    if (envPasscode) {
      const a = Buffer.from(passcode);
      const b = Buffer.from(envPasscode);
      valid = a.length === b.length && crypto.timingSafeEqual(a, b);
    } else if (store.adminPasscodeHash) {
      valid = verifySecret(passcode, store.adminPasscodeHash);
    } else {
      res.status(409).json({ error: 'Admin passcode is not configured yet. Complete initial setup first.' });
      return;
    }

    if (!valid) {
      res.status(401).json({ error: 'Incorrect administrator passcode.' });
      return;
    }

    const token = signToken({
      sub: 'admin',
      role: 'admin',
      exp: Date.now() + 1000 * 60 * 60 * 8,
    });

    res.json({ token });
  });

  app.get('/api/admin/overview', requireAdmin, (_req, res) => {
    const store = loadStore();
    res.json({
      users: store.users.map(publicUser),
      applications: store.applications,
      businesses: store.businesses,
      assistanceRequests: store.assistanceRequests,
      jobs: store.jobs,
      assistancePrograms: store.assistancePrograms,
      impact: computeImpactMetrics(store),
    });
  });

  app.post('/api/admin/jobs', requireAdmin, (req, res) => {
    const title = cleanStr(req.body?.title, 120);
    const employer = cleanStr(req.body?.employer, 120);
    const location = cleanStr(req.body?.location, 100);
    const sector = cleanStr(req.body?.sector, 80) || 'Community Services';
    const employmentType =
      req.body?.employmentType === 'Part-Time' ||
      req.body?.employmentType === 'Apprenticeship' ||
      req.body?.employmentType === 'Contract'
        ? req.body.employmentType
        : 'Full-Time';
    const monthlySalarySSP = Math.max(10000, cleanPositiveInt(req.body?.monthlySalarySSP, 120000));
    const summary = cleanStr(req.body?.summary, 500);
    const requirementsRaw = Array.isArray(req.body?.requirements)
      ? req.body.requirements.map((r: unknown) => cleanStr(r, 150)).filter(Boolean)
      : [];

    if (!title || !employer || !location || !summary) {
      res.status(400).json({ error: 'Title, employer, location, and summary are required.' });
      return;
    }

    const store = loadStore();
    const newJob = {
      id: `job_${crypto.randomUUID().slice(0, 8)}`,
      title,
      employer,
      location,
      sector,
      employmentType,
      monthlySalarySSP,
      summary,
      requirements: requirementsRaw.length > 0 ? requirementsRaw : ['Verified community eligibility'],
      verified: true,
      postedAt: new Date().toISOString(),
    };

    store.jobs.unshift(newJob);
    saveStore(store);
    res.status(201).json({ job: newJob });
  });

  app.patch('/api/admin/applications/:id', requireAdmin, (req, res) => {
    const status = req.body?.status;
    if (
      status !== 'Submitted' &&
      status !== 'Under Review' &&
      status !== 'Shortlisted' &&
      status !== 'Accepted'
    ) {
      res.status(400).json({ error: 'Invalid application status.' });
      return;
    }
    const store = loadStore();
    const appItem = store.applications.find((a) => a.id === req.params.id);
    if (!appItem) {
      res.status(404).json({ error: 'Application not found.' });
      return;
    }
    appItem.status = status;
    saveStore(store);
    res.json({ application: appItem });
  });

  app.patch('/api/admin/businesses/:id', requireAdmin, (req, res) => {
    const status = req.body?.status;
    if (
      status !== 'Pending Review' &&
      status !== 'Verified' &&
      status !== 'Grant Supported'
    ) {
      res.status(400).json({ error: 'Invalid business verification status.' });
      return;
    }
    const store = loadStore();
    const biz = store.businesses.find((b) => b.id === req.params.id);
    if (!biz) {
      res.status(404).json({ error: 'Business record not found.' });
      return;
    }
    biz.status = status;
    saveStore(store);
    res.json({ business: biz });
  });

  app.patch('/api/admin/assistance-requests/:id', requireAdmin, (req, res) => {
    const status = req.body?.status;
    if (status !== 'Submitted' && status !== 'Verified Eligible' && status !== 'Approved') {
      res.status(400).json({ error: 'Invalid assistance status.' });
      return;
    }
    const store = loadStore();
    const item = store.assistanceRequests.find((r) => r.id === req.params.id);
    if (!item) {
      res.status(404).json({ error: 'Assistance request not found.' });
      return;
    }
    item.status = status;
    saveStore(store);
    res.json({ request: item });
  });

  // --- Vite / Static Frontend Serving ---
  const isProd = process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve('dist'));
  if (isProd) {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduPoverty platform running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
