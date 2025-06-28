import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";

const SearchAndFilter = () => {
  return (
    <div className="flex items-center bg-background border border-border rounded-full px-3 py-2 w-full shadow-sm">
      <Search className="text-muted-foreground mr-2" size={20} />
      <div className="flex-1 flex flex-col">
        <input
          type="text"
          placeholder="Search Anything.."
          className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm placeholder:text-foreground/80 px-0 py-0 h-5"
        />
        <span className="text-xs text-muted-foreground mt-0.5">
          Stones, Marble and More..
        </span>
      </div>
      <Button variant="ghost" size="icon" className="ml-2">
        <Filter className="text-foreground" size={20} />
      </Button>
    </div>
  );
};

export default SearchAndFilter;
