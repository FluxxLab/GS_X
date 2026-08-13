export type EmployeeGender = 'male' | 'female' | 'other';
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'intern';
export type EmploymentStatus = 'active' | 'on_leave' | 'suspended' | 'terminated' | 'resigned';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  email: string;
  personalEmail: string | null;
  employeeId: string;
  phone: string | null;
  dateOfBirth: string | null;
  gender: EmployeeGender | null;
  maritalStatus: MaritalStatus | null;
  nationality: string | null;
  stateOfOrigin: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  departmentId: string | null;
  department?: { id: string; name: string; code: string };
  jobTitle: string | null;
  jobLevel: string | null;
  employmentType: EmploymentType;
  employmentStatus: EmploymentStatus;
  hireDate: string;
  confirmationDate: string | null;
  terminationDate: string | null;
  probationEndDate: string | null;
  managerId: string | null;
  manager?: { id: string; firstName: string; lastName: string; employeeId: string } | null;
  directReports?: Employee[];
  salaryGrade: string | null;
  grossSalary: number | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  pensionProvider: string | null;
  pensionNumber: string | null;
  taxId: string | null;
  nhfNumber: string | null;
  nin: string | null;
  passportNumber: string | null;
  userId: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  emergencyContactRelationship: string | null;
  // Next of Kin
  nextOfKinName: string | null;
  nextOfKinPhone: string | null;
  nextOfKinRelationship: string | null;
  nextOfKinAddress: string | null;
  nextOfKinEmail: string | null;
  // HMO
  hmoProvider: string | null;
  hmoPlan: string | null;
  hmoId: string | null;
  hmoStartDate: string | null;
  hmoExpiryDate: string | null;
  hmoHospital: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeePayload {
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  personalEmail?: string;
  employeeId: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: EmployeeGender;
  maritalStatus?: MaritalStatus;
  nationality?: string;
  stateOfOrigin?: string;
  address?: string;
  city?: string;
  state?: string;
  departmentId?: string;
  jobTitle?: string;
  jobLevel?: string;
  employmentType?: EmploymentType;
  employmentStatus?: EmploymentStatus;
  hireDate: string;
  confirmationDate?: string;
  probationEndDate?: string;
  managerId?: string;
  salaryGrade?: string;
  grossSalary?: number;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  pensionProvider?: string;
  pensionNumber?: string;
  taxId?: string;
  nhfNumber?: string;
  nin?: string;
  passportNumber?: string;
  userId?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  // Next of Kin
  nextOfKinName?: string;
  nextOfKinPhone?: string;
  nextOfKinRelationship?: string;
  nextOfKinAddress?: string;
  nextOfKinEmail?: string;
  // HMO
  hmoProvider?: string;
  hmoPlan?: string;
  hmoId?: string;
  hmoStartDate?: string;
  hmoExpiryDate?: string;
  hmoHospital?: string;
  /** Save as draft — drafts are hidden from the active roster (default false). */
  isDraft?: boolean;
}

export type UpdateEmployeePayload = Partial<CreateEmployeePayload>;

/** Fields an employee may edit on their own profile (never pay/title/department). */
export interface SelfProfilePayload {
  personalEmail?: string;
  phone?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  nextOfKinName?: string;
  nextOfKinPhone?: string;
  nextOfKinRelationship?: string;
  nextOfKinAddress?: string;
}

export interface EmployeeQueryParams {
  search?: string;
  departmentId?: string;
  employmentStatus?: EmploymentStatus;
  employmentType?: EmploymentType;
  managerId?: string;
  /** Omit for active roster; pass true to fetch drafts explicitly. */
  isDraft?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  onLeave: number;
  newThisMonth: number;
}

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  name: string;
  type: string;
  fileUrl: string | null;
  /** S3 object key — the canonical location for uploaded documents. */
  fileKey: string | null;
  /** @deprecated legacy base64; never returned by the list endpoint. */
  fileData?: string | null;
  mimeType: string | null;
  fileSize: number | null;
  uploadedBy: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
