import { Briefcase, Mail, Book, Code, MapPin } from "lucide-react";

export default function About() {
  const fullName = "Aln Pujo Priambodo";

  const experiences = [
    {
      period: "2025 - Present",
      title: "Fullstack Dev & DBA",
      org: "Data Management and Budget Implementation Information System Development Section, Directorate of Budget Implementation",
    },
    {
      period: "2023 - 2025",
      title: "Regional Fiscal-Economic Analyst",
      org: "Budget Execution II Division of the Central Sulawesi Regional Office of the Directorate General of the Treasury.",
    },
    {
      period: "2023",
      title: "Staff",
      org: "Accounting and Financial Reporting Development Division of the Central Sulawesi Regional Office of the Directorate General of the Treasury.",
    },
  ];

  const skills = [
    "TypeScript",
    "React / Next.js",
    "Tailwind CSS",
    "FastAPI",
    "Python",
    "MySQL / PostgreSQL",
    "SQL / Database Design",
    "Docker",
    "Git",
    "Data Analysis",
  ];

  return (
    <div className="min-h-screen px-6 py-20">
      <main className="mx-auto max-w-3xl space-y-8">
        <header>
          <h1 className="text-3xl font-bold">{fullName}</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Treasury & Finance professional • Software engineer • DBA
          </p>
        </header>

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

        <section>
          <h2 className="text-2xl font-semibold mb-4">Work Experience</h2>

          <table
            className="w-full table-fixed"
            style={{ borderCollapse: "separate", borderSpacing: "0 1rem" }}
          >
            <tbody>
              {experiences.map((e) => (
                <tr key={e.period} className="align-top">
                  <td className="pr-6 w-28 text-sm text-slate-500 align-top">
                    {e.period}
                  </td>
                  <td className="p-4 bg-[var(--apujo-blue)] bg-opacity-10 text-[var(--apujo-blue)] rounded-md w-12 text-center">
                    <Briefcase className="w-4 h-4 text-white" />
                  </td>
                  <td className="pl-6">
                    <h3 className="font-medium">{e.title}</h3>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">
                      {e.org}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Skills</h2>
          <div className="flex flex-wrap gap-3">
            {skills.map((s) => (
              <span
                key={s}
                className="px-3 py-1 rounded-full text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
              >
                {s}
              </span>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Education</h2>
          <div className="flex items-start gap-4">
            <Book className="w-5 h-5 text-zinc-600 dark:text-zinc-300 mt-1" />
            <div>
              <p className="font-medium">Polytechnic of State Finance STAN</p>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                Finance (Treasury)
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Contact</h2>
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
            <a
              className="text-sm text-[var(--apujo-blue)]"
              href="mailto:aln.pujo@gmail.com"
            >
              aln.pujo@gmail.com
            </a>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <MapPin className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              Based in Jakarta, Indonesia
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
