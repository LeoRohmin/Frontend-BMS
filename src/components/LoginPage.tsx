import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import logoImage from 'figma:asset/5ba82f0368645529403008088d93dd08aa4d7d70.png';

interface LoginPageProps {
  onLogin: (username: string, role: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    // Simulate API call - Ganti dengan koneksi ke backend
    setTimeout(() => {
      // Mock authentication - Ganti dengan logika backend
      if (username === 'admin' && password === 'admin123') {
        toast.success('Login successful!');
        onLogin(username, 'Admin');
      } else if (username === 'operator' && password === 'operator123') {
        toast.success('Login successful!');
        onLogin(username, 'Operator');
      } else if (username === 'technician' && password === 'tech123') {
        toast.success('Login successful!');
        onLogin(username, 'Technician');
      } else {
        toast.error('Invalid username or password');
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border border-border shadow-lg">
          <CardHeader className="space-y-4 pb-6">
            <motion.div 
              className="flex justify-center"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <img 
                src={logoImage} 
                alt="SANINDO Orisa ENOSYS" 
                className="h-30 w-auto object-contain"
              />
            </motion.div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-3">Demo Credentials:</p>
                <div className="space-y-1 bg-muted/50 p-3 rounded-lg">
                  <p><span className="font-medium">Admin:</span> admin / admin123</p>
                  <p><span className="font-medium">Operator:</span> operator / operator123</p>
                  <p><span className="font-medium">Technician:</span> technician / tech123</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center text-sm text-muted-foreground"
        >
          <p>© 2025 SANINDO Orisa ENOSYS. All rights reserved.</p>
        </motion.div>
      </motion.div>
    </div>
  );
}