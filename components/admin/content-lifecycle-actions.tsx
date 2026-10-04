import { PendingSubmitButton } from "@/components/ui/pending-submit-button";

type Transition =
  | "publish"
  | "unpublish"
  | "cancel"
  | "archive"
  | "schedule";

export function ContentLifecycleActions({
  action,
  id,
  transitions,
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  transitions: Array<{ value: Transition; label: string }>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {transitions.map((item) => (
        <form key={item.value} action={action}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="transition" value={item.value} />
          <PendingSubmitButton
            pendingLabel="Saving…"
            variant="outline"
            size="sm"
          >
            {item.label}
          </PendingSubmitButton>
        </form>
      ))}
    </div>
  );
}
