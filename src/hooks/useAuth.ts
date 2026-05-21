import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function useAuth() {
  const navigate = useNavigate();
  const { setToken } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),
    onSuccess: (token, variables) => {
      setToken(token, variables.email);
      toast.success('Login successful');
      navigate('/dashboard');
    },
    onError: () => {
      toast.error('Invalid credentials');
    },
  });

  const signupMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.signup(email, password),
    onSuccess: () => {
      toast.success('Account created successfully');
      navigate('/login');
    },
    onError: () => {
      toast.error('Failed to create account');
    },
  });

  return {
    login: loginMutation.mutate,
    signup: signupMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isSigningUp: signupMutation.isPending,
  };
}
