import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Gift, X, Sparkles, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLocation } from "wouter";

export function WeeklyRewardBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [bannerState, setBannerState] = useState<'claim' | 'celebration' | 'donate'>('claim');
  const [, setLocation] = useLocation();
  
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
        setBannerState('celebration');
        toast.success(data.message, {
          duration: 5000,
          icon: <Sparkles className="h-5 w-5 text-yellow-500" />,
        });
        // Show celebration briefly, then show donate option
        const timer = setTimeout(() => {
          setBannerState('donate');
        }, 2500);
        return () => clearTimeout(timer);
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
      setBannerState('claim');
    }
  }, [rewardStatus, isLoading]);

  const handleDonateClick = () => {
    setIsVisible(false);
    setLocation('/charities');
  };

  if (!isVisible || isLoading) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 max-w-sm transition-all duration-500 ${bannerState === 'celebration' ? 'scale-110' : 'scale-100'}`}>
      <div className={`relative overflow-hidden rounded-lg border shadow-lg ${
        bannerState === 'celebration'
          ? 'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500' 
          : bannerState === 'donate'
            ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-red-500'
            : 'bg-gradient-to-r from-primary/90 to-primary'
      }`}>
        {/* Celebration sparkles */}
        {bannerState === 'celebration' && (
          <div className="absolute inset-0 pointer-events-none">
            <Sparkles className="absolute top-2 left-4 h-4 w-4 text-white animate-pulse" />
            <Sparkles className="absolute top-4 right-8 h-3 w-3 text-yellow-200 animate-pulse delay-100" />
            <Sparkles className="absolute bottom-3 left-8 h-3 w-3 text-white animate-pulse delay-200" />
            <Sparkles className="absolute bottom-2 right-4 h-4 w-4 text-yellow-200 animate-pulse delay-300" />
          </div>
        )}
        
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors z-10"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="p-4 text-white">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-full ${bannerState === 'celebration' || bannerState === 'donate' ? 'bg-white/30' : 'bg-white/20'}`}>
              {bannerState === 'donate' ? (
                <Heart className="h-6 w-6" />
              ) : (
                <Gift className={`h-6 w-6 ${bannerState === 'celebration' ? 'animate-bounce' : ''}`} />
              )}
            </div>
            <div className="flex-1">
              {bannerState === 'celebration' && (
                <>
                  <h3 className="font-semibold text-lg">Congratulations!</h3>
                  <p className="text-sm text-white/90 mt-1">
                    You earned 5 tokens! 🎉
                  </p>
                  <p className="text-xs text-white/70 mt-2">
                    Loading donate options...
                  </p>
                </>
              )}
              
              {bannerState === 'donate' && (
                <>
                  <h3 className="font-semibold text-lg">Make a Difference!</h3>
                  <p className="text-sm text-white/90 mt-1">
                    Donate your tokens to support a charity of your choice.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      onClick={handleDonateClick}
                      className="bg-white text-rose-600 hover:bg-white/90 font-medium"
                      size="sm"
                    >
                      Donate Now
                    </Button>
                    <Button
                      onClick={() => setIsVisible(false)}
                      variant="ghost"
                      className="text-white hover:bg-white/20 font-medium"
                      size="sm"
                    >
                      Maybe Later
                    </Button>
                  </div>
                </>
              )}
              
              {bannerState === 'claim' && (
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
