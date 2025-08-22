import { ArrowUpDown } from "lucide-react";
import { Button } from "./ui/button";
import { SortBy } from "@/enums/enums";

export const SortButton = ({
  column,
  children,
  handleSort,
}: {
  column: SortBy;
  children: React.ReactNode;
  handleSort: (column: SortBy) => void;
}) => (
  <Button
    variant="ghost"
    size="sm"
    className="h-auto p-0 font-semibold hover:bg-transparent"
    onClick={() => handleSort(column)}
  >
    <div className="flex items-center gap-1">
      {children}
      <ArrowUpDown className="h-3 w-3" />
    </div>
  </Button>
);
