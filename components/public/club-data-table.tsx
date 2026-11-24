export function ClubDataTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: Array<Array<string>>;
}) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[32rem] border-collapse text-sm">
        <thead>
          <tr className="bg-logo-blue text-left text-white">
            {columns.map((column) => (
              <th key={column} className="px-4 py-3 font-semibold">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join("-")} className="border-b border-[#e5e5e5]">
              {row.map((cell, index) => (
                <td key={`${row[0]}-${index}`} className="px-4 py-3 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
