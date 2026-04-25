export default async function AdminPedidoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Admin — Pedido #{id}</h1>
      <p className="text-gray-500 mt-2">En construcción</p>
    </main>
  );
}
