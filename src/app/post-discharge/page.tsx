import { LandingPage } from "@/components/landing-page";
import { verticals } from "@/data/verticals";

export default function PostDischargePage() {
  return <LandingPage vertical={verticals["post-discharge"]} />;
}
