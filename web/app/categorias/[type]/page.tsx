import { redirect } from "next/navigation";

export default function CategoriaTypeLegacyPage({ params }: { params: { type: string } }) {
  redirect(`/explorar?category=${params.type}`);
}
