import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, Users, Gift, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export function ReferralCard() {
  const [copied, setCopied] = useState(false);
  const { data: referralCode, isLoading: codeLoading } = trpc.referral.getMyCode.useQuery();
  const { data: stats, isLoading: statsLoading } = trpc.referral.getMyStats.useQuery();

  const handleCopy = async () => {
    if (!referralCode?.code) return;
    
    try {
      await navigator.clipboard.writeText(referralCode.code);
      setCopied(true);
      toast.success('Referral code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  const shareUrl = referralCode?.code 
    ? `${window.location.origin}/?ref=${referralCode.code}`
    : '';

  const handleShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  if (codeLoading || statsLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-12 bg-muted rounded"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-semibold mb-2">Refer Friends, Earn Tokens</h3>
        <p className="text-sm text-muted-foreground">
          Share your referral code and earn 20 tokens when your friend makes their first purchase. 
          They get 10 tokens just for signing up!
        </p>
      </div>

      {/* Referral Code */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Your Referral Code</label>
        <div className="flex gap-2">
          <Input
            value={referralCode?.code || ''}
            readOnly
            className="font-mono text-lg font-semibold"
          />
          <Button
            onClick={handleCopy}
            variant="outline"
            size="icon"
            className="shrink-0"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Share Link */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Share Link</label>
        <div className="flex gap-2">
          <Input
            value={shareUrl}
            readOnly
            className="text-sm"
          />
          <Button
            onClick={handleShareUrl}
            variant="outline"
            size="icon"
            className="shrink-0"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
          <div className="text-2xl font-bold">{stats?.totalReferrals || 0}</div>
          <div className="text-xs text-muted-foreground">Total Referrals</div>
        </div>
        
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
          <div className="text-2xl font-bold">{stats?.completedReferrals || 0}</div>
          <div className="text-xs text-muted-foreground">Completed</div>
        </div>
        
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <Gift className="h-6 w-6 mx-auto mb-2 text-amber-600" />
          <div className="text-2xl font-bold">
            {parseFloat(stats?.totalTokensEarned || '0').toFixed(0)}
          </div>
          <div className="text-xs text-muted-foreground">Tokens Earned</div>
        </div>
      </div>

      {/* How it works */}
      <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
        <p className="font-medium text-foreground">How it works:</p>
        <ol className="list-decimal list-inside space-y-1 ml-2">
          <li>Share your referral code or link with friends</li>
          <li>They sign up and get 10 tokens instantly</li>
          <li>When they make their first purchase, you earn 20 tokens</li>
          <li>No limit on how many friends you can refer!</li>
        </ol>
      </div>
    </Card>
  );
}
