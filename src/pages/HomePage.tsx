// import React from 'react';
import React, { useState, useEffect } from 'react';
import HeroSection from '../components/home/HeroSection';
import AnimatedStats from '../components/stats/AnimatedStats';
import {
  BookOpen, Building2, ClipboardList, Banknote,
  FileText, UserCheck, BarChart3, CheckCircle2,
  ArrowRight, ShieldCheck, Lock, Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { canFileGrievance, getDashboardPathForRole, getStaffPanelLabel, isStaffRole } from '../lib/roles';
import { useInView } from 'react-intersection-observer';

/* ─── Scroll-reveal wrapper ─────────────────────── */
const Reveal: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {

  const [ref, inView] = useInView({ threshold: 0.12, triggerOnce: false }); 
  
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(32px)',
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
};

/* ─── Section Header ────────────────────────────── */
const SectionHeader: React.FC<{ tag: string; title: string; subtitle: string; center?: boolean }> = ({
  tag, title, subtitle, center = true,
}) => (
  <div className={`mb-14 ${center ? 'text-center' : ''}`}>
    <span className="inline-block text-blue-700 font-bold uppercase tracking-widest text-[11px] bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full mb-5 shadow-sm">
      {tag}
    </span>
    <h2 className={`text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight ${center ? '' : ''}`}>
      {title}
    </h2>
    <p className={`mt-5 text-lg sm:text-xl text-slate-500 leading-relaxed ${center ? 'max-w-2xl mx-auto' : 'max-w-xl'}`}>
      {subtitle}
    </p>
  </div>
);

/* ─── Grievance Type Card ───────────────────────── */
const GCard: React.FC<{
  Icon: React.FC<{ className?: string }>;
  title: string;
  description: string;
  iconColor: string;
  iconBg: string;
  hoverBorder: string;
}> = ({ Icon, title, description, iconColor, iconBg, hoverBorder }) => (
  <div className={`group relative bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-350 overflow-hidden`}>
    <div className={`absolute top-0 left-0 right-0 h-[3px] ${hoverBorder} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl`} />
    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${iconBg} mb-6`}>
      <Icon className={`w-7 h-7 ${iconColor}`} />
    </div>
    <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3 group-hover:text-blue-700 transition-colors duration-200">{title}</h3>
    <p className="text-slate-500 text-base sm:text-lg leading-relaxed">{description}</p>
  </div>
);

/* ─── Step Card ─────────────────────────────────── */
const StepCard: React.FC<{
  n: string; title: string; description: string;
  Icon: React.FC<{ className?: string }>; gradient: string; last?: boolean;
}> = ({ n, title, description, Icon, gradient, last }) => (
  <div className="relative flex flex-col items-center text-center px-2">
    {/* Icon box */}
    <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} shadow-xl flex items-center justify-center mb-6 z-10`}>
      <Icon className="w-9 h-9 text-white" />
      <span className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-slate-900 text-white text-sm font-black flex items-center justify-center shadow-md border-2 border-white">
        {n}
      </span>
    </div>
    {/* Connector */}
    {!last && (
      <div className="hidden lg:block absolute top-10 left-[calc(50%+2.8rem)] right-0 h-px border-t-2 border-dashed border-slate-200" style={{ zIndex: 0 }} />
    )}
    <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3">{title}</h3>
    <p className="text-slate-500 text-base sm:text-lg leading-relaxed max-w-[220px] mx-auto">{description}</p>
  </div>
);

/* ─── Commitment item ───────────────────────────── */
const CommitItem: React.FC<{ Icon: React.FC<{ className?: string }>; title: string; text: string }> = ({ Icon, title, text }) => (
  <div className="flex gap-4 items-start">
    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mt-0.5">
      <Icon className="w-6 h-6 text-blue-600" />
    </div>
    <div>
      <h4 className="font-bold text-slate-800 text-lg mb-1">{title}</h4>
      <p className="text-slate-500 text-base leading-relaxed">{text}</p>
    </div>
  </div>
);

/* ─── Smooth section divider ────────────────────── */
const Divider: React.FC<{ from: string; to: string }> = ({ from, to }) => (
  <div style={{ height: 80, background: `linear-gradient(to bottom, ${from}, ${to})`, marginTop: -1, marginBottom: -1 }} />
);

/* ═══════════════════════════════════════════════ */
const HomePage: React.FC = () => {
  const { user } = useAuth();
  useEffect(() => {
      // Browser ki default scroll memory ko disable karega
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }

      // Page ko smoothly ya instantly top par bhejega
      window.scrollTo(0, 0);
    }, []);
    
  const grievances = [
    { Icon: BookOpen, title: 'Academic Issues', description: 'Problems related to courses, examinations, grading, faculty, or academic policies at GNDEC.', iconColor: 'text-blue-600', iconBg: 'bg-blue-50', hoverBorder: 'bg-blue-500' },
    { Icon: Building2, title: 'Infrastructure', description: 'Issues with classrooms, laboratories, library, hostel facilities, or other campus amenities.', iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50', hoverBorder: 'bg-emerald-500' },
    { Icon: ClipboardList, title: 'Administrative', description: 'Concerns regarding admission, registration, ID cards, certificates, or administrative procedures.', iconColor: 'text-violet-600', iconBg: 'bg-violet-50', hoverBorder: 'bg-violet-500' },
    { Icon: Banknote, title: 'Financial Matters', description: 'Problems with fees, scholarships, reimbursements, or other financial-related concerns.', iconColor: 'text-amber-600', iconBg: 'bg-amber-50', hoverBorder: 'bg-amber-500' },
  ];

  const steps = [
    { n: '1', title: 'Submit Grievance', description: 'Fill the secure digital form with details and attach supporting documents.', Icon: FileText, gradient: 'from-blue-500 to-blue-700' },
    { n: '2', title: 'Review & Assign', description: 'Grievance is reviewed and assigned to the concerned clerk or authority.', Icon: UserCheck, gradient: 'from-violet-500 to-violet-700' },
    { n: '3', title: 'Track Progress', description: 'Monitor real-time status updates through your student dashboard.', Icon: BarChart3, gradient: 'from-amber-500 to-orange-600' },
    { n: '4', title: 'Get Resolution', description: 'Receive a definitive resolution and official closure notification.', Icon: CheckCircle2, gradient: 'from-emerald-500 to-teal-600' },
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ── */}
      <HeroSection />

      {/* Smooth hero → grievances (hero ends with gradient to #f8fafc) */}

      {/* ── Grievances We Handle ── */}
      <section className="pt-12 pb-24 sm:pb-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              tag="Coverage"
              title="Grievances We Handle"
              subtitle="Our portal addresses a wide range of issues faced by students and staff across academic, infrastructural, administrative, and financial domains."
            />
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {grievances.map((g, i) => (
              <Reveal key={g.title} delay={i * 90}>
                <GCard {...g} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Smooth slate-50 → slate-950 (stats dark bg) */}
      <Divider from="#f8fafc" to="#020617" />

      {/* ── Live Statistics ── */}
      <AnimatedStats />

      {/* Smooth slate-950 → white */}
      <Divider from="#020617" to="#ffffff" />

      {/* ── How It Works ── */}
      <section className="pt-8 pb-24 sm:pb-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              tag="Redressal Workflow"
              title="How It Works"
              subtitle="A simple four-step process built for transparency, speed, and institutional accountability."
            />
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-8 relative">
            {steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 100}>
                <StepCard {...s} last={i === steps.length - 1} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Smooth white → slate-50 */}
      <Divider from="#ffffff" to="#f8fafc" />

      {/* ── Our Commitment ── */}
      <section className="pt-8 pb-24 sm:pb-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-24 items-center">

            {/* Left */}
            <Reveal>
              <SectionHeader
                tag="Our Commitment"
                title="Built on Trust & Accountability"
                subtitle="We are committed to the highest standards of confidentiality, speed, and impartiality in resolving every concern."
                center={false}
              />
              <div className="space-y-7">
                <CommitItem Icon={Lock} title="Complete Confidentiality" text="Your grievance details are handled with strict privacy protocols, accessible only to authorized personnel." />
                <CommitItem Icon={Zap} title="Timely Resolution" text="Each grievance follows a defined timeline with automated escalations to ensure no concern goes unaddressed." />
                <CommitItem Icon={ShieldCheck} title="Fair & Impartial Process" text="All grievances are evaluated objectively by designated authorities following institutional guidelines." />
              </div>
            </Reveal>

            {/* Right — Info Card */}
            <Reveal delay={140}>
              <div className="relative bg-white rounded-2xl border border-slate-200 shadow-lg p-8 sm:p-10 overflow-hidden">
                <div className="absolute top-0 left-0 bottom-0 w-1.5 rounded-l-2xl bg-gradient-to-b from-blue-500 to-blue-700" />
                <div className="pl-5">
                  <p className="text-xs uppercase tracking-widest font-bold text-blue-600 mb-3">GNDEC Grievance Cell</p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-5 leading-snug">
                    Ensuring Every Voice Is Heard
                  </h3>
                  <p className="text-slate-500 text-base sm:text-lg leading-relaxed mb-8">
                    The Grievance Redressal Cell at GNDEC operates under AICTE and Punjab Government guidelines to provide a robust, impartial, and swift resolution mechanism for all institutional stakeholders.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {[
                      { val: 'AICTE', sub: 'Compliant' },
                      { val: '100%', sub: 'Transparent' },
                      { val: 'Fair', sub: 'Impartial Review' },
                      { val: 'Secure', sub: 'Data Protection' },
                    ].map((item, i) => (
                      <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
                        <span className="block font-extrabold text-slate-800 text-xl leading-tight">{item.val}</span>
                        <span className="block text-slate-500 text-sm mt-1">{item.sub}</span>
                      </div>
                    ))}
                  </div>
                  {canFileGrievance(user?.role) ? (
                    <Link to="/file-grievance" className="group inline-flex items-center gap-2 text-blue-600 font-semibold text-base hover:text-blue-700 transition-colors">
                      Submit your grievance now
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </Link>
                  ) : isStaffRole(user?.role) ? (
                    <Link to={getDashboardPathForRole(user?.role)} className="group inline-flex items-center gap-2 text-blue-600 font-semibold text-base hover:text-blue-700 transition-colors">
                      Go to {getStaffPanelLabel(user?.role)}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </Link>
                  ) : null}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 sm:py-24 relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 55%, #2563eb 100%)',
      }}>
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.045]" style={{
          backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,1) 39px,rgba(255,255,255,1) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,1) 39px,rgba(255,255,255,1) 40px)',
        }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block text-blue-200 font-bold uppercase tracking-widest text-xs bg-white/10 border border-white/20 px-4 py-1.5 rounded-full mb-6">
            Get Started Today
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">
            Ready to Resolve Your Concern?
          </h2>
          <p className="text-blue-100 text-lg sm:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
            Join the transparent and accountable grievance redressal system at GNDEC. Submit your grievance and track its progress every step of the way.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {canFileGrievance(user?.role) ? (
              <>
                <Link to="/file-grievance" className="group inline-flex items-center justify-center gap-2.5 px-9 py-4 rounded-xl font-bold text-lg text-blue-700 bg-white hover:bg-slate-50 shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <ShieldCheck className="w-5 h-5" />
                  File a Grievance
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                </Link>
                <Link to="/how-it-works" className="inline-flex items-center justify-center gap-2 px-9 py-4 rounded-xl font-semibold text-lg text-white bg-white/10 hover:bg-white/20 border border-white/25 transition-all duration-300 hover:-translate-y-1">
                  Learn More
                </Link>
              </>
            ) : isStaffRole(user?.role) ? (
              <>
                <Link to={getDashboardPathForRole(user?.role)} className="group inline-flex items-center justify-center gap-2.5 px-9 py-4 rounded-xl font-bold text-lg text-blue-700 bg-white hover:bg-slate-50 shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <ShieldCheck className="w-5 h-5" />
                  {getStaffPanelLabel(user?.role)}
                </Link>
                <Link to="/track-grievance" className="inline-flex items-center justify-center gap-2 px-9 py-4 rounded-xl font-semibold text-lg text-white bg-white/10 hover:bg-white/20 border border-white/25 transition-all duration-300 hover:-translate-y-1">
                  Manage Grievances
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="group inline-flex items-center justify-center gap-2.5 px-9 py-4 rounded-xl font-bold text-lg text-blue-700 bg-white hover:bg-slate-50 shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <ShieldCheck className="w-5 h-5" />
                  Login to File a Grievance
                </Link>
                <Link to="/how-it-works" className="inline-flex items-center justify-center gap-2 px-9 py-4 rounded-xl font-semibold text-lg text-white bg-white/10 hover:bg-white/20 border border-white/25 transition-all duration-300 hover:-translate-y-1">
                  Learn More
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;