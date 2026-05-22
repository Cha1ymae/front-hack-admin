import { Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "@/layouts/admin-layout";
import { AuthLayout } from "@/layouts/auth-layout";
import { ProtectedRoute } from "@/routes/protected-route";
import { ROUTES } from "@/constants/routes";
import { LoginPage } from "@/pages/auth/login-page";
import { DashboardPage } from "@/pages/dashboard/dashboard-page";
import { UsersPage } from "@/pages/users/users-page";
import { UserDetailPage } from "@/pages/users/user-detail-page";
import { StudentsPage } from "@/pages/students/students-page";
import { CompaniesPage } from "@/pages/companies/companies-page";
import { CompanyDetailPage } from "@/pages/companies/company-detail-page";
import { SchoolsPage } from "@/pages/schools/schools-page";
import { JobsPage } from "@/pages/jobs/jobs-page";
import { ApplicationsPage } from "@/pages/applications/applications-page";
import { SettingsPage } from "@/pages/settings/settings-page";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.login} element={<LoginPage />} />
      </Route>
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to={ROUTES.dashboard} replace />} />
        <Route path={ROUTES.dashboard} element={<DashboardPage />} />
        <Route path={ROUTES.users} element={<UsersPage />} />
        <Route path="/users/:id" element={<UserDetailPage />} />
        <Route path={ROUTES.students} element={<StudentsPage />} />
        <Route path={ROUTES.companies} element={<CompaniesPage />} />
        <Route path="/companies/:id" element={<CompanyDetailPage />} />
        <Route path={ROUTES.schools} element={<SchoolsPage />} />
        <Route path={ROUTES.jobs} element={<JobsPage />} />
        <Route path={ROUTES.applications} element={<ApplicationsPage />} />
        <Route path={ROUTES.settings} element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to={ROUTES.dashboard} replace />} />
    </Routes>
  );
}
