// The scan page is full-screen — it handles its own layout,
// bypassing the AppShell from the parent (main) layout.
export default function ScanLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
