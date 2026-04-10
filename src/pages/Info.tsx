import { useQuery } from "@tanstack/react-query";
import { Mail, MapPin, Phone, Sparkles } from "lucide-react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { publicService } from "@/services/api";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Star } from "lucide-react";

const Info = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["publicLanding"],
    queryFn: async () => (await publicService.getLanding()).data,
  });

  const contacts = data?.data?.contact_infos ?? [];
  const testimonials = data?.data?.testimonials ?? [];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="text-center max-w-2xl mx-auto mb-12 opacity-0 animate-fade-in">
          <p className="text-sm text-primary font-semibold uppercase tracking-wider mb-2 flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4" /> Informasi
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Hubungi &amp; Testimoni</h1>
          <p className="text-muted-foreground">Data diambil langsung dari database — diperbarui oleh admin.</p>
        </div>

        <section className="mb-16">
          <h2 className="text-xl font-bold mb-6">Hubungi Kami</h2>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-40 rounded-2xl" />
              ))}
            </div>
          ) : contacts.length === 0 ? (
            <Card className="rounded-2xl border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">Belum ada data kontak.</CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {contacts.map((c: { id: number; title: string; description?: string; phone?: string; email?: string; address?: string }) => (
                <Card
                  key={c.id}
                  className="rounded-2xl border-border/50 hover-lift transition-all duration-300 opacity-0 animate-slide-up"
                >
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-bold text-lg">{c.title}</h3>
                    {c.description ? <p className="text-sm text-muted-foreground leading-relaxed">{c.description}</p> : null}
                    <ul className="space-y-2 text-sm">
                      {c.phone ? (
                        <li className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4 shrink-0 text-primary" />
                          {c.phone}
                        </li>
                      ) : null}
                      {c.email ? (
                        <li className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4 shrink-0 text-primary" />
                          {c.email}
                        </li>
                      ) : null}
                      {c.address ? (
                        <li className="flex items-start gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                          {c.address}
                        </li>
                      ) : null}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-bold mb-6">Testimoni</h2>
          {isLoading ? (
            <Skeleton className="h-64 rounded-2xl w-full" />
          ) : testimonials.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">Belum ada testimoni.</p>
          ) : (
            <Carousel className="w-full max-w-4xl mx-auto">
              <CarouselContent>
                {testimonials.map(
                  (t: {
                    id: number;
                    name: string;
                    role?: string;
                    comment: string;
                    rating?: number;
                    avatar_initials?: string;
                  }) => (
                    <CarouselItem key={t.id} className="md:basis-1/2">
                      <Card className="rounded-2xl border-border/50 mx-1 h-full transition-all duration-500 hover:border-primary/20">
                        <CardContent className="p-6 space-y-4">
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < (t.rating ?? 5) ? "fill-warning text-warning" : "text-muted"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground italic leading-relaxed">&ldquo;{t.comment}&rdquo;</p>
                          <div className="flex items-center gap-3 pt-2">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-sm">
                              {(t.avatar_initials || t.name?.slice(0, 2) || "?").toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{t.name}</p>
                              {t.role ? <p className="text-xs text-muted-foreground">{t.role}</p> : null}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  )
                )}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Info;
