export default function SignOutPage() {
  return (
    <div className="w-full max-w-3xl bg-card rounded-xl border p-8 flex flex-col gap-8 shadow-sm mb-12">
      <h2 className="text-2xl font-semibold">Sign Out</h2>
      <p className="text-muted-foreground">Manage your session and sign out options.</p>
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h3 className="font-medium">Current Session</h3>
          <p className="text-sm text-muted-foreground">You are currently signed in on this device.</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="font-medium">Sign Out Options</h3>
          <p className="text-sm text-muted-foreground">Choose how you want to sign out.</p>
        </div>
      </div>
    </div>
  );
} 