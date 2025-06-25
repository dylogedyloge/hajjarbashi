import Image from "next/image";
import { Clock, Weight } from "lucide-react";

interface AdCardProps {
  ad: {
    id: string;
    image: string;
    stone_type: string;
    origin: string;
    form: string;
    surface: string;
    source_port?: string;
    color: string;
    size?: string;
    price: number;
    price_unit: string;
    published_at: string;
    is_featured: boolean;
    is_express: boolean;
    description: string;
    weight?: number | string;
  };
}

const AdCard = ({ ad }: AdCardProps) => {
  return (
    <div className="flex flex-col md:flex-row bg-background rounded-2xl shadow-sm border border-muted overflow-hidden w-full">
      {/* Image & Badge */}
      <div className="relative md:w-80 w-full aspect-square md:aspect-auto flex-shrink-0">
        <Image
          src={ad.image}
          alt={ad.stone_type}
          fill
          className="object-cover w-full h-full md:static md:w-80 md:h-64 rounded-2xl md:rounded-2xl md:rounded-r-none"
        />
        {ad.is_featured && (
          <span className="absolute top-3 left-3 bg-sky-400 text-white text-xs font-semibold px-3 py-1 rounded-lg shadow">
            NEW
          </span>
        )}
      </div>
      {/* Content */}
      <div className="flex-1 flex flex-col p-4 md:p-8 gap-2 md:gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 md:gap-0">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-bold text-foreground">
              USD {ad.price.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">
              /{ad.price_unit?.toLowerCase()}
            </span>
          </div>
        </div>
        <div className="text-sm text-muted-foreground font-medium">
          {ad.stone_type}
        </div>
        <div className="text-sm text-foreground line-clamp-2 md:line-clamp-3">
          {ad.description}
        </div>
        {/* Icons and Info */}
        <div className="flex items-center gap-4 text-muted-foreground text-xs mt-1">
          <span className="flex items-center gap-1">
            <Clock size={16} /> {ad.published_at}
          </span>
          {ad.weight && (
            <span className="flex items-center gap-1">
              <Weight size={16} /> {ad.weight} KG
            </span>
          )}
          {/* Color dots (show if color is present and is a comma/space separated list) */}
          {ad.color && (
            <span className="flex items-center gap-1">
              {ad.color.split(/[,\s]+/).map((c, i) => (
                <span
                  key={i}
                  className="w-4 h-4 rounded-full border border-muted bg-neutral-200 inline-block"
                  title={c}
                />
              ))}
            </span>
          )}
        </div>
        {/* Overview Table */}
        <div className="mt-2">
          <div className="font-semibold text-sm mb-1">Overview:</div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-x-4 gap-y-1 text-xs md:text-sm">
            <div>
              <div>Form</div>
              <div className="font-bold">{ad.form}</div>
            </div>
            <div>
              <div>Origin</div>
              <div className="font-bold">{ad.origin}</div>
            </div>
            {ad.color && (
              <div>
                <div>Color</div>
                <div className="font-bold">{ad.color}</div>
              </div>
            )}
            {ad.surface && (
              <div>
                <div>Surface</div>
                <div className="font-bold">{ad.surface}</div>
              </div>
            )}
            {ad.size && (
              <div>
                <div>Size</div>
                <div className="font-bold">{ad.size}</div>
              </div>
            )}
            {ad.weight && (
              <div>
                <div>Weight</div>
                <div className="font-bold">{ad.weight} KG</div>
              </div>
            )}
            {ad.source_port && (
              <div>
                <div>Source Port</div>
                <div className="font-bold">{ad.source_port}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdCard;
