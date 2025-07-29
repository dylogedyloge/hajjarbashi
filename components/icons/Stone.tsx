import React from "react";
import Image from "next/image";

interface StoneProps {
  className?: string;
  size?: number;
}

const Stone: React.FC<StoneProps> = ({ className, size = 24 }) => (
  <Image
    src="/custome-icons/Stone.png"
    alt="Stone"
    width={size}
    height={size}
    className={className}
  />
);

export default Stone; 