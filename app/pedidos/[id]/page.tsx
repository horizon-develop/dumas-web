import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Detalle del pedido",
  robots: { index: false, follow: false },
};

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold">Pedido #{id}</h1>
      <p className="text-gray-500 mt-2">Confirmación — en construcción</p>
    </main>
  );
}
