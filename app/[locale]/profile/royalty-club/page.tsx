export default function RoyaltyClubPage() {
  return (
    <div className="w-full max-w-3xl bg-card rounded-xl border p-8 flex flex-col gap-8 shadow-sm mb-12">
      <h2 className="text-2xl font-semibold">Royalty Club</h2>
      <p className="text-muted-foreground">Exclusive benefits and rewards for premium members.</p>
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h3 className="font-medium">Membership Status</h3>
          <p className="text-sm text-muted-foreground">Gold Member - Active</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="font-medium">Available Rewards</h3>
          <p className="text-sm text-muted-foreground">Check your available rewards and benefits.</p>
        </div>
      </div>
    </div>
  );
} 