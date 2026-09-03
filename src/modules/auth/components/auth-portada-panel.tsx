import Image from "next/image";

import { BrandMark } from "@/shared/components/brand/brand-mark";

export function AuthPortadaPanel() {
  return (
    <div className="hidden min-h-0 p-4 lg:flex lg:p-6">
      <div className="relative h-full w-full overflow-hidden rounded-3xl">
        <Image
          src="/login-portada-antofagasta.webp"
          alt="La Portada de Antofagasta"
          fill
          priority
          quality={70}
          className="object-cover"
          sizes="(min-width: 1024px) 45vw, 100vw"
        />
        <div className="absolute inset-0 bg-[#2F6BFF]/10" />
        <div className="relative flex h-full flex-col justify-between p-6">
          <BrandMark inverted />
          <div className="max-w-sm space-y-2 text-white">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/80">
              Programa Vinko Tomicic
            </p>
            <p className="text-2xl font-semibold tracking-tight">
              Estudio de ventilación mecánica invasiva
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
