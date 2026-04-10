import { Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MaintenancePage = ({ message }: { message?: string }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-background via-muted/20 to-background">
    <Card className="w-full max-w-lg border-border/50 shadow-xl animate-in fade-in zoom-in-95 duration-500">
      <CardContent className="pt-10 pb-8 px-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Wrench className="h-8 w-8 text-primary animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Sedang pemeliharaan</h1>
        <p className="text-muted-foreground leading-relaxed">
          {message || "Kami sedang memperbarui sistem. Silakan coba lagi nanti."}
        </p>
        <Button variant="outline" className="rounded-xl mt-2" asChild>
          <Link to="/login">Login admin</Link>
        </Button>
      </CardContent>
    </Card>
  </div>
);

export default MaintenancePage;
