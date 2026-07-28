export default function SuperAdminBillingPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">SaaS Billing</h1>
      <p className="mt-2 text-muted-foreground">
        Plans, subscriptions, and invoices are exposed by `/api/v1/plans/`, `/api/v1/subscriptions/`, and `/api/v1/billing-invoices/`.
      </p>
    </div>
  );
}

