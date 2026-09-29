import Link from "next/link";
import type { IconType } from "react-icons";

/** Row of pill links, e.g. role filter: ទាំងអស់ | គ្រូ | ឪពុកម្ដាយ ... */
export function FilterTabs({
  tabs,
  active,
}: {
  tabs: { label: string; href: string; value: string; icon?: IconType }[];
  active: string;
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <Link
          key={tab.value}
          href={tab.href}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm ${
            tab.value === active
              ? "bg-brand text-white"
              : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
          }`}
        >
          {tab.icon && <tab.icon size={15} />}
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
