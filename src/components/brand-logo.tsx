import Image from "next/image";
import Link from "next/link";

export function BrandLogo() {
  return (
    <Link href="/elder-care" className="inline-flex items-center">
      <Image
        src="/portea-logo.svg"
        alt="Portea"
        width={176}
        height={45}
        priority
      />
    </Link>
  );
}
