import { LuChartColumn, LuClipboardCheck, LuGraduationCap } from "react-icons/lu";
import { FilterTabs } from "@/components/filter-tabs";
import { Alert, PageHeader } from "@/components/ui";
import { ApiError } from "@/lib/api";

/** Title + tabs switching between the two reports. */
export function ReportsHeader({ active }: { active: "attendance" | "grades" }) {
  return (
    <>
      <PageHeader title="របាយការណ៍" icon={LuChartColumn} />
      <FilterTabs
        active={active}
        tabs={[
          { value: "attendance", label: "វត្តមាន", href: "/reports/attendance", icon: LuClipboardCheck },
          { value: "grades", label: "ពិន្ទុ", href: "/reports/grades", icon: LuGraduationCap },
        ]}
      />
    </>
  );
}

/** Shows Laravel's 422 messages (e.g. "to must be after from"). */
export function ReportError({ error }: { error: ApiError }) {
  const messages = Object.values(error.errors).flat();
  return (
    <Alert type="error">
      {messages.length > 0 ? messages.map((m) => <p key={m}>{m}</p>) : error.message}
    </Alert>
  );
}

/** Loads a report; returns the ApiError instead of throwing (-> error box). */
export async function loadReport<T>(load: () => Promise<T>): Promise<T | ApiError> {
  try {
    return await load();
  } catch (error) {
    if (error instanceof ApiError) return error;
    throw error;
  }
}
