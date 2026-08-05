"use client";

import { useParams } from "next/navigation";

import { TeacherDetailView } from "@/components/teachers/teacher-detail-view";

export default function SchoolAdminTeacherDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  if (!Number.isFinite(id)) {
    return null;
  }

  return (
    <TeacherDetailView
      teacherId={id}
      backHref="/school-admin/teachers"
      backLabel="Back to teachers"
    />
  );
}
