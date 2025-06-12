
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Heart, Target, Users } from 'lucide-react';
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
      // For demo purposes, we'll simulate a successful donation
      // In a real app, you would integrate with Stripe here
      
      const { error } = await supabase
        .from('donations')
        .insert({
          amount: Math.round(donationAmount * 100), // Convert to cents
          donor_name: donorName.trim() || 'Anonymous',
          message: message.trim() || null,
          anonymous_user_id: getAnonymousUserId(),
          status: 'completed' // In real app, this would be 'pending' until payment confirmation
        });

      if (error) throw error;

      toast({
        title: "Thank you!",
        description: `Your donation of $${donationAmount.toFixed(2)} has been recorded. Together we can make a difference!`
      });

      // Reset form
      setAmount('');
      setDonorName('');
      setMessage('');
      
      // Refresh stats
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
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">Support Youth Voices</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Help us empower young people to share their stories, connect with their communities, 
          and create positive change in the world.
        </p>
      </div>

      {/* Progress Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6" />
            Fundraising Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Raised: ${(totalRaised / 100).toFixed(2)}</span>
              <span>Goal: ${(fundraisingGoal / 100).toFixed(2)}</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary">
                ${(totalRaised / 100).toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Raised</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
                <Users className="h-5 w-5" />
                {donationCount}
              </div>
              <div className="text-sm text-muted-foreground">Supporters</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Donation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500" />
            Make a Donation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDonation} className="space-y-6">
            <div className="space-y-3">
              <Label>Quick Amount</Label>
              <div className="grid grid-cols-5 gap-2">
                {quickAmounts.map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    type="button"
                    variant={amount === quickAmount.toString() ? "default" : "outline"}
                    onClick={() => setAmount(quickAmount.toString())}
                    className="w-full"
                  >
                    ${quickAmount}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-amount">Custom Amount ($)</Label>
              <Input
                id="custom-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
                step="0.01"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="donor-name">Your Name (Optional)</Label>
              <Input
                id="donor-name"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="Enter your name or leave blank for anonymous"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Leave a message of support..."
                rows={3}
                maxLength={500}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : `Donate $${amount ? parseFloat(amount).toFixed(2) : '0.00'}`}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Impact Section */}
      <Card>
        <CardHeader>
          <CardTitle>Your Impact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-green-600">$25</div>
              <p className="text-sm text-muted-foreground">
                Provides platform hosting for 100 youth posts
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-blue-600">$50</div>
              <p className="text-sm text-muted-foreground">
                Supports moderation tools and community safety
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-purple-600">$100</div>
              <p className="text-sm text-muted-foreground">
                Funds educational workshops and youth outreach
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DonationPage;
