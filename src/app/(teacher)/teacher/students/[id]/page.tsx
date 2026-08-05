"use client";

import { useParams } from "next/navigation";

import { StudentDetailView } from "@/components/students/student-detail-view";

export default function TeacherStudentDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  if (!Number.isFinite(id)) {
    return null;
  }

  return (
    <StudentDetailView
      studentId={id}
      backHref="/teacher/students"
      backLabel="Back to my students"
      mode="teacher"
    />
  );
}
