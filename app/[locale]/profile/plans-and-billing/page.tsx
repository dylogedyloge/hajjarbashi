export default function PlansAndBillingPage() {
  return (
    <div className="w-full max-w-3xl bg-card rounded-xl border p-8 flex flex-col gap-8 shadow-sm mb-12">
      <h2 className="text-2xl font-semibold">Plans & Billing</h2>
      <p className="text-muted-foreground">Manage your subscription and billing information.</p>
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h3 className="font-medium">Current Plan</h3>
          <p className="text-sm text-muted-foreground">Basic Plan - $9.99/month</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="font-medium">Billing History</h3>
          <p className="text-sm text-muted-foreground">Your recent transactions will appear here.</p>
        </div>
      </div>
    </div>
  );
} 