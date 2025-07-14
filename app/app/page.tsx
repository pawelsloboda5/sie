import { HeroSection } from "@/components/layout/HeroSection";

export default function FindPage() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      
      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8">
        {/* Placeholder for Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-muted/30 rounded-lg p-8 h-96">
            <p className="text-muted-foreground mb-2 font-medium">Map View - Coming Soon</p>
            <p className="text-sm text-muted-foreground">Interactive Azure Maps will display here with provider pins</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-8 h-96">
            <p className="text-muted-foreground mb-2 font-medium">Results List - Coming Soon</p>
            <p className="text-sm text-muted-foreground">Provider cards will display here with filtering and sorting</p>
          </div>
        </div>
      </main>
    </div>
  );
}
