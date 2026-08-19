import { Search, ShoppingBag, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <a href="/" className="font-serif text-xl font-bold text-inverse-surface tracking-tight">
            Mains de<span className="text-primary font-light italic"> San Pedro</span>
          </a>
          <div className="hidden md:flex items-center gap-6">
            <a href="#" className="label-caps text-muted-foreground hover:text-primary transition-colors">Galerie</a>
            <a href="#" className="label-caps text-muted-foreground hover:text-primary transition-colors">Artisans</a>
            <a href="#" className="label-caps text-muted-foreground hover:text-primary transition-colors">Collections</a>
            <a href="#" className="label-caps text-muted-foreground hover:text-primary transition-colors">À propos</a>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Search className="h-4 w-4 text-inverse-surface" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="h-4 w-4 text-inverse-surface" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full relative">
            <ShoppingBag className="h-4 w-4 text-inverse-surface" />
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[0.55rem] flex items-center justify-center font-bold">0</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
