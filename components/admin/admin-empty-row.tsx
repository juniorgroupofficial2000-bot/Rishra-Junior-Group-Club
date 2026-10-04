import { TD, TR } from "@/components/ui/table";

export function AdminEmptyRow({
  colSpan,
  message = "No records match these filters.",
}: {
  colSpan: number;
  message?: string;
}) {
  return (
    <TR>
      <TD colSpan={colSpan} className="py-10 text-center text-ink-500">
        {message}
      </TD>
    </TR>
  );
}
