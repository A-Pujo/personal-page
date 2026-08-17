import { Mail, MapPin, Github, Linkedin, Book } from "lucide-react";
import type { Route } from "./+types/about";
import { mergeMeta, pageMeta } from "~/lib/meta";

export const meta: Route.MetaFunction = ({ matches }) =>
  mergeMeta(
    matches,
    pageMeta({
      title: "About",
      description:
        "Aln Pujo Priambodo — State Treasury Management professional, published researcher in fiscal policy and macroeconomics, and full-stack developer & database administrator.",
      path: "/about",
    }),
  );

export default function About() {
  const fullName = "Aln Pujo Priambodo";

  const publications = [
    {
      year: "2026",
      ref: "Priambodo, A. P., & Yuniarianti, A. Evaluating Agricultural Credit and Climate-Related Government Expenditure Effect on Agriculture GDRP in Indonesia. Indonesian Treasury Review.",
    },
    {
      year: "2026",
      ref: "Rai, G. N., & Priambodo, A. P. Assessment of Regional Fiscal Capacity through Provincial Capital Direct Participation. Jurnal Bina Praja.",
    },
    {
      year: "2024",
      ref: "Priambodo, A. P. Within the Recent Indonesia Global Trade and Future Predictions: Data Analytic Approach. Cendekia Niaga, 9(2), 151-162.",
    },
    {
      year: "2024",
      ref: "Priambodo, A. P., & Djirimu, M. A. Determinants of Food Security Index in Central Sulawesi Province Indonesia. Research on World Agricultural Economy, 857-874.",
    },
    {
      year: "2024",
      ref: "Priambodo, A. P., & Yuniarianti, A. Peran Strategis Belanja Perjalanan Dinas dalam Mendorong Perekonomian Sektor Pariwisata. Jurnal Manajemen Perbendaharaan, 6(1), 72-87.",
    },
    {
      year: "2023",
      ref: "Priambodo, A. P., & Djirimu, M. A. Government Intervention Strategy in Poverty Reduction. Jurnal Bina Praja, 16(3), 489-508.",
    },
    {
      year: "2023",
      ref: "Priambodo, A. P. Kuantifikasi Dukungan Pemerintah terhadap UMKM: Studi Kasus di Tingkat Provinsi di Indonesia Tahun 2019-2023. Prosiding MBIC 8, 580-592.",
    },
    {
      year: "2022",
      ref: "Priambodo, A. P., & Hidayat, N. W. Pengaruh PAD, DAU, DBH, dan belanja modal terhadap PDRB dan kemiskinan di Kabupaten Sidoarjo. Jurnal Manajemen Keuangan Publik, 8(1), 1-14.",
    },
    {
      year: "2022",
      ref: "Priambodo, A. P. Analisis Cash Forecasting Menggunakan Model Prophet di KPPN Sidoarjo. Politeknik Keuangan Negara STAN.",
    },
  ];

  const experiences = [
    {
      period: "2025 – Present",
      title: "Fullstack Developer & DBA",
      org: "DG of Treasury, Ministry of Finance",
      bullets: [
        "Formulated and analyzed budget execution data patterns, utilizing data engineering skills to support central policy development and operational monitoring.",
        "Spearheaded data analytics initiatives and specialized modeling to optimize state treasury management systems and disbursement tracking.",
        "Designed and maintained database workflows to streamline financial reporting across departments.",
      ],
    },
    {
      period: "2023 – 2025",
      title: "Regional Economic Analyst",
      org: "DG of Treasury, Ministry of Finance",
      bullets: [
        "Supervised and evaluated central government budget execution across regional government units, ensuring regulatory compliance and maximizing fiscal efficiency.",
        "Provided strategic institutional guidance to regional spending units regarding fund allocation, budget revisions, and disbursement operations.",
        "Collaborated on quarterly fiscal reviews analyzing the regional impact of national government spending.",
      ],
    },
    {
      period: "2023",
      title: "Accounting and Financial Reporting",
      org: "DG of Treasury, Ministry of Finance",
      bullets: [
        "Managed regional financial data consolidation and verified financial statements for local government entities to ensure accounting accuracy and transparency.",
        "Analyzed regional fiscal data to generate strategic reports on local financial performance and macroeconomic indicators.",
        "Resolved reconciliation discrepancies between government spending records and central bank systems.",
      ],
    },
  ];

  const skillGroups = [
    {
      label: "Technical",
      items: [
        "React (Advanced)",
        "PHP (Advanced)",
        "Python (Advanced)",
        "ETL Automation",
      ],
    },
    {
      label: "Research & Analysis",
      items: [
        "Data Analysis (Advanced)",
        "Econometric",
        "Financial Analysis",
        "Academic Publication",
      ],
    },
    {
      label: "Domain",
      items: [
        "Government Expenditure",
        "Public Finance",
        "State Treasury Management",
      ],
    },
  ];

  const education = [
    {
      period: "2025 – 2026",
      institution: "Universitas Siber Asia",
      degree: "Management (Business) — Bachelor's",
      status: "GPA 3.90 / 4.00",
    },
    {
      period: "2019 – 2022",
      institution: "State Finance Polytechnic STAN",
      degree: "State Treasury — Associate's",
      status: "GPA 3.83 / 4.00",
    },
  ];

  const certificates = [
    {
      title: "Financial Market Analysis",
      issuer: "International Monetary Fund",
      period: "04/2026 – Present",
    },
    {
      title: "Openlearn Quantitative And Qualitative Research In Finance",
      issuer: "The Open University",
      period: "02/2026 – Present",
    },
    {
      title:
        "Financial Programming and Policies, Part 1: Macroeconomic Accounts and Analysis",
      issuer: "International Monetary Fund",
      period: "08/2024 – Present",
    },
    {
      title: "Investment Risk Management",
      issuer: "Coursera",
      period: "06/2022 – Present",
    },
    {
      title: "Stock Valuation with Comparable Companies Analysis",
      issuer: "Coursera",
      period: "01/2022 – Present",
    },
    {
      title: "Practical AI for Productivity",
      issuer: "Dicoding Indonesia",
      period: "04/2026 – 04/2029",
    },
  ];

  return (
    <div className="min-h-screen px-6 py-20">
      <main className="mx-auto max-w-3xl space-y-10">
        <header className="flex items-center gap-6">
          <div className="relative w-24 h-24 rounded-full ring-4 ring-[var(--apujo-blue)]/20 shadow-md overflow-hidden flex-shrink-0">
            <img
              src="/img/pujo-pas-foto.jpg"
              alt="Aln Pujo Priambodo"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-zinc-50">
              {fullName}
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Web Dev · Independent Researcher · Financial Data Analyst
            </p>
          </div>
        </header>

        <section>
          <p className="text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed">
            Dedicated and analytical Public Servant at the Indonesian Ministry
            of Finance with a robust foundation in State Treasury Management,
            macroeconomic research, and technical website development. Proven
            track record in executing budget operations, building automated data
            pipelines, and conducting advanced econometric analysis to drive
            evidence-based policy. Published researcher in peer-reviewed
            journals specializing in regional fiscal capacity, government
            expenditure impacts, and public financial forecasting. Dual-skilled
            as a Full-Stack Web Developer and Database Administrator with a
            unique ability to bridge the gap between data engineering and
            economic analysis.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6 text-black dark:text-zinc-50">
            Work Experience
          </h2>
          <ol className="relative border-l-2 border-slate-200 dark:border-slate-700 space-y-8 pl-6">
            {experiences.map((e) => (
              <li key={e.period + e.title} className="relative">
                <span className="absolute -left-[1.6rem] top-1 w-3 h-3 bg-[var(--apujo-blue)]" />
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-semibold mb-1">
                  {e.period}
                </p>
                <h3 className="font-semibold text-black dark:text-zinc-50">
                  {e.title}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
                  {e.org}
                </p>
                {e.bullets && e.bullets.length > 0 && (
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    {e.bullets.map((b, i) => (
                      <li
                        key={i}
                        className="text-sm text-zinc-600 dark:text-zinc-400"
                      >
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6 text-black dark:text-zinc-50">
            Research &amp; Publications
          </h2>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-4 uppercase tracking-widest font-semibold">
            2022 – Present · Independent Researcher
          </p>
          <ol className="space-y-3">
            {publications.map((p, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 mt-0.5 text-[10px] uppercase tracking-widest font-bold text-[var(--apujo-blue)] dark:text-zinc-400 w-8 text-right">
                  {p.year}
                </span>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {p.ref}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-black dark:text-zinc-50">
            Skills
          </h2>
          <div className="space-y-4">
            {skillGroups.map((g) => (
              <div key={g.label}>
                <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-2">
                  {g.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {g.items.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 rounded-full text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-black dark:text-zinc-50">
            Education
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {education.map((e) => (
              <div
                key={e.institution}
                className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900 text-black dark:text-zinc-50"
              >
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold mb-1">
                  {e.period}
                </p>
                <p className="font-semibold text-sm text-black dark:text-zinc-50">
                  {e.institution}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
                  {e.degree}
                </p>
                <span className="mt-2 inline-block text-[10px] uppercase tracking-widest text-zinc-400 font-medium">
                  {e.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-black dark:text-zinc-50">
            Certificates
          </h2>
          <div className="space-y-3">
            {certificates.map((c) => (
              <div
                key={c.title}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-3 bg-white dark:bg-slate-900"
              >
                <div>
                  <p className="text-sm font-semibold text-black dark:text-zinc-50">
                    {c.title}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {c.issuer}
                  </p>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium whitespace-nowrap">
                  {c.period}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-black dark:text-zinc-50">
            Contact
          </h2>
          <div className="flex flex-wrap gap-3 mb-4">
            <a
              href="https://github.com/a-pujo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Github className="w-4 h-4" /> GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/aln-pujo-priambodo-22b312170/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Linkedin className="w-4 h-4" /> LinkedIn
            </a>
            <a
              href="https://scholar.google.com/citations?user=DXFiyI4AAAAJ"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Book className="w-4 h-4" /> Google Scholar
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
            <a
              className="text-sm text-[var(--apujo-blue)] dark:text-zinc-300"
              href="mailto:aln.pujo@gmail.com"
            >
              aln.pujo@gmail.com
            </a>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <MapPin className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              Based in Jakarta, Indonesia
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-black dark:text-zinc-50">
            Languages
          </h2>
          <div className="flex flex-wrap gap-3">
            {[
              { lang: "Indonesia", level: "Native" },
              { lang: "English", level: "Fluent" },
            ].map(({ lang, level }) => (
              <div
                key={lang}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <span className="text-sm font-medium text-black dark:text-zinc-50">
                  {lang}
                </span>
                <span className="text-xs text-zinc-400">{level}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
