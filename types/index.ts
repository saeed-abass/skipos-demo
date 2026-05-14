// ─────────────────────────────────────────────────────────
// Enums — mirror prisma/schema.prisma
// ─────────────────────────────────────────────────────────

export type Role = 'ADMIN' | 'OFFICE' | 'DRIVER'

export type JobType = 'DELIVERY' | 'COLLECTION' | 'EXCHANGE' | 'WAIT_AND_LOAD'

export type JobStatus =
  | 'PENDING'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'

export type SkipSize =
  | 'TWO_YARD'
  | 'FOUR_YARD'
  | 'SIX_YARD'
  | 'EIGHT_YARD'
  | 'TWELVE_YARD'
  | 'FOURTEEN_YARD'
  | 'SIXTEEN_YARD'
  | 'TWENTY_YARD'

export type WTNStatus = 'DRAFT' | 'SIGNED' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED'

export type Condition = 'GOOD' | 'FAIR' | 'POOR'

export type SkipStatus = 'IN_YARD' | 'ON_SITE' | 'AT_TIP'

// ─────────────────────────────────────────────────────────
// Model interfaces
// ─────────────────────────────────────────────────────────

export interface Company {
  id: string
  name: string
  company_number: string | null
  ea_registration: string | null
  address: string
  postcode: string
  phone: string
  email: string
  logo_url: string | null
  created_at: Date
  updated_at: Date
}

export interface User {
  id: string
  company_id: string
  email: string
  full_name: string
  role: Role
  avatar_url: string | null
  created_at: Date
  // Relations
  company?: Company
}

export interface Customer {
  id: string
  company_id: string
  name: string
  phone: string
  email: string | null
  address: string
  postcode: string
  notes: string | null
  created_at: Date
  updated_at: Date
  // Relations
  company?: Company
}

export interface Job {
  id: string
  company_id: string
  customer_id: string
  driver_id: string | null
  skip_id: string | null
  job_number: string | null
  job_type: JobType
  status: JobStatus
  skip_size: SkipSize
  delivery_address: string
  delivery_postcode: string
  scheduled_date: Date | null
  scheduled_time_slot: string | null
  permit_required: boolean
  permit_number: string | null
  price: number | null
  notes: string | null
  created_at: Date
  updated_at: Date
  // Relations
  customer?: Customer
  driver?: User | null
  skip?: Skip | null
  wtn?: WasteTransferNote | null
}

export interface WasteTransferNote {
  id: string
  company_id: string
  job_id: string
  wtn_number: string
  waste_description: string
  ewc_code: string
  quantity_kg: number | null
  container_type: string
  collection_address: string
  collection_postcode: string
  disposal_site_name: string | null
  disposal_site_address: string | null
  carrier_name: string
  carrier_ea_number: string
  consignee_name: string | null
  consignee_address: string | null
  transfer_date: Date
  status: WTNStatus
  customer_signature: string | null
  customer_signed_at: Date | null
  defra_submission_id: string | null
  defra_submitted_at: Date | null
  created_at: Date
  updated_at: Date
  // Relations
  job?: Job
}

export interface Skip {
  id: string
  company_id: string
  skip_number: string
  size: SkipSize
  condition: Condition
  status: SkipStatus
  notes: string | null
  created_at: Date
  updated_at: Date
  // Relations
  jobs?: Job[]
}

// ─────────────────────────────────────────────────────────
// API / form types
// ─────────────────────────────────────────────────────────

export type CreateJobInput = Omit<Job,
  'id' | 'created_at' | 'updated_at' | 'customer' | 'driver' | 'skip' | 'wtn'
>

export type CreateCustomerInput = Omit<Customer,
  'id' | 'created_at' | 'updated_at' | 'company'
>

export type CreateWTNInput = Omit<WasteTransferNote,
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'job'
  | 'customer_signature'
  | 'customer_signed_at'
  | 'defra_submission_id'
  | 'defra_submitted_at'
>

// ─────────────────────────────────────────────────────────
// Display label maps
// ─────────────────────────────────────────────────────────

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  DELIVERY: 'Delivery',
  COLLECTION: 'Collection',
  EXCHANGE: 'Exchange',
  WAIT_AND_LOAD: 'Wait & Load',
}

export const SKIP_SIZE_LABELS: Record<SkipSize, string> = {
  TWO_YARD: '2 Yard',
  FOUR_YARD: '4 Yard',
  SIX_YARD: '6 Yard',
  EIGHT_YARD: '8 Yard',
  TWELVE_YARD: '12 Yard',
  FOURTEEN_YARD: '14 Yard',
  SIXTEEN_YARD: '16 Yard',
  TWENTY_YARD: '20 Yard',
}

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  PENDING: 'Pending',
  SCHEDULED: 'Scheduled',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

export const WTN_STATUS_LABELS: Record<WTNStatus, string> = {
  DRAFT:     'Draft',
  SIGNED:    'Signed',
  SUBMITTED: 'Submitted',
  ACCEPTED:  'Accepted',
  REJECTED:  'Rejected',
}

