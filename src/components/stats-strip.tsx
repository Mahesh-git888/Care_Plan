import {
  HomeIcon,
  HospitalIcon,
  MapPinIcon,
  UsersIcon,
} from "@/components/ui-icons";
import { homeStats, type StatItem } from "@/data/verticals";

type IconKey = StatItem["icon"];

const ICONS: Record<IconKey, (p: { className?: string }) => React.ReactNode> = {
  users: UsersIcon,
  home: HomeIcon,
  mapPin: MapPinIcon,
  hospital: HospitalIcon,
};

export function StatsStrip() {
  return (
    <section
      className="border-y border-white/80 bg-white/70 backdrop-blur"
      aria-label="Portea by the numbers"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-5 py-8 sm:px-6 lg:grid-cols-4 lg:px-10">
        {homeStats.map((stat) => {
          const Icon = ICONS[stat.icon] ?? UsersIcon;
          return (
            <div
              key={stat.label}
              className="flex flex-col items-start gap-3 rounded-2xl border border-[#d9e8ea] bg-white px-4 py-5 shadow-sm sm:flex-row sm:items-center sm:gap-4 sm:px-5"
            >
              <span className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-full bg-[#e6f6f7] text-[#0f9aa8] sm:h-12 sm:w-12">
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </span>
              <div className="min-w-0">
                <p className="text-xl font-semibold tracking-[-0.04em] text-[#10242b] sm:text-2xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm font-medium leading-5 text-[#455e67]">
                  {stat.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
