export default function ViewYourAdsPage() {
  return (
    <div className="w-full max-w-3xl bg-card rounded-xl border p-8 flex flex-col gap-8 shadow-sm mb-12">
      <h2 className="text-2xl font-semibold">View Your Ads</h2>
      <p className="text-muted-foreground">Your advertisements will appear here.</p>
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h3 className="font-medium">Sample Advertisement</h3>
          <p className="text-sm text-muted-foreground">This is where your ad content would be displayed.</p>
        </div>
      </div>
    </div>
  );
} 