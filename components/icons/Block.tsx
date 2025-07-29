import React from "react";
import Image from "next/image";

interface BlockProps {
  className?: string;
  size?: number;
}

const Block: React.FC<BlockProps> = ({ className, size = 24 }) => (
  <Image
    src="/custome-icons/BLOCK 1.png"
    alt="Block"
    width={size}
    height={size}
    className={className}
  />
);

export default Block; 