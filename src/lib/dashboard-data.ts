import {
  BookOpen,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  FileText,
  GraduationCap,
  School,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";

import type { StatCardProps } from "@/components/dashboard/stat-card";
import type { ActivityItem } from "@/components/dashboard/activity-feed";
import type { QuickActionItem } from "@/components/dashboard/quick-actions";

interface DashboardData {
  stats: StatCardProps[];
  activity: ActivityItem[];
  quickActions: QuickActionItem[];
}

export const schoolAdminDashboard: DashboardData = {
  stats: [
    { label: "Active Students", value: "1,578", trend: { value: "168%", up: true }, icon: Users, tint: "bg-blue-100 text-blue-600" },
    { label: "Pending Admissions", value: "46", trend: { value: "12%", up: true }, icon: UserCheck, tint: "bg-amber-100 text-amber-600" },
    { label: "Total Classes", value: "45", trend: { value: "8%", up: true }, icon: GraduationCap, tint: "bg-emerald-100 text-emerald-600" },
    { label: "Fee Collection", value: "78%", trend: { value: "5%", up: true }, icon: CreditCard, tint: "bg-orange-100 text-orange-600" },
  ],
  activity: [
    { icon: CheckCircle2, tint: "bg-emerald-100 text-emerald-600", title: "Student Registration Approved", subtitle: "Khalid Jamal — Grade 10A", time: "33 mins ago" },
    { icon: CalendarClock, tint: "bg-blue-100 text-blue-600", title: "Class Schedule Updated", subtitle: "Mathematics 10A — Room changed to 201", time: "33 mins ago" },
    { icon: UserCheck, tint: "bg-red-100 text-red-600", title: "Pending Registration Review", subtitle: "Khalid Jamal — Grade 10A", time: "33 mins ago" },
    { icon: GraduationCap, tint: "bg-amber-100 text-amber-600", title: "New Class Created", subtitle: "Khalid Jamal's Class — Grade 12 MWF", time: "33 mins ago" },
  ],
  quickActions: [
    { icon: Users, tint: "bg-blue-100 text-blue-600", title: "Register Student", subtitle: "Add new student", href: "/school-admin/students" },
    { icon: GraduationCap, tint: "bg-emerald-100 text-emerald-600", title: "Create Class", subtitle: "Set up Class 1, Class 2…", href: "/school-admin/classes" },
    { icon: FileText, tint: "bg-orange-100 text-orange-600", title: "Manage Exams", subtitle: "Midterms, finals & publish", href: "/school-admin/exams" },
    { icon: CreditCard, tint: "bg-purple-100 text-purple-600", title: "Generate Invoice", subtitle: "Create fee invoice", href: "/school-admin/fees" },
  ],
};

export const managerDashboard: DashboardData = {
  stats: [
    { label: "Classes Scheduled", value: "52", trend: { value: "4%", up: true }, icon: CalendarClock, tint: "bg-blue-100 text-blue-600" },
    { label: "Promotions Pending", value: "18", trend: { value: "6%", up: false }, icon: TrendingUp, tint: "bg-amber-100 text-amber-600" },
    { label: "Teachers", value: "34", trend: { value: "2%", up: true }, icon: Users, tint: "bg-emerald-100 text-emerald-600" },
    { label: "Timetable Conflicts", value: "3", trend: { value: "25%", up: false }, icon: CalendarClock, tint: "bg-red-100 text-red-600" },
  ],
  activity: [
    { icon: CalendarClock, tint: "bg-blue-100 text-blue-600", title: "Timetable Published", subtitle: "Grade 10 — Spring term", time: "1 hr ago" },
    { icon: TrendingUp, tint: "bg-emerald-100 text-emerald-600", title: "Promotion Approved", subtitle: "Grade 9A — 32 students promoted", time: "2 hrs ago" },
    { icon: Users, tint: "bg-amber-100 text-amber-600", title: "New Teacher Added", subtitle: "Fatima Noor — Mathematics", time: "3 hrs ago" },
  ],
  quickActions: [
    { icon: CalendarClock, tint: "bg-blue-100 text-blue-600", title: "Manage Timetable", subtitle: "View or edit schedules", href: "/manager/timetable" },
    { icon: FileText, tint: "bg-orange-100 text-orange-600", title: "Manage Exams", subtitle: "Midterms, finals & publish", href: "/manager/exams" },
    { icon: TrendingUp, tint: "bg-emerald-100 text-emerald-600", title: "Process Promotions", subtitle: "Review pending promotions", href: "/manager/promotions" },
  ],
};

export const teacherDashboard: DashboardData = {
  stats: [
    { label: "My Classes", value: "6", icon: GraduationCap, tint: "bg-blue-100 text-blue-600" },
    { label: "My Students", value: "192", trend: { value: "3%", up: true }, icon: Users, tint: "bg-emerald-100 text-emerald-600" },
    { label: "Pending Mark Entry", value: "4", trend: { value: "2", up: false }, icon: FileText, tint: "bg-amber-100 text-amber-600" },
    { label: "Today's Sessions", value: "5", icon: CalendarClock, tint: "bg-purple-100 text-purple-600" },
  ],
  activity: [
    { icon: FileText, tint: "bg-blue-100 text-blue-600", title: "Marks Submitted", subtitle: "English 10A — Midterm", time: "2 hrs ago" },
    { icon: UserCheck, tint: "bg-emerald-100 text-emerald-600", title: "Attendance Recorded", subtitle: "Math 9B — 28/30 present", time: "4 hrs ago" },
    { icon: BookOpen, tint: "bg-amber-100 text-amber-600", title: "Lesson Plan Updated", subtitle: "Physics 11A — Chapter 7", time: "1 day ago" },
  ],
  quickActions: [
    { icon: FileText, tint: "bg-blue-100 text-blue-600", title: "Enter Marks", subtitle: "Submit exam scores", href: "/teacher/marks" },
    { icon: UserCheck, tint: "bg-emerald-100 text-emerald-600", title: "Mark Attendance", subtitle: "Record today's attendance", href: "/teacher/attendance" },
  ],
};

export const parentDashboard: DashboardData = {
  stats: [
    { label: "Children", value: "2", icon: Users, tint: "bg-blue-100 text-blue-600" },
    { label: "Attendance", value: "94%", trend: { value: "2%", up: true }, icon: UserCheck, tint: "bg-emerald-100 text-emerald-600" },
    { label: "Outstanding Fees", value: "₨ 12,500", trend: { value: "due", up: false }, icon: CreditCard, tint: "bg-amber-100 text-amber-600" },
    { label: "Latest Result", value: "A+", icon: FileText, tint: "bg-purple-100 text-purple-600" },
  ],
  activity: [
    { icon: FileText, tint: "bg-blue-100 text-blue-600", title: "Report Card Published", subtitle: "Sara — Grade 8A, Term 2", time: "1 day ago" },
    { icon: CreditCard, tint: "bg-amber-100 text-amber-600", title: "Fee Reminder", subtitle: "₨ 12,500 due by Mar 15", time: "2 days ago" },
    { icon: UserCheck, tint: "bg-emerald-100 text-emerald-600", title: "Attendance Notice", subtitle: "Ali — absent on Mon, Mar 4", time: "3 days ago" },
  ],
  quickActions: [
    { icon: FileText, tint: "bg-blue-100 text-blue-600", title: "View Results", subtitle: "Published exam marks", href: "/parent/results" },
    { icon: CreditCard, tint: "bg-amber-100 text-amber-600", title: "View Invoices", subtitle: "Check fee status", href: "/parent/invoices" },
  ],
};

export const superAdminDashboard: DashboardData = {
  stats: [
    { label: "Total Schools", value: "320", trend: { value: "12%", up: true }, icon: School, tint: "bg-blue-100 text-blue-600" },
    { label: "Active Subscriptions", value: "287", trend: { value: "8%", up: true }, icon: CheckCircle2, tint: "bg-emerald-100 text-emerald-600" },
    { label: "Monthly Revenue", value: "$41.2K", trend: { value: "15%", up: true }, icon: CreditCard, tint: "bg-amber-100 text-amber-600" },
    { label: "Active Trials", value: "33", trend: { value: "4%", up: false }, icon: CalendarClock, tint: "bg-purple-100 text-purple-600" },
  ],
  activity: [
    { icon: School, tint: "bg-blue-100 text-blue-600", title: "New School Registered", subtitle: "Nova Public School — Lahore", time: "1 hr ago" },
    { icon: CreditCard, tint: "bg-emerald-100 text-emerald-600", title: "Subscription Renewed", subtitle: "Horizon Academy — Growth plan", time: "3 hrs ago" },
    { icon: CheckCircle2, tint: "bg-amber-100 text-amber-600", title: "Trial Converted", subtitle: "Crescent Grammar — Starter plan", time: "1 day ago" },
  ],
  quickActions: [
    { icon: School, tint: "bg-blue-100 text-blue-600", title: "Manage Schools", subtitle: "View all schools", href: "/super-admin/schools" },
    { icon: CreditCard, tint: "bg-emerald-100 text-emerald-600", title: "Billing Overview", subtitle: "Check revenue", href: "/super-admin/billing" },
  ],
};
