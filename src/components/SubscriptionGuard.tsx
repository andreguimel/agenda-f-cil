import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { getUserProfile } from '@/services/schedulingService';

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export const SubscriptionGuard = ({ children }: SubscriptionGuardProps) => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  const { subscription, loading: subLoading, isActive, isTrialExpired } = useSubscription(clinicId);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoadingProfile(false);
        return;
      }
      
      const profile = await getUserProfile(user.id);
      if (profile?.clinic_id) {
        setClinicId(profile.clinic_id);
      }
      setLoadingProfile(false);
    };

    if (user) {
      fetchProfile();
    } else if (!authLoading) {
      setLoadingProfile(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    // Only redirect after all loading is complete
    if (authLoading || loadingProfile || subLoading) return;
    
    // If subscription exists and trial is expired or status is not active/trial
    if (subscription && (isTrialExpired() || (!isActive() && subscription.status !== 'pending'))) {
      navigate('/assinatura');
    }
  }, [subscription, authLoading, loadingProfile, subLoading, isTrialExpired, isActive, navigate]);

  if (authLoading || loadingProfile || subLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // If subscription check hasn't completed or is active, show children
  if (!subscription || isActive() || subscription.status === 'pending') {
    return <>{children}</>;
  }

  // This shouldn't render, but just in case
  return null;
};