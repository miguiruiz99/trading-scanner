import { Skeleton } from "@/components/ui/skeleton";

export function ScannerTableSkeleton() {
  // Cantidad de filas ficticias mientras carga
  const rows = Array.from({ length: 20 });

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-neutral-800 text-left text-sm text-neutral-400">
            <th className="p-2">Par</th>
            <th className="p-2">Precio</th>
            <th className="p-2">Score</th>
            <th className="p-2">Setups</th>
            <th className="p-2">RSI</th>
            <th className="p-2">Volumen 24h</th>
            <th className="p-2">Acción</th>
            <th className="p-2">TradingView</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((_, i) => (
            <tr key={i} className="border-b border-neutral-900">
              <td className="p-2">
                <Skeleton className="h-4 w-20" />
              </td>
              <td className="p-2">
                <Skeleton className="h-4 w-16" />
              </td>
              <td className="p-2">
                <Skeleton className="h-4 w-10" />
              </td>
              <td className="p-2">
                <Skeleton className="h-4 w-16" />
              </td>
              <td className="p-2">
                <Skeleton className="h-4 w-10" />
              </td>
              <td className="p-2">
                <Skeleton className="h-4 w-20" />
              </td>
              <td className="p-2">
                <Skeleton className="h-8 w-12 rounded-md" />
              </td>
              <td className="p-2">
                <Skeleton className="h-8 w-12 rounded-md" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
