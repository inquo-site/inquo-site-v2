import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LowCreditBannerProps {
  used: number;
  limit: number;
  /** show only when used/limit >= threshold (0–1). default 0.8 */
  threshold?: number;
}

/**
 * Contextual top-up nudge. Renders only when the user is close to their
 * monthly limit. Dismissible for the session.
 */
export const LowCreditBanner = ({
  used,
  limit,
  threshold = 0.8,
}: LowCreditBannerProps) => {
  const [dismissed, setDismissed] = useState(false);

  const ratio = useMemo(() => (limit > 0 ? used / limit : 0), [used, limit]);
  if (dismissed || limit <= 0 || ratio < threshold) return null;

  const pct = Math.min(100, Math.round(ratio * 100));

  return (
    <div className="mb-4 rounded-xl border border-accent/40 bg-accent/5 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-start gap-3 flex-1">
        <div className="w-9 h-9 rounded-lg bg-accent/15 text-accent flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">
            You've used {pct}% of your monthly quota
          </p>
          <p className="text-xs text-muted-foreground">
            Top up tokens for instant capacity, or switch to yearly and save 17%.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button asChild size="sm" variant="outline">
          <Link to="/pricing?topup=1">Top up</Link>
        </Button>
        <Button asChild size="sm">
          <Link to="/pricing?yearly=1">
            Switch to yearly <ArrowRight className="ml-1 w-3 h-3" />
          </Link>
        </Button>
        <button
          aria-label="Dismiss"
          onClick={() => setDismissed(true)}
          className="p-1 rounded hover:bg-muted text-muted-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
