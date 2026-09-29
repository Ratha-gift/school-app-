"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { LuRefreshCw, LuTriangleAlert } from "react-icons/lu";
import { Alert, btnPrimary } from "@/components/ui";

// Shown when a page throws (e.g. Laravel is down or returns 500).
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="flex items-center gap-2 text-2xl font-semibold">
        <LuTriangleAlert className="text-red-600" />
        មានបញ្ហាកើតឡើង
      </h1>
      <Alert type="error">
        មិនអាចផ្ទុកទំព័រនេះបានទេ។ សូមប្រាកដថា Laravel API កំពុងដំណើរការ ហើយព្យាយាមម្ដងទៀត។
      </Alert>
      <button onClick={() => retry()} className={btnPrimary}>
        <LuRefreshCw size={16} />
        ព្យាយាមម្ដងទៀត
      </button>
    </div>
  );
}
