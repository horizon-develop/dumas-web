export default async function ProductPage({
  params,
}: {
  params: Promise<{ sku: string }>;
}) {
  const { sku } = await params;

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold">Producto: {sku}</h1>
      <p className="text-gray-500 mt-2">Detalle — en construcción</p>
    </main>
  );
}
