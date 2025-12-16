import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PremiumModalProps {
  open: boolean;
  onClose: () => void;
  toolName?: string;
}

export function PremiumModal({ open, onClose, toolName }: PremiumModalProps) {
  const navigate = useNavigate();

  const handleViewPlans = () => {
    onClose();
    navigate("/pricing");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Crown className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            Upgrade to Premium
          </DialogTitle>
          <DialogDescription className="text-center text-base mt-2">
            {toolName ? (
              <>
                <span className="font-semibold text-foreground">{toolName}</span> is a premium tool.
              </>
            ) : (
              "This is a premium feature."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
            <span>Access to all 160+ AI tools</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
            <span>Higher usage limits & priority support</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
            <span>Export, download & API access</span>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <Button onClick={handleViewPlans} className="w-full" size="lg">
            View Plans & Pricing
          </Button>
          <Button onClick={onClose} variant="ghost" className="w-full">
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
