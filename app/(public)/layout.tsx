import Navigation from "@/components/public/navigation";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen bg-neutral-950 z-1 relative overflow-auto scroll-smooth">
      <div className="background__noisy" />
      <Navigation />
      {children}
    </div>
  );
}
