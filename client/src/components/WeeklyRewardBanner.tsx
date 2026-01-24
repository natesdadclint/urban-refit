import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Gift, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function WeeklyRewardBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const { data: rewardStatus, isLoading } = trpc.customerProfile.getWeeklyRewardStatus.useQuery(
    undefined,
    { 
      refetchOnWindowFocus: false,
      retry: false 
    }
  );
  
  const claimReward = trpc.customerProfile.claimWeeklyReward.useMutation({
    onSuccess: (data) => {
      if (data.awarded) {
        setShowCelebration(true);
        toast.success(data.message, {
          duration: 5000,
          icon: <Sparkles className="h-5 w-5 text-yellow-500" />,
        });
        setTimeout(() => {
          setShowCelebration(false);
          setIsVisible(false);
        }, 3000);
      } else {
        toast.info(data.message);
        setIsVisible(false);
      }
    },
    onError: (error) => {
      toast.error("Failed to claim reward. Please try again.");
    }
  });

  useEffect(() => {
    if (rewardStatus?.eligible && !isLoading) {
      setIsVisible(true);
    }
  }, [rewardStatus, isLoading]);

  if (!isVisible || isLoading) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 max-w-sm transition-all duration-500 ${showCelebration ? 'scale-110' : 'scale-100'}`}>
      <div className={`relative overflow-hidden rounded-lg border shadow-lg ${showCelebration ? 'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500' : 'bg-gradient-to-r from-primary/90 to-primary'}`}>
        {/* Celebration sparkles */}
        {showCelebration && (
          <div className="absolute inset-0 pointer-events-none">
            <Sparkles className="absolute top-2 left-4 h-4 w-4 text-white animate-pulse" />
            <Sparkles className="absolute top-4 right-8 h-3 w-3 text-yellow-200 animate-pulse delay-100" />
            <Sparkles className="absolute bottom-3 left-8 h-3 w-3 text-white animate-pulse delay-200" />
            <Sparkles className="absolute bottom-2 right-4 h-4 w-4 text-yellow-200 animate-pulse delay-300" />
          </div>
        )}
        
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="p-4 text-white">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-full ${showCelebration ? 'bg-white/30' : 'bg-white/20'}`}>
              <Gift className={`h-6 w-6 ${showCelebration ? 'animate-bounce' : ''}`} />
            </div>
            <div className="flex-1">
              {showCelebration ? (
                <>
                  <h3 className="font-semibold text-lg">Congratulations!</h3>
                  <p className="text-sm text-white/90 mt-1">
                    You earned 5 tokens! 🎉
                  </p>
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-lg">Weekly Reward Available!</h3>
                  <p className="text-sm text-white/90 mt-1">
                    Claim your 5 free tokens for logging in this week!
                  </p>
                  <Button
                    onClick={() => claimReward.mutate()}
                    disabled={claimReward.isPending}
                    className="mt-3 bg-white text-primary hover:bg-white/90 font-medium"
                    size="sm"
                  >
                    {claimReward.isPending ? "Claiming..." : "Claim Tokens"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
