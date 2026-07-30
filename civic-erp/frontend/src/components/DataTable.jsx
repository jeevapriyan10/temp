export default function DataTable({ columns, data, onRowClick }) {
  if (!data || data.length === 0) {
    return (
      <div className="glass-card p-12 text-center animate-fadeIn">
        <div className="text-4xl mb-3">📋</div>
        <p className="text-surface-400">No data available</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden animate-fadeIn">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-700/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left px-6 py-3.5 text-xs font-semibold text-surface-400 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-700/30">
            {data.map((row, idx) => (
              <tr
                key={row.id || idx}
                onClick={() => onRowClick?.(row)}
                className="hover:bg-surface-800/50 transition-colors cursor-pointer"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-sm text-surface-200">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
