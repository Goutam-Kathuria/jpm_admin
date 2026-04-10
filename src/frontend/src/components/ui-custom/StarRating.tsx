import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap = { sm: "w-3 h-3", md: "w-4 h-4", lg: "w-5 h-5" };

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <fieldset className="flex items-center gap-0.5 border-0 p-0 m-0">
      <legend className="sr-only">{`Rating: ${value} out of 5`}</legend>
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange?.(star)}
          className={cn(
            "transition-transform duration-150",
            !readonly &&
              "hover:scale-110 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm",
            readonly && "cursor-default",
          )}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          data-ocid={readonly ? undefined : `star-${star}`}
        >
          <Star
            className={cn(
              sizeMap[size],
              star <= value
                ? "fill-primary text-primary"
                : "fill-transparent text-muted-foreground/40",
            )}
          />
        </button>
      ))}
    </fieldset>
  );
}
