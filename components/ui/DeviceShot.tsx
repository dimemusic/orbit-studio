import Image from "next/image";
import type { ReactNode } from "react";

type Props = {
  src: string;
  /** custom screen content (e.g. cycling screenshots) in place of the single `src` image; glare stays on top */
  screen?: ReactNode;
  /** case colour: the light the screen throws on the "desk" behind it */
  color: string;
  variant?: "monitor" | "laptop";
  sizes: string;
  className?: string;
};

/**
 * A screenshot shown as if photographed on a real screen: device in perspective, bezel, glass glare,
 * the screen's own light spilling behind it. Follows the pointer (CardFx `data-tilt-inner` writes --rx / --ry
 * on the parent card) and turns a little more toward the viewer on hover. Purely decorative (aria-hidden).
 */
export function DeviceShot({ src, screen, color, variant = "laptop", sizes, className = "" }: Props) {
  return (
    <span aria-hidden="true" className={`device-stage ${className}`} style={{ ["--c" as string]: color }}>
      {/* light spill: blurred copy of the screen behind the device */}
      <span className="device-spill">
        <Image src={src} alt="" fill sizes="400px" className="object-cover object-top" />
      </span>
      <span className={`device device-${variant}`}>
        <span className="device-bezel">
          <span className="device-screen">
            {screen ?? <Image src={src} alt="" fill sizes={sizes} className="object-cover object-top" />}
            <span className="device-glare" />
          </span>
        </span>
        {variant === "monitor" ? (
          <>
            <span className="device-neck" />
            <span className="device-foot" />
          </>
        ) : (
          <span className="device-deck" />
        )}
      </span>
    </span>
  );
}
