import { DashboardHeader } from "@/components/club/dashboard";
import type { ReactNode } from "react";

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <DashboardHeader title={title} description={description} actions={actions} />
  );
}
