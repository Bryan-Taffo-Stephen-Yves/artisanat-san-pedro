import TopNav from "@/components/TopNav";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import ScrollToTopButton from "@/components/ScrollToTopButton";

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell = ({ children }: AppShellProps) => {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      {/* Arrivée sur la page : le contenu monte doucement (l'en-tête reste fixe) */}
      <main className="page-rise">{children}</main>
      <Footer />
      <BottomNav />
      <ScrollToTopButton />
    </div>
  );
};

export default AppShell;
