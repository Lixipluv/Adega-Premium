import { getWine } from "@/lib/api";
import { notFound } from "next/navigation";
import { KioskHeader } from "@/components/KioskHeader";
import { WineFullDetail } from "@/components/WineFullDetail";

export const revalidate = 60;

export default async function WineDetailPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) notFound();

  const wine = await getWine(id).catch(() => null);
  if (!wine) notFound();

  return (
    <main className="min-h-screen bg-[#FAF6EF] kiosk-shell">
      <KioskHeader backHref="/inicio" title="Detalhes" variant="dark" />
      <section className="px-4 py-5 max-w-lg mx-auto fade-in pb-10">
        <WineFullDetail wine={wine} />
      </section>
    </main>
  );
}
