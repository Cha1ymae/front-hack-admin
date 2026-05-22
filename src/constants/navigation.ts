import {
  Briefcase,
  Building2,
  GraduationCap,
  LayoutDashboard,
  School,
  Settings,
  Users,
  ClipboardList,
} from "lucide-react";
import { ROUTES } from "./routes";

export type NavItem = {
  title: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: string;
};

export const MAIN_NAV: NavItem[] = [
  { title: "Dashboard", href: ROUTES.dashboard, icon: LayoutDashboard },
  { title: "Utilisateurs", href: ROUTES.users, icon: Users },
  { title: "Étudiants", href: ROUTES.students, icon: GraduationCap },
  { title: "Entreprises", href: ROUTES.companies, icon: Building2 },
  { title: "Écoles", href: ROUTES.schools, icon: School },
  { title: "Annonces", href: ROUTES.jobs, icon: Briefcase },
  { title: "Candidatures", href: ROUTES.applications, icon: ClipboardList },
  { title: "Paramètres", href: ROUTES.settings, icon: Settings },
];

export const BREADCRUMB_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  users: "Utilisateurs",
  students: "Étudiants",
  companies: "Entreprises",
  schools: "Écoles",
  jobs: "Annonces",
  applications: "Candidatures",
  settings: "Paramètres",
};
