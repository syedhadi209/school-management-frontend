"use client";

import { FundsManager } from "@/components/funds/funds-manager";

export default function SchoolAdminFundsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Funds</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create and assign school funds. Collect payments in Fees.
        </p>
      </div>
      <FundsManager feesHref="/school-admin/fees" />
    </div>
  );
}
