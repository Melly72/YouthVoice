
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Heart, Target, Users, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getAnonymousUserId } from '@/utils/anonymousUser';
import { useToast } from '@/hooks/use-toast';

const DonationPage: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [totalRaised, setTotalRaised] = useState(0);
  const [donationCount, setDonationCount] = useState(0);
  const { toast } = useToast();

  const fundraisingGoal = 50000; // $500.00 in cents
  const progressPercentage = Math.min((totalRaised / fundraisingGoal) * 100, 100);

  useEffect(() => {
    fetchDonationStats();
  }, []);

  const fetchDonationStats = async () => {
    try {
      const { data, error } = await supabase
        .from('donations')
        .select('amount')
        .eq('status', 'completed');

      if (error) throw error;

      const total = data?.reduce((sum, donation) => sum + donation.amount, 0) || 0;
      setTotalRaised(total);
      setDonationCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching donation stats:', error);
    }
  };

  const handleDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const donationAmount = parseFloat(amount);
    if (!donationAmount || donationAmount < 1) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid donation amount",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('donations')
        .insert({
          amount: Math.round(donationAmount * 100),
          donor_name: donorName.trim() || 'Anonymous',
          message: message.trim() || null,
          anonymous_user_id: getAnonymousUserId(),
          status: 'completed'
        });

      if (error) throw error;

      toast({
        title: "Thank you! 💖",
        description: `Your donation of $${donationAmount.toFixed(2)} helps empower young voices!`
      });

      setAmount('');
      setDonorName('');
      setMessage('');
      fetchDonationStats();
    } catch (error) {
      console.error('Error processing donation:', error);
      toast({
        title: "Error",
        description: "Failed to process donation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickAmounts = [5, 10, 25, 50, 100];

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 pt-4">
          <div className="flex items-center justify-center space-x-2">
            <Sparkles className="h-8 w-8 text-pink-500" />
            <h1 className="text-3xl font-bold text-pink-500">Support Youth</h1>
          </div>
          <p className="text-gray-300">
            Help us empower young voices and create positive change in communities worldwide.
          </p>
        </div>

        {/* Progress Card */}
        <Card className="bg-gradient-to-br from-pink-900/20 to-purple-900/20 border-pink-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Target className="h-6 w-6 text-pink-500" />
              Fundraising Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-300">
                <span>Raised: ${(totalRaised / 100).toFixed(2)}</span>
                <span>Goal: ${(fundraisingGoal / 100).toFixed(2)}</span>
              </div>
              <Progress value={progressPercentage} className="h-3 bg-gray-800" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-pink-500">
                  ${(totalRaised / 100).toFixed(2)}
                </div>
                <div className="text-sm text-gray-400">Raised</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-pink-500 flex items-center justify-center gap-1">
                  <Users className="h-5 w-5" />
                  {donationCount}
                </div>
                <div className="text-sm text-gray-400">Supporters</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Donation Form */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Heart className="h-6 w-6 text-pink-500" />
              Make a Donation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDonation} className="space-y-6">
              {/* Quick amounts */}
              <div className="space-y-3">
                <Label className="text-white">Quick Amount</Label>
                <div className="grid grid-cols-5 gap-2">
                  {quickAmounts.map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      type="button"
                      variant={amount === quickAmount.toString() ? "default" : "outline"}
                      onClick={() => setAmount(quickAmount.toString())}
                      className={`w-full text-sm ${
                        amount === quickAmount.toString()
                          ? 'bg-pink-500 text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      ${quickAmount}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom amount */}
              <div className="space-y-2">
                <Label htmlFor="custom-amount" className="text-white">Custom Amount ($)</Label>
                <Input
                  id="custom-amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="1"
                  step="0.01"
                  required
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                />
              </div>

              {/* Donor name */}
              <div className="space-y-2">
                <Label htmlFor="donor-name" className="text-white">Your Name (Optional)</Label>
                <Input
                  id="donor-name"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Anonymous"
                  maxLength={100}
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message" className="text-white">Message (Optional)</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Leave a message of support..."
                  rows={3}
                  maxLength={500}
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                />
              </div>

              {/* Submit button */}
              <Button 
                type="submit" 
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 rounded-xl transition-colors duration-200"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Heart className="w-5 h-5" />
                    <span>Donate ${amount ? parseFloat(amount).toFixed(2) : '0.00'}</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Impact section */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Your Impact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">$25</span>
                <span className="text-sm text-gray-400">Platform hosting for 100 posts</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">$50</span>
                <span className="text-sm text-gray-400">Community safety & moderation</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">$100</span>
                <span className="text-sm text-gray-400">Youth workshops & outreach</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DonationPage;
