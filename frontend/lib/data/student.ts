export interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  studentId: string;
  avatar: string | null;
  memberSince: string;
  farmingExperience: "None" | "< 1 year" | "1–3 years" | "3–5 years" | "5+ years";
  areasOfInterest: string[];
  education: string;
  occupation: string;
  state: string;
  lga: string;
  preferredLanguage: string;
}

export interface StudentEnrollment {
  id: string;
  programId: string;
  classId: number;
  programName: string;
  instructor: string;
  instructorInitials: string;
  duration: string;
  enrolledAt: string;
  startDate: string;
  endDate: string;
  status: "Upcoming" | "Ongoing" | "Completed" | "Cancelled";
  progress: number;
  image: string;
  ref: string;
}

export interface UpcomingClass {
  id: number;
  title: string;
  instructor: string;
  instructorInitials: string;
  date: string;
  time: string;
  location: string;
  address: string;
  status: "Confirmed" | "Waitlisted" | "Pending";
  ref: string;
}

export interface RegistrationRecord {
  ref: string;
  programName: string;
  registeredAt: string;
  paymentStatus: "Paid" | "Pending" | "Partially Paid" | "Refunded";
  enrollmentStatus: "Confirmed" | "Pending" | "Cancelled" | "Waitlisted";
  amount: number;
}

export interface Certificate {
  id: string;
  programName: string;
  completedAt: string;
  issuedAt: string;
  certificateNumber: string;
  instructor: string;
  grade: string;
}

export interface PaymentRecord {
  ref: string;
  programName: string;
  amount: number;
  paymentMethod: "Pay on Arrival" | "Bank Transfer" | "Card" | "USSD";
  status: "Paid" | "Pending" | "Partially Paid" | "Refunded";
  date: string;
  receiptAvailable: boolean;
}

export interface Notification {
  id: string;
  type: "registration" | "reminder" | "schedule" | "certificate" | "payment" | "general";
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
}

/* ─── mock data ─── */

export const MOCK_STUDENT: StudentProfile = {
  id: "stu-001",
  firstName: "Adaeze",
  lastName: "Okonkwo",
  email: "adaeze.okonkwo@gmail.com",
  phone: "08012345678",
  studentId: "KFA-2026-0042",
  avatar: null,
  memberSince: "February 2026",
  farmingExperience: "1–3 years",
  areasOfInterest: ["Poultry", "Crop Production"],
  education: "B.Sc. Agriculture",
  occupation: "Farmer",
  state: "Ogun State",
  lga: "Ijebu Ode",
  preferredLanguage: "English",
};

export const MOCK_ENROLLMENTS: StudentEnrollment[] = [
  {
    id: "enr-001",
    programId: "crop",
    classId: 1,
    programName: "Soil Health & Crop Production",
    instructor: "Dr. Chukwuemeka Obi",
    instructorInitials: "CO",
    duration: "1 Day",
    enrolledAt: "2026-03-10",
    startDate: "2026-04-19",
    endDate: "2026-04-19",
    status: "Upcoming",
    progress: 0,
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=800",
    ref: "KFA-241019-A3X",
  },
  {
    id: "enr-002",
    programId: "livestock",
    classId: 2,
    programName: "Livestock & Poultry Management",
    instructor: "Alhaji Musa Garba",
    instructorInitials: "MG",
    duration: "1 Day",
    enrolledAt: "2026-03-12",
    startDate: "2026-05-03",
    endDate: "2026-05-03",
    status: "Upcoming",
    progress: 0,
    image: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?q=80&w=800",
    ref: "KFA-241503-B7Y",
  },
  {
    id: "enr-003",
    programId: "agribusiness",
    classId: 4,
    programName: "Agribusiness & Farm Finance",
    instructor: "Mr. Tunde Adeyemi",
    instructorInitials: "TA",
    duration: "1 Day",
    enrolledAt: "2025-11-02",
    startDate: "2025-12-07",
    endDate: "2025-12-07",
    status: "Completed",
    progress: 100,
    image: "https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=800",
    ref: "KFA-231207-C2Z",
  },
];

export const MOCK_UPCOMING_CLASSES: UpcomingClass[] = [
  {
    id: 1,
    title: "Soil Health & Crop Production",
    instructor: "Dr. Chukwuemeka Obi",
    instructorInitials: "CO",
    date: "April 19, 2026",
    time: "9:00 AM – 3:00 PM",
    location: "Kuyash Farm, Lagos",
    address: "Kuyash Integrated Farm, Ikorodu Road, Lagos State",
    status: "Confirmed",
    ref: "KFA-241019-A3X",
  },
  {
    id: 2,
    title: "Livestock & Poultry Management",
    instructor: "Alhaji Musa Garba",
    instructorInitials: "MG",
    date: "May 3, 2026",
    time: "8:00 AM – 4:00 PM",
    location: "Kuyash Farm, Lagos",
    address: "Kuyash Integrated Farm, Ikorodu Road, Lagos State",
    status: "Confirmed",
    ref: "KFA-241503-B7Y",
  },
];

export const MOCK_REGISTRATIONS: RegistrationRecord[] = [
  {
    ref: "KFA-241019-A3X",
    programName: "Soil Health & Crop Production",
    registeredAt: "2026-03-10",
    paymentStatus: "Pending",
    enrollmentStatus: "Confirmed",
    amount: 25000,
  },
  {
    ref: "KFA-241503-B7Y",
    programName: "Livestock & Poultry Management",
    registeredAt: "2026-03-12",
    paymentStatus: "Pending",
    enrollmentStatus: "Confirmed",
    amount: 30000,
  },
  {
    ref: "KFA-231207-C2Z",
    programName: "Agribusiness & Farm Finance",
    registeredAt: "2025-11-02",
    paymentStatus: "Paid",
    enrollmentStatus: "Confirmed",
    amount: 20000,
  },
];

export const MOCK_CERTIFICATES: Certificate[] = [
  {
    id: "cert-001",
    programName: "Agribusiness & Farm Finance",
    completedAt: "December 7, 2025",
    issuedAt: "December 14, 2025",
    certificateNumber: "KFA-CERT-2025-0312",
    instructor: "Mr. Tunde Adeyemi",
    grade: "Distinction",
  },
];

export const MOCK_PAYMENTS: PaymentRecord[] = [
  {
    ref: "KFA-241019-A3X",
    programName: "Soil Health & Crop Production",
    amount: 25000,
    paymentMethod: "Pay on Arrival",
    status: "Pending",
    date: "2026-04-19",
    receiptAvailable: false,
  },
  {
    ref: "KFA-241503-B7Y",
    programName: "Livestock & Poultry Management",
    amount: 30000,
    paymentMethod: "Pay on Arrival",
    status: "Pending",
    date: "2026-05-03",
    receiptAvailable: false,
  },
  {
    ref: "KFA-231207-C2Z",
    programName: "Agribusiness & Farm Finance",
    amount: 20000,
    paymentMethod: "Pay on Arrival",
    status: "Paid",
    date: "2025-12-07",
    receiptAvailable: true,
  },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-001",
    type: "registration",
    title: "Registration Confirmed",
    body: "Your registration for Soil Health & Crop Production has been confirmed.",
    timestamp: "2026-03-10T09:30:00",
    read: false,
  },
  {
    id: "notif-002",
    type: "reminder",
    title: "Class Reminder",
    body: "Soil Health & Crop Production starts in 7 days. Venue: Kuyash Farm, Lagos.",
    timestamp: "2026-04-12T08:00:00",
    read: false,
  },
  {
    id: "notif-003",
    type: "certificate",
    title: "Certificate Available",
    body: "Your certificate for Agribusiness & Farm Finance is ready to download.",
    timestamp: "2025-12-14T10:00:00",
    read: true,
  },
  {
    id: "notif-004",
    type: "payment",
    title: "Payment Reminder",
    body: "Payment of ₦25,000 for Soil Health & Crop Production is due on arrival (April 19).",
    timestamp: "2026-04-10T08:00:00",
    read: true,
  },
  {
    id: "notif-005",
    type: "registration",
    title: "Registration Confirmed",
    body: "Your registration for Livestock & Poultry Management has been confirmed.",
    timestamp: "2026-03-12T11:00:00",
    read: true,
  },
];
