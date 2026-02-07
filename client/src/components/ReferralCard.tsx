import { useState, useEffect, useRef, useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Users, Gift, TrendingUp, Timer, Heart, Share2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const TIMER_DURATION = 10 * 60; // 10 minutes in seconds

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function ReferralCard() {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerStarted, setTimerStarted] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: referralCode, isLoading: codeLoading } = trpc.referral.getMyCode.useQuery();
  const { data: stats, isLoading: statsLoading } = trpc.referral.getMyStats.useQuery();

  // Start the 10-minute timer when the component mounts (user visits Rewards tab)
  useEffect(() => {
    // Check if timer was already started in this session
    const timerKey = 'urbanRefit_referralTimerStart';
    const storedStart = sessionStorage.getItem(timerKey);
    
    if (storedStart) {
      const elapsed = Math.floor((Date.now() - parseInt(storedStart)) / 1000);
      const remaining = TIMER_DURATION - elapsed;
      if (remaining > 0) {
        setTimeLeft(remaining);
        setTimerStarted(true);
      } else {
        setTimerExpired(true);
        setTimerStarted(true);
        setTimeLeft(0);
      }
    } else {
      // Start fresh timer
      sessionStorage.setItem(timerKey, Date.now().toString());
      setTimeLeft(TIMER_DURATION);
      setTimerStarted(true);
    }
  }, []);

  // Countdown logic
  useEffect(() => {
    if (!timerStarted || timerExpired) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setTimerExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerStarted, timerExpired]);

  const shareUrl = referralCode?.code 
    ? `${window.location.origin}/?ref=${referralCode.code}`
    : '';

  const handleCopyCode = useCallback(async () => {
    if (!referralCode?.code) return;
    try {
      await navigator.clipboard.writeText(referralCode.code);
      setCopied(true);
      toast.success('Referral code copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy code');
    }
  }, [referralCode?.code]);

  const handleCopyLink = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      toast.success('Share link copied!');
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  }, [shareUrl]);

  if (codeLoading || statsLoading) {
    return (
      <Card className="border-2 border-primary/20">
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-16 bg-muted rounded"></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-20 bg-muted rounded"></div>
              <div className="h-20 bg-muted rounded"></div>
              <div className="h-20 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const timerActive = timerStarted && !timerExpired && timeLeft !== null && timeLeft > 0;
  const timerPercentage = timeLeft !== null ? (timeLeft / TIMER_DURATION) * 100 : 0;

  return (
    <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-background to-amber-50/30 relative overflow-hidden">
      {/* Urgency banner */}
      {timerActive && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-semibold">
              Refer now and earn 10 bonus tokens (donation-only)!
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white/20 rounded-full h-1.5 w-24 overflow-hidden">
              <div 
                className="bg-white h-full rounded-full transition-all duration-1000" 
                style={{ width: `${timerPercentage}%` }}
              />
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-0 font-mono text-sm">
              {formatTime(timeLeft || 0)}
            </Badge>
          </div>
        </div>
      )}

      {timerExpired && (
        <div className="bg-muted/50 px-4 py-2 flex items-center gap-2">
          <Timer className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Bonus timer expired. You can still refer friends and earn 20 tokens per completed referral.
          </span>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Share2 className="h-6 w-6 text-primary" />
              Refer a Friend
            </CardTitle>
            <CardDescription className="mt-1 text-base">
              Share Urban Refit with friends and earn tokens together. Build the circular fashion community.
            </CardDescription>
          </div>
          {timerActive && (
            <div className="hidden md:flex items-center gap-1.5 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">+10 bonus</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* How it works - concise */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-start gap-3 p-3 bg-background/80 rounded-lg border">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">1</div>
            <div>
              <p className="font-medium text-sm">Share your code</p>
              <p className="text-xs text-muted-foreground">Send your unique link to friends</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-background/80 rounded-lg border">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">2</div>
            <div>
              <p className="font-medium text-sm">Friend signs up</p>
              <p className="text-xs text-muted-foreground">They get 10 tokens on signup (within 1 week)</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-background/80 rounded-lg border">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">3</div>
            <div>
              <p className="font-medium text-sm">You earn 20 tokens</p>
              <p className="text-xs text-muted-foreground">When they make their first purchase</p>
            </div>
          </div>
        </div>

        {/* Timer bonus callout */}
        {timerActive && (
          <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <Heart className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-900">
                Refer within {formatTime(timeLeft || 0)} to earn 10 bonus tokens for charity donations!
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Bonus tokens can only be donated to a charity of your choice -- spread the love.
              </p>
            </div>
          </div>
        )}

        {/* Referral Code + Share Link */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Your Referral Code</label>
            <div className="flex gap-2">
              <Input
                value={referralCode?.code || ''}
                readOnly
                className="font-mono text-lg font-semibold tracking-wider bg-background"
              />
              <Button
                onClick={handleCopyCode}
                variant="outline"
                size="icon"
                className="shrink-0"
              >
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Share Link</label>
            <div className="flex gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="text-sm bg-background"
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="icon"
                className="shrink-0"
              >
                {linkCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Important note about 1-week window */}
        <p className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-3">
          Your friend must sign up within <strong>1 week</strong> of receiving your referral link. After 7 days, the referral link expires and they will need a new one.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t">
          <div className="text-center p-3 bg-background/80 rounded-lg border">
            <Users className="h-5 w-5 mx-auto mb-1.5 text-primary" />
            <div className="text-xl font-bold">{stats?.totalReferrals || 0}</div>
            <div className="text-xs text-muted-foreground">Total Referrals</div>
          </div>
          <div className="text-center p-3 bg-background/80 rounded-lg border">
            <TrendingUp className="h-5 w-5 mx-auto mb-1.5 text-green-600" />
            <div className="text-xl font-bold">{stats?.completedReferrals || 0}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="text-center p-3 bg-background/80 rounded-lg border">
            <Gift className="h-5 w-5 mx-auto mb-1.5 text-amber-600" />
            <div className="text-xl font-bold">
              {parseFloat(stats?.totalTokensEarned || '0').toFixed(0)}
            </div>
            <div className="text-xs text-muted-foreground">Tokens Earned</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
