import { Mail, MapPin, Github, Linkedin, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function About() {
  const fullName = "Aln Pujo Priambodo";

  const experiences = [
    {
      period: "2025 – Present",
      title: "Fullstack Dev & DBA",
      org: "Data Management and Budget Implementation Information System Development Section, Directorate of Budget Implementation",
    },
    {
      period: "2023 – 2025",
      title: "Regional Fiscal-Economic Analyst",
      org: "Budget Execution II Division of the Central Sulawesi Regional Office of the Directorate General of the Treasury.",
    },
    {
      period: "2023",
      title: "Staff",
      org: "Accounting and Financial Reporting Development Division of the Central Sulawesi Regional Office of the Directorate General of the Treasury.",
    },
  ];

  const skillGroups = [
    {
      label: "Frontend",
      items: ["TypeScript", "React / Next.js", "Tailwind CSS"],
    },
    {
      label: "Backend & Data",
      items: ["FastAPI", "Python", "Data Analysis"],
    },
    {
      label: "Infrastructure",
      items: ["MySQL / PostgreSQL", "SQL / Database Design", "Docker", "Git"],
    },
  ];

  const education = [
    {
      institution: "University of Cyber Asia",
      degree: "Business (Management)",
      status: "Graduated . GPA 3.90/4.00",
    },
    {
      institution: "Polytechnic of State Finance STAN",
      degree: "Finance (Treasury)",
      status: "Graduated . GPA 3.83/4.00",
    },
  ];

  return (
    <div className="min-h-screen px-6 py-20">
      <main className="mx-auto max-w-3xl space-y-10">
        {/* Header */}
        <header className="flex items-center gap-6">
          <div className="relative w-24 h-24 rounded-full ring-4 ring-[var(--apujo-blue)]/20 shadow-md overflow-hidden flex-shrink-0">
            <Image
              src="/img/pujo-pas-foto.jpg"
              alt="Aln Pujo Priambodo"
              fill
              className="object-cover object-top"
              priority
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{fullName}</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Treasury &amp; Finance professional • Software engineer • Data
              Analyst
            </p>
          </div>
        </header>

        {/* Bio */}
        <section>
          <h2 className="sr-only">About</h2>
          <p className="text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed">
            An honor graduate in Finance (treasury) Major at Polytechnic of
            State Finance STAN and currently working at Ministry of Finance of
            Republic of Indonesia. I do love coding and digging more about
            economics and finance related topics, especially macro economic,
            public economic, behavioral finance, and financial engineering. I
            build tooling and systems to improve financial data quality and
            decision-making.
          </p>
        </section>

        {/* Work Experience — vertical timeline */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Work Experience</h2>
          <ol className="relative border-l-2 border-slate-200 dark:border-slate-700 space-y-8 pl-6">
            {experiences.map((e) => (
              <li key={e.period} className="relative">
                {/* dot */}
                {/* <ArrowRight className="absolute -left-[1.4rem] text-[var(--apujo-blue)]" /> */}
                <span className="absolute -left-[1.6rem] top-1 w-3 h-3 bg-[var(--apujo-blue)]" />
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-1">
                  {e.period}
                </p>
                <h3 className="font-semibold text-base">{e.title}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
                  {e.org}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Skills — grouped */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Skills</h2>
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

        {/* Education — bordered cards */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Education</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {education.map((e) => (
              <div
                key={e.institution}
                className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900"
              >
                <p className="font-semibold text-sm">{e.institution}</p>
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

        {/* Contact & Social */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Contact</h2>
          <div className="flex flex-wrap gap-3 mb-4">
            <a
              href="https://github.com/apujo"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Github className="w-4 h-4" /> GitHub
            </a>
            <a
              href="https://linkedin.com/in/apujo"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Linkedin className="w-4 h-4" /> LinkedIn
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
      </main>
    </div>
  );
}
