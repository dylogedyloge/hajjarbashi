import React from "react";
import Image from "next/image";

interface TileProps {
  className?: string;
  size?: number;
}

const Tile: React.FC<TileProps> = ({ className, size = 24 }) => (
  <Image
    src="/custome-icons/Tiles.png"
    alt="Tile"
    width={size}
    height={size}
    className={className}
  />
);

export default Tile; 