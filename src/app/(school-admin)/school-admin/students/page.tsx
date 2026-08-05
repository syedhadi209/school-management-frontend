"use client";

import { StudentsManager } from "@/components/students/students-manager";

export default function SchoolAdminStudentsPage() {
  return <StudentsManager mode="full" detailBasePath="/school-admin/students" />;
}
