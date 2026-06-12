export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-obsidian-950 flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto" />
        <p className="text-slate-400 text-lg animate-pulse">Loading your dashboard...</p>
      </div>
    </div>
  );
}