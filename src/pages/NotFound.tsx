import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import SeoHead from "@/components/seo/SeoHead";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-6">
      <SeoHead
        title="404 — Pagina nu există | CEO Mind OS"
        description="Ruta cerută nu face parte din CEO Mind OS. Întoarce-te la pagina principală pentru a continua."
        noindex
      />
      <div className="text-center max-w-md">
        <div className="font-display text-primary text-7xl md:text-8xl font-semibold tracking-tight mb-4">
          404
        </div>
        <div className="h-px w-16 bg-primary/40 mx-auto mb-6" />
        <h1 className="font-display text-2xl md:text-3xl font-semibold mb-3">
          Ruta nu există
        </h1>
        <p className="text-muted-foreground mb-8 text-sm md:text-base">
          Pagina <code className="text-foreground/80">{location.pathname}</code> nu face parte din CEO Mind OS.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 underline underline-offset-4 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Înapoi la Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
