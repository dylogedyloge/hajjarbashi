import React from "react";
import Image from "next/image";

interface SlabProps {
  className?: string;
  size?: number;
}

const Slab: React.FC<SlabProps> = ({ className, size = 24 }) => (
  <Image
    src="/custome-icons/Slap.png"
    alt="Slab"
    width={size}
    height={size}
    className={className}
  />
);

export default Slab; 