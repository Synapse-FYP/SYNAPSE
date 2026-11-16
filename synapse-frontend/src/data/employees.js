// Fictional Meridian Ledger Group directory with per-employee behavioral profiles.
export const EMP_SEED = [
  { id: 'E1001', name: 'Aisha Rahman', dept: 'Finance', role: 'Financial Analyst', email: 'aisha.rahman@meridianledger.example', hired: '2021-03-15', site: 'Karachi HQ', prof: { logon: 4, device: 0.1, file: 40, email: 38, http: 150, off: 0.05 } },
  { id: 'E1002', name: 'Daniel Okafor', dept: 'Engineering', role: 'Senior Software Engineer', email: 'daniel.okafor@meridianledger.example', hired: '2020-08-03', site: 'Karachi HQ', prof: { logon: 5, device: 0.3, file: 55, email: 25, http: 220, off: 0.08 } },
  { id: 'E1003', name: 'Mei Lin Chen', dept: 'Research & Development', role: 'Data Scientist', email: 'meilin.chen@meridianledger.example', hired: '2022-01-10', site: 'Lahore Office', prof: { logon: 4, device: 0.2, file: 60, email: 20, http: 200, off: 0.1 } },
  { id: 'E1004', name: 'Omar Siddiqui', dept: 'IT Operations', role: 'Systems Administrator', email: 'omar.siddiqui@meridianledger.example', hired: '2019-05-20', site: 'Karachi HQ', prof: { logon: 9, device: 0.4, file: 30, email: 30, http: 180, off: 0.18 } },
  { id: 'E1005', name: 'Sofia Marquez', dept: 'Human Resources', role: 'HR Business Partner', email: 'sofia.marquez@meridianledger.example', hired: '2021-11-01', site: 'Karachi HQ', prof: { logon: 3, device: 0.05, file: 25, email: 45, http: 230, off: 0.03 } },
  { id: 'E1006', name: 'Lukas Brandt', dept: 'Sales', role: 'Account Executive', email: 'lukas.brandt@meridianledger.example', hired: '2023-02-13', site: 'Remote — Islamabad', prof: { logon: 3, device: 0.25, file: 20, email: 50, http: 170, off: 0.06 } },
  { id: 'E1007', name: 'Hira Qureshi', dept: 'Legal', role: 'Contracts Counsel', email: 'hira.qureshi@meridianledger.example', hired: '2022-06-06', site: 'Karachi HQ', prof: { logon: 3, device: 0.05, file: 35, email: 35, http: 120, off: 0.07 } },
  { id: 'E1008', name: 'Tomás Ferreira', dept: 'Engineering', role: 'DevOps Engineer', email: 'tomas.ferreira@meridianledger.example', hired: '2021-09-27', site: 'Lahore Office', prof: { logon: 7, device: 0.3, file: 45, email: 18, http: 260, off: 0.15 } },
  { id: 'E1009', name: 'Priya Nair', dept: 'Finance', role: 'Payroll Specialist', email: 'priya.nair@meridianledger.example', hired: '2020-02-17', site: 'Karachi HQ', prof: { logon: 4, device: 0.05, file: 30, email: 28, http: 110, off: 0.04 } },
  { id: 'E1010', name: 'Ethan Walsh', dept: 'Research & Development', role: 'Research Engineer', email: 'ethan.walsh@meridianledger.example', hired: '2026-11-02', site: 'Lahore Office', prof: { logon: 4, device: 0.2, file: 50, email: 15, http: 190, off: 0.1 } },
];

export const PROF = {};
EMP_SEED.forEach((e) => { PROF[e.id] = { prof: e.prof, hired: e.hired }; });

// Injected anomalous days (employee|date → category overrides).
export const INJ = {
  'E1007|2026-10-21': { email: { n: 98, off: 24 } },
  'E1006|2026-10-24': { device: { n: 5, off: 3 }, file: { n: 70, off: 22 } },
  'E1009|2026-10-28': { logon: { n: 11, off: 1 } },
  'E1004|2026-10-30': { logon: { n: 12, off: 8 } },
  'E1001|2026-10-31': { file: { n: 95, off: 40 }, logon: { n: 7, off: 3 } },
  'E1008|2026-11-04': { device: { n: 3, off: 0 } },
  'E1004|2026-11-08': { logon: { n: 9, off: 9 } },
  'E1005|2026-11-09': { http: { n: 620, off: 40 } },
  'E1007|2026-11-09': { email: { n: 120, off: 35 } },
  'E1001|2026-11-10': { file: { n: 110, off: 52 }, logon: { n: 8, off: 4 }, email: { n: 70, off: 18 } },
  'E1001|2026-11-11': { file: { n: 90, off: 38 }, logon: { n: 7, off: 3 } },
  'E1002|2026-11-11': { device: { n: 6, off: 4 }, file: { n: 85, off: 30 } },
  'E1009|2026-11-12': { logon: { n: 14, off: 2 } },
  'E1010|2026-11-12': { http: { n: 540, off: 60 } },
  'E1006|2026-11-13': { device: { n: 9, off: 9 }, file: { n: 180, off: 120 }, http: { n: 260, off: 90 } },
  'E1008|2026-11-14': { device: { n: 5, off: 5 }, file: { n: 40, off: 30 } },
};
