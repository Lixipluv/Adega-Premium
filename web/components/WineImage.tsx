"use client";
import Image from "next/image";
import { useState } from "react";
import { getWineImage } from "@/lib/media";

type Props = {
  src?: string | null;
  alt: string;
  category?: string;
  className?: string;
  fill?: boolean;
  height?: number;
  priority?: boolean;
};

export function WineImage({ src, alt, category, className = "", fill, height = 128, priority }: Props) {
  const [error, setError] = useState(false);
  const resolved = error ? getWineImage(null, category) : getWineImage(src, category);

  if (fill) {
    return (
      <Image
        src={resolved}
        alt={alt}
        fill
        sizes="(max-width: 768px) 50vw, 200px"
        className={`object-contain ${className}`}
        onError={() => setError(true)}
        priority={priority}
      />
    );
  }

  return (
    <Image
      src={resolved}
      alt={alt}
      width={120}
      height={height}
      className={`object-contain ${className}`}
      onError={() => setError(true)}
      priority={priority}
    />
  );
}
