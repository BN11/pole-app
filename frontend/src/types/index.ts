// ─── User ────────────────────────────────────────────────────────────────────

export type UserRole = 'USER' | 'FIELD_OWNER' | 'TOURNAMENT_OPERATOR' | 'SUPER_ADMIN'

export interface User {
  id: string
  telegramId: string
  firstName: string
  lastName?: string
  username?: string
  avatar?: string
  phone?: string
  referralCode?: string
  referredBy?: string
  role: UserRole
  createdAt: string
}

// ─── Field ───────────────────────────────────────────────────────────────────

export type SportType = 'FOOTBALL' | 'BASKETBALL' | 'TENNIS' | 'VOLLEYBALL'
export type FieldStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface Field {
  id: string
  name: string
  description?: string
  address: string
  lat?: number
  lng?: number
  sportTypes: SportType[]
  photos: string[]
  pricePerHour: number
  currency: string
  rating: number
  reviewCount: number
  amenities: FieldAmenities
  workingHours: WorkingHours[]
  status: FieldStatus
  ownerId: string
  createdAt: string
}

export interface FieldAmenities {
  hasLockerRoom: boolean
  hasParking: boolean
  hasLighting: boolean
  hasCafeteria: boolean
  hasShower: boolean
  hasBallRent: boolean
}

export interface WorkingHours {
  dayOfWeek: number // 0=Sun, 1=Mon ... 6=Sat
  openTime: string  // "08:00"
  closeTime: string // "22:00"
  isClosed: boolean
}

export interface TimeSlot {
  time: string      // "09:00"
  available: boolean
  price: number
}

// ─── Booking ─────────────────────────────────────────────────────────────────

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
export type PaymentMethod = 'CARD' | 'CASH' | 'PAYME' | 'CLICK'

export interface Booking {
  id: string
  fieldId: string
  field: Field
  userId: string
  user: User
  date: string         // "2024-04-15"
  startTime: string    // "10:00"
  endTime: string      // "12:00"
  durationHours: number
  totalPrice: number
  currency: string
  status: BookingStatus
  paymentMethod: PaymentMethod
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED'
  createdAt: string
}

// ─── Tournament ───────────────────────────────────────────────────────────────

export type TournamentStatus = 'PENDING' | 'APPROVED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
export type TournamentFormat = '5x5' | '7x7' | '11x11' | '3x3' | '6x6'

export interface Tournament {
  id: string
  name: string
  description?: string
  sportType: SportType
  format: TournamentFormat
  coverPhoto?: string
  location: string
  startDate: string
  endDate: string
  registrationDeadline: string
  maxTeams: number
  registeredTeams: number
  prizePool?: number
  currency: string
  entryFee?: number
  status: TournamentStatus
  operatorId: string
  operator: User
  createdAt: string
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export interface OwnerStats {
  todayRevenue: number
  todayBookings: number
  rating: number
  occupancyPercent: number
  weeklyRevenue: { day: string; amount: number }[]
}

export interface AdminStats {
  totalFields: number
  activeBookings: number
  activeTournaments: number
  totalUsers: number
  pendingFields: number
  pendingTournaments: number
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// ─── Telegram ─────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void
        expand: () => void
        close: () => void
        setHeaderColor: (color: string) => void
        setBackgroundColor: (color: string) => void
        showAlert: (message: string, callback?: () => void) => void
        showConfirm: (message: string, callback: (ok: boolean) => void) => void
        MainButton: {
          text: string
          show: () => void
          hide: () => void
          onClick: (callback: () => void) => void
          offClick: (callback: () => void) => void
          enable: () => void
          disable: () => void
          showProgress: () => void
          hideProgress: () => void
        }
        BackButton: {
          show: () => void
          hide: () => void
          onClick: (callback: () => void) => void
        }
        initData: string
        initDataUnsafe: {
          start_param?: string
          user?: {
            id: number
            first_name: string
            last_name?: string
            username?: string
            photo_url?: string
          }
        }
        colorScheme: 'light' | 'dark'
        themeParams: Record<string, string>
        openTelegramLink: (url: string) => void
        requestContact: (callback: (ok: boolean, data?: { responseUnsafe?: { contact?: { phone_number: string; first_name: string; user_id?: number } }; contact?: { phone_number: string; first_name: string; user_id?: number } }) => void) => void
      }
    }
    ymaps?: any
    ymapsReady?: boolean
  }
}
