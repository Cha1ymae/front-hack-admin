import type { UserRole } from './auth'

export type ApplicationStatus =
  | 'submitted'
  | 'reviewed'
  | 'accepted'
  | 'rejected'
  | 'withdrawn'

export type JobStatus = 'LOOKING' | 'NOT_LOOKING'

export type CompanyStatus = 'pending' | 'validated' | 'suspended'

export type AnnouncementStatus = 'draft' | 'published' | 'archived' | 'pending_review'

export type UserStatus = 'active' | 'inactive'

export type Company = {
  id: string
  keycloakId: string
  name: string
  address: string
  openToInternships: boolean
  status: CompanyStatus
  createdAt: string
  updatedAt: string
}

export type Student = {
  id: string
  keycloakId: string
  name: string
  surname: string
  dateOfBirth: string
  jobStatus: JobStatus
  schoolId?: string | null
  address: string
  profileValidated: boolean
  createdAt: string
  updatedAt: string
}

export type School = {
  id: string
  keycloakId: string
  name: string
  address: string
  studentCount?: number
  createdAt: string
  updatedAt: string
}

export type Announcement = {
  id: string
  companyId: string
  name: string
  description: string
  expirationDate: string
  archivedAt?: string | null
  status: AnnouncementStatus
  createdAt: string
  updatedAt: string
}

export type Application = {
  id: string
  announcementId: string
  studentId: string
  status: ApplicationStatus
  createdAt: string
  updatedAt: string
}

export type AdminUser = {
  id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  roles: UserRole[]
  status: UserStatus
  createdAt: string
}

export type Contract = {
  id: string
  studentId: string
  companyId: string
  status: 'draft' | 'signed' | 'active' | 'terminated'
  startDate: string
  endDate?: string
  pdfUrl?: string
  createdAt: string
}

export type Document = {
  id: string
  ownerId: string
  ownerType: 'student' | 'company' | 'school'
  name: string
  mimeType: string
  size: number
  url: string
  createdAt: string
}

export type DashboardStats = {
  totalUsers: number
  totalStudents: number
  totalCompanies: number
  totalJobs: number
  totalApplications: number
  pendingCompanies: number
  pendingJobs: number
  applicationsThisWeek: number
}

export type ActivityItem = {
  id: string
  type: 'application' | 'company' | 'job' | 'user'
  title: string
  description: string
  createdAt: string
}
