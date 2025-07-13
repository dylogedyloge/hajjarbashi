export default function AccountSettingPage() {
  return (
    <div className="w-full max-w-3xl bg-card rounded-xl border p-8 flex flex-col gap-8 shadow-sm mb-12">
      <h2 className="text-2xl font-semibold">Account Settings</h2>
      <p className="text-muted-foreground">Configure your account preferences and security settings.</p>
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h3 className="font-medium">Security Settings</h3>
          <p className="text-sm text-muted-foreground">Manage your password and security preferences.</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="font-medium">Privacy Settings</h3>
          <p className="text-sm text-muted-foreground">Control your privacy and data sharing preferences.</p>
        </div>
      </div>
    </div>
  );
} 