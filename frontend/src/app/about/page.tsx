import { Briefcase } from "lucide-react";

export default function About() {
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

  return (
    <div className="min-h-screen px-6 py-20">
      <main className="mx-auto max-w-3xl space-y-8">
        <h1 className="text-3xl font-bold">About</h1>

        <p className="text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed">
          An honor graduate in Finance (treasury) Major at Polytechnic of State
          Finance STAN and currently working at Ministry of Finance of Republic
          of Indonesia. I do love coding and digging more about economics and
          finance related topics, especially macro economic, public economic,
          behavioral finance, and financial engineering.
        </p>

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
      </main>
    </div>
  );
}
