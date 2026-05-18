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
              className="flex items-center gap-4 rounded-2xl border border-[#d9e8ea] bg-white px-5 py-5 shadow-sm"
            >
              <span className="inline-flex h-12 w-12 flex-none items-center justify-center rounded-full bg-[#ff5b2e] text-white">
                <Icon className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p className="text-2xl font-semibold tracking-[-0.04em] text-[#10242b]">
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
