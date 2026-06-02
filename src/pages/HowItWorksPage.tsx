import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Send,
  ChevronRight,
  Clock,
  User,
  BarChart3,
  CheckCircle2,
  Building2,
  Shield,
  Scale,
  Eye,
  MessageSquare,
  ArrowRight,
  HelpCircle,
  Mail,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import {
  canFileGrievance,
  getDashboardPathForRole,
  getStaffPanelLabel,
  isStaffRole,
} from '../lib/roles';

const HowItWorksPage: React.FC = () => {
  const { user } = useAuth();
  const isStaff = isStaffRole(user?.role);
  const showFileCta = canFileGrievance(user?.role);
  const dashboardPath = getDashboardPathForRole(user?.role);

  const steps = [
    {
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50 border-blue-100',
      title: 'Submission of Grievance',
      description:
        'The student submits a grievance through the portal with a clear title, detailed description, category, and supporting documents where applicable.',
    },
    {
      icon: Send,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-100',
      title: 'Acknowledgement & Registration',
      description:
        'Each grievance is registered with a unique reference ID. An acknowledgement is issued to confirm receipt and enable tracking.',
    },
    {
      icon: User,
      color: 'text-violet-600',
      bg: 'bg-violet-50 border-violet-100',
      title: 'Review & Assignment',
      description:
        'The grievance is reviewed by the Grievance Redressal Cell. It is assigned to the concerned Clerk or authority based on the nature of the matter.',
    },
    {
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-100',
      title: 'Processing & Follow-up',
      description:
        'Authorized personnel examine the case, update the status at each stage, and issue official responses. Complex matters may require additional review time.',
    },
    {
      icon: BarChart3,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 border-indigo-100',
      title: 'Status Monitoring',
      description:
        'Students may track grievance status in real time through their dashboard. Reminders may be sent in accordance with portal guidelines.',
    },
    {
      icon: CheckCircle2,
      color: 'text-teal-600',
      bg: 'bg-teal-50 border-teal-100',
      title: 'Resolution & Closure',
      description:
        'Upon resolution, the student is notified through the portal. The matter is marked resolved or rejected with documented official responses on record.',
    },
  ];

  const principles = [
    {
      icon: Scale,
      title: 'Impartial & Fair',
      text: 'Every grievance is examined objectively, without bias, in accordance with institutional policy.',
    },
    {
      icon: Eye,
      title: 'Transparent Process',
      text: 'Status updates and official responses are recorded and visible to authorized parties at each stage.',
    },
    {
      icon: Shield,
      title: 'Confidential Handling',
      text: 'Grievance details are accessible only to the student and authorized institutional personnel.',
    },
    {
      icon: Clock,
      title: 'Timely Redressal',
      text: 'Cases are processed expeditiously, with standard resolution targeted within seven working days where feasible.',
    },
  ];

  const roleCards = [
    {
      role: 'Student',
      accent: 'border-blue-200 bg-blue-50/80',
      titleColor: 'text-blue-900',
      textColor: 'text-blue-800',
      duties: [
        'Submit grievances with complete and accurate information',
        'Attach supporting documents where necessary',
        'Track status through the personal dashboard',
        'Review official responses from the redressal cell',
      ],
    },
    {
      role: 'Clerk',
      accent: 'border-emerald-200 bg-emerald-50/80',
      titleColor: 'text-emerald-900',
      textColor: 'text-emerald-800',
      duties: [
        'Review all grievances registered in the system',
        'Verify details and update grievance status',
        'Issue official responses to students',
        'Ensure timely forwarding of unresolved matters',
      ],
    },
    {
      role: 'Admin',
      accent: 'border-violet-200 bg-violet-50/80',
      titleColor: 'text-violet-900',
      textColor: 'text-violet-800',
      duties: [
        'Oversee grievance correspondence and communications',
        'Monitor institutional grievance workflow',
        'Coordinate with clerks and DSW on complex cases',
        'Maintain records for audit and compliance',
      ],
    },
    {
      role: 'DSW',
      accent: 'border-amber-200 bg-amber-50/80',
      titleColor: 'text-amber-900',
      textColor: 'text-amber-800',
      duties: [
        'Supervise grievances requiring Dean-level attention',
        'Categorize and forward matters to appropriate authorities',
        'Intervene in escalated or unresolved cases',
        'Recommend policy-level improvements where needed',
      ],
    },
  ];

  const faqs = [
    {
      question: 'What is the expected time frame for grievance resolution?',
      answer:
        'Standard grievances are typically addressed within seven working days. Cases requiring inter-departmental coordination or detailed investigation may take longer, during which the student will receive status updates through the portal.',
    },
    {
      question: 'Who is eligible to file a grievance through this portal?',
      answer:
        'The grievance filing facility is available to registered students of Guru Nanak Dev Engineering College, Ludhiana. Institutional staff (Clerk, Admin, and DSW) manage and respond to grievances through their respective dashboards.',
    },
    {
      question: 'Can supporting documents be attached with a grievance?',
      answer:
        'Yes. Students may upload supporting documents in accepted formats (PDF, JPG, PNG) at the time of submission, subject to the size limits specified on the filing form.',
    },
    {
      question: 'How is confidentiality maintained?',
      answer:
        'Grievance records are accessible only to the submitting student and authorized personnel involved in the redressal process. Information is handled in accordance with institutional data protection practices.',
    },
    {
      question: 'What grievance categories are covered?',
      answer:
        'The portal accepts grievances related to academic matters, infrastructure, administrative procedures, financial concerns, and other institutional issues not covered under the listed categories.',
    },
  ];

  return (
    <div className="app-shell min-h-screen">
      {/* Header */}
      <div className="border-b border-slate-200/80 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 pt-16 md:pt-20">
        <div className="section-container py-10 sm:py-12">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-blue-200">
              <Building2 className="h-3.5 w-3.5" />
              GNDEC · Grievance Redressal System
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              How the Grievance Process Works
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">
              A structured, transparent, and accountable mechanism for addressing concerns
              raised by students at Guru Nanak Dev Engineering College, Ludhiana — in
              accordance with AICTE and institutional grievance redressal guidelines.
            </p>
          </div>
        </div>
      </div>

      <div className="section-container py-10 sm:py-14 space-y-10 sm:space-y-14">
        {/* Guiding principles */}
        <section>
          <div className="mb-6">
            <span className="page-kicker">Institutional Framework</span>
            <h2 className="page-title mt-4 text-2xl sm:text-3xl">Guiding Principles</h2>
            <p className="page-subtitle mt-2">
              The Grievance Redressal Cell operates on the following core principles to ensure
              fair and effective resolution of all matters brought before it.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((item) => (
              <div key={item.title} className="metric-card border-slate-200/80">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Process steps */}
        <section className="surface-card p-6 sm:p-8">
          <div className="mb-8 text-center">
            <span className="page-kicker">End-to-End Workflow</span>
            <h2 className="mt-4 text-2xl font-extrabold text-slate-950 sm:text-3xl">
              Grievance Redressal Procedure
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
              From initial submission to final resolution — the standard process followed for
              every grievance registered through this portal.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className={`relative rounded-2xl border p-6 ${step.bg}`}
              >
                <div className="absolute -top-3 -left-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white shadow-md">
                  {index + 1}
                </div>
                <div className="mb-4 flex justify-center">
                  <step.icon className={`h-10 w-10 ${step.color}`} />
                </div>
                <h3 className="mb-2 text-center text-lg font-bold text-slate-900">
                  {step.title}
                </h3>
                <p className="text-center text-sm leading-6 text-slate-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {showFileCta && (
              <Link to="/file-grievance" className="btn-primary">
                <FileText className="h-4 w-4" />
                File a Grievance
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            {isStaff && (
              <Link to={dashboardPath} className="btn-primary">
                <Shield className="h-4 w-4" />
                {getStaffPanelLabel(user?.role)}
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <Link to="/track-grievance" className="btn-secondary">
              <BarChart3 className="h-4 w-4" />
              {isStaff ? 'Manage Grievances' : 'Track Your Grievance'}
            </Link>
          </div>
        </section>

        {/* Role responsibilities */}
        <section>
          <div className="mb-6 text-center">
            <span className="page-kicker">Roles & Responsibilities</span>
            <h2 className="mt-4 text-2xl font-extrabold text-slate-950 sm:text-3xl">
              Stakeholder Responsibilities
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
              Each role within the grievance redressal system has defined duties to ensure
              accountability at every stage of the process.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {roleCards.map((card) => (
              <div
                key={card.role}
                className={`rounded-2xl border p-6 ${card.accent}`}
              >
                <div className="mb-4 flex items-center gap-2">
                  <MessageSquare className={`h-5 w-5 ${card.titleColor}`} />
                  <h3 className={`text-lg font-extrabold ${card.titleColor}`}>
                    {card.role}
                  </h3>
                </div>
                <ul className={`space-y-2.5 text-sm leading-6 ${card.textColor}`}>
                  {card.duties.map((duty) => (
                    <li key={duty} className="flex items-start gap-2">
                      <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 opacity-70" />
                      <span>{duty}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Status lifecycle */}
        <section className="surface-card p-6 sm:p-8">
          <h2 className="mb-6 text-xl font-extrabold text-slate-950 sm:text-2xl">
            Grievance Status Lifecycle
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {[
              { label: 'Pending', color: 'bg-amber-100 text-amber-800 border-amber-200' },
              { label: 'Under Review', color: 'bg-blue-100 text-blue-800 border-blue-200' },
              { label: 'In Progress', color: 'bg-orange-100 text-orange-800 border-orange-200' },
              { label: 'Resolved', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
              { label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-200' },
            ].map((status, i, arr) => (
              <React.Fragment key={status.label}>
                <span
                  className={`status-chip border px-3 py-1.5 text-xs font-bold ${status.color}`}
                >
                  {status.label}
                </span>
                {i < arr.length - 1 && (
                  <ChevronRight className="hidden h-4 w-4 text-slate-400 sm:block" />
                )}
              </React.Fragment>
            ))}
          </div>
          <p className="mt-5 text-center text-sm text-slate-600">
            Status updates are recorded at each stage and reflected on the student dashboard
            and staff control panels in real time.
          </p>
        </section>

        {/* FAQs */}
        <section className="surface-card p-6 sm:p-8">
          <div className="mb-8 text-center">
            <span className="page-kicker inline-flex items-center gap-1.5">
              <HelpCircle className="h-3.5 w-3.5" />
              FAQ
            </span>
            <h2 className="mt-4 text-2xl font-extrabold text-slate-950 sm:text-3xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mx-auto max-w-3xl space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-5"
              >
                <h3 className="font-bold text-slate-900">{faq.question}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-blue-100 bg-blue-50/60 p-6 text-center sm:p-8">
            <h3 className="text-lg font-extrabold text-slate-900">
              Require Further Assistance?
            </h3>
            <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600">
              For queries not addressed above, please contact the Grievance Redressal Cell
              through the official contact page.
            </p>
            <Link to="/contact" className="btn-primary mt-5">
              <Mail className="h-4 w-4" />
              Contact the Redressal Cell
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HowItWorksPage;
