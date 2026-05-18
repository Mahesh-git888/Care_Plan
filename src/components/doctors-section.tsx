import Image from "next/image";

type Doctor = {
  name: string;
  role: string;
  image: string;
  alt: string;
  bio: string;
};

const DOCTORS: Doctor[] = [
  {
    name: "Dr. Kavitha S Manjunath",
    role: "Clinical Head — Primary, Preventive & Elderly Care",
    image: "/dr-kavitha.avif",
    alt: "Portrait of Dr. Kavitha S Manjunath",
    bio: "17+ years across infectious disease, chronic disease, palliative and elderly care. MBBS from Al Ameen Medical College, DNB in Family Medicine from The Bangalore Hospital. Has led Portea's preventive and primary care services for the last six years and is a member of the Family Physician Association. Co-authors the elder-care and post-discharge clinical protocols every Portea CM works to.",
  },
  {
    name: "Dr. Allia Rahaman",
    role: "Clinical Head — South",
    image: "/dr-alia.avif",
    alt: "Portrait of Dr. Allia Rahaman",
    bio: "11 years in chronic disease, emergency medicine and critical care. Trained at GB Pant Hospital and NRHM (A & N Islands) where she ran ICU duties for most of her tenure, then worked as Consultant Physician with V-Health by Aetna (CVS Health). Certified in Diabetes Management (BMJ Fortis) and in ACLS, BLS and PALS by the American Heart Association. Owns dementia-care protocol design at Portea South.",
  },
];

export function DoctorsSection({ verticalLabel }: { verticalLabel?: string }) {
  return (
    <section id="doctors" className="bg-[#e8f6f7]">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-10">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0b7c87]">
            The doctors behind your{verticalLabel ? ` ${verticalLabel.toLowerCase()}` : "ir"} care plan
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.04em] text-[#10242b] sm:text-4xl">
            Real clinicians. Not a brand name.
          </h2>
          <p className="mt-4 text-base font-medium leading-8 text-[#34555d]">
            Every Portea care plan is written against protocols these two doctors maintain, and reviewed monthly for quality. If your case needs a specialist call, it goes to one of them — not a triage queue.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {DOCTORS.map((doc) => (
            <article
              key={doc.name}
              className="overflow-hidden rounded-[2rem] border border-[#c4e5e1] bg-white/95 shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:gap-6 sm:p-7">
                <div className="relative h-32 w-32 flex-none overflow-hidden rounded-2xl bg-[#e8f6f7] sm:h-36 sm:w-36">
                  <Image
                    src={doc.image}
                    alt={doc.alt}
                    width={288}
                    height={288}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl font-semibold leading-tight tracking-[-0.02em] text-[#0b7c87]">
                    {doc.name}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-[#34555d]">{doc.role}</p>
                  <p className="mt-4 text-sm leading-7 text-[#34555d]">{doc.bio}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
