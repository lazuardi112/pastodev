import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";

const Layout = ({ children, hideShell }: { children: ReactNode; hideShell?: boolean }) => {
  const { user } = useAuth();
  const { isOpen, toggleChat } = useChat();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {!hideShell && <Navbar />}
      <main className="flex-1">{children}</main>
      {!hideShell && <Footer />}
      <ChatWidget
        isOpen={isOpen}
        onToggle={toggleChat}
        user={user}
      />
    </div>
  );
};

export default Layout;
