import TopNav from "@/components/TopNav";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import ScrollToTopButton from "@/components/ScrollToTopButton";

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell = ({ children }: AppShellProps) => (
  <div className="min-h-screen bg-background">
    <TopNav />
    <main>{children}</main>
    <Footer />
    <BottomNav />
    <ScrollToTopButton />
  </div>
);

export default AppShell;
