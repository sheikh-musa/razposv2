"use client";
import Image from "next/image";
import { useState } from "react";

interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  sizes?: string;
  fallbackSrc?: string;
}

const DEFAULT_FALLBACK = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";

export default function SafeImage({
  src,
  alt,
  width,
  height,
  fill,
  className,
  sizes,
  fallbackSrc = DEFAULT_FALLBACK,
  ...props
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  // Function to check if hostname is in our allowed list
  const isHostnameConfigured = (url: string) => {
    try {
      const urlObj = new URL(url);
      const configuredHostnames = [
        "www.spatuladesserts.com",
        "cdn.pixabay.com",
        "razpos.razcraft.com",
        "razpos.s.frappe.cloud",
        "localhost",
      ];

      // Check for exact matches
      if (configuredHostnames.includes(urlObj.hostname)) {
        return true;
      }

      // Check for localhost with different ports
      if (urlObj.hostname === "localhost") {
        return true;
      }

      return false;
    } catch {
      return false;
    }
  };

  // If hostname is not configured in next.config.js, show fallback immediately
  // This prevents the Next.js hostname error
  const shouldUseFallback = !isHostnameConfigured(src) || hasError;
  const finalSrc = shouldUseFallback ? fallbackSrc : imgSrc;

  const imageProps = {
    src: finalSrc,
    alt,
    onError: handleError,
    className,
    sizes,
    ...props,
  };

  if (fill) {
    return <Image {...imageProps} fill />;
  }

  return <Image {...imageProps} width={width || 100} height={height || 100} />;
}
