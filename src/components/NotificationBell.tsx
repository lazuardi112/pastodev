import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Bell, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/AuthContext";
import apiClient from "@/services/apiClient";
import { cn } from "@/lib/utils";

type NotifRow = {
  id: number;
  title: string;
  message?: string;
  type?: string;
  level?: string;
  is_read?: boolean;
  created_at?: string;
};

export function NotificationBell() {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState<NotifRow[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [listRes, countRes] = await Promise.all([
        apiClient.get("/user/notifications", { params: { limit: 30, offset: 0 } }),
        apiClient.get("/user/notifications/unread/count"),
      ]);
      setItems(listRes.data?.data ?? []);
      setUnread(countRes.data?.data?.unread_count ?? 0);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) return;
    load();
    const t = window.setInterval(load, 45_000);
    return () => window.clearInterval(t);
  }, [isAuthenticated, load]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const markRead = async (id: number) => {
    try {
      await apiClient.put(`/user/notifications/${id}/read`);
      await load();
    } catch {
      /* */
    }
  };

  const markAllRead = async () => {
    try {
      await apiClient.put("/user/notifications/read/all");
      await load();
    } catch {
      /* */
    }
  };

  if (!user) return null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-xl relative hover:bg-accent" aria-label="Notifikasi">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center animate-pulse">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 rounded-xl border-border/50 shadow-xl">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
          <span className="text-sm font-semibold">Notifikasi</span>
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => markAllRead()} type="button">
            <Check className="h-3.5 w-3.5 mr-1" /> Baca semua
          </Button>
        </div>
        <ScrollArea className="h-[min(70vh,320px)]">
          {loading && items.length === 0 ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10 px-4">Belum ada notifikasi</p>
          ) : (
            <ul className="py-1">
              {items.map((n) => (
                <li
                  key={n.id}
                  className={cn(
                    "px-3 py-2.5 border-b border-border/40 hover:bg-muted/50 transition-colors",
                    !n.is_read && "bg-primary/5"
                  )}
                >
                  <div className="flex justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-tight">{n.title}</p>
                      {n.message ? (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-3">{n.message}</p>
                      ) : null}
                    </div>
                    {!n.is_read ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => markRead(n.id)}
                        type="button"
                        aria-label="Tandai dibaca"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
        <div className="p-2 border-t border-border/50">
          <Button variant="outline" className="w-full rounded-lg text-xs" asChild>
            <Link to="/dashboard" onClick={() => setOpen(false)}>
              Buka dashboard
            </Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
