"use client";

import { useParams } from "next/navigation";

import { StudentDetailView } from "@/components/students/student-detail-view";

export default function ManagerStudentDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  if (!Number.isFinite(id)) {
    return null;
  }

  return (
    <StudentDetailView
      studentId={id}
      backHref="/manager/students"
      backLabel="Back to students"
      mode="full"
    />
  );
}
