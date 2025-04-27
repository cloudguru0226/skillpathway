import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, BookOpen, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

// Login schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Registration schema
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Handle login submission
  const onLoginSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  // Handle registration submission
  const onRegisterSubmit = (data: RegisterFormData) => {
    const { confirmPassword, ...userData } = data;
    registerMutation.mutate(userData);
  };

  return (
    <div className="min-h-screen bg-background flex items-center">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row bg-card rounded-lg overflow-hidden border border-border shadow-xl max-w-6xl mx-auto">
          {/* Form Column */}
          <div className="w-full md:w-1/2 p-8 md:p-10">
            <div className="mb-8 flex items-center">
              <div className="bg-primary/10 p-2 rounded-md mr-3">
                <Code className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">DevPathways</h1>
            </div>
            
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-secondary">
                <TabsTrigger 
                  value="login" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger 
                  value="register"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Register
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-foreground">Username</Label>
                    <Input 
                      id="username" 
                      {...loginForm.register("username")} 
                      placeholder="Enter your username"
                      className="bg-background border-border"
                    />
                    {loginForm.formState.errors.username && (
                      <p className="text-destructive text-sm">{loginForm.formState.errors.username.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      {...loginForm.register("password")} 
                      placeholder="Enter your password"
                      className="bg-background border-border"
                    />
                    {loginForm.formState.errors.password && (
                      <p className="text-destructive text-sm">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full mt-8" 
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="register-username" className="text-foreground">Username</Label>
                    <Input 
                      id="register-username" 
                      {...registerForm.register("username")} 
                      placeholder="Choose a username"
                      className="bg-background border-border"
                    />
                    {registerForm.formState.errors.username && (
                      <p className="text-destructive text-sm">{registerForm.formState.errors.username.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      {...registerForm.register("email")} 
                      placeholder="Enter your email"
                      className="bg-background border-border"
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-destructive text-sm">{registerForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-foreground">Password</Label>
                    <Input 
                      id="register-password" 
                      type="password" 
                      {...registerForm.register("password")} 
                      placeholder="Create a password"
                      className="bg-background border-border"
                    />
                    {registerForm.formState.errors.password && (
                      <p className="text-destructive text-sm">{registerForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-foreground">Confirm Password</Label>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      {...registerForm.register("confirmPassword")} 
                      placeholder="Confirm your password"
                      className="bg-background border-border"
                    />
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="text-destructive text-sm">{registerForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full mt-8" 
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Registering..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Hero Column */}
          <div className="w-full md:w-1/2 bg-primary/90 p-8 md:p-10 text-white flex flex-col justify-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full opacity-50 -translate-y-1/2 translate-x-1/4"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary rounded-full opacity-50 translate-y-1/2 -translate-x-1/4"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">Your Roadmap to Success</h2>
              <p className="mb-8 text-primary-foreground/90 leading-relaxed">
                DevPathways provides structured learning paths for developers at all levels. Track your progress and grow your skills with expert-designed roadmaps.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start bg-primary/20 p-4 rounded-lg">
                  <BookOpen className="h-6 w-6 mr-3 mt-0.5 text-white" />
                  <div>
                    <h3 className="font-semibold">Structured Learning Paths</h3>
                    <p className="text-primary-foreground/80">Follow roadmaps designed by industry experts.</p>
                  </div>
                </div>
                
                <div className="flex items-start bg-primary/20 p-4 rounded-lg">
                  <Clock className="h-6 w-6 mr-3 mt-0.5 text-white" />
                  <div>
                    <h3 className="font-semibold">Track Your Progress</h3>
                    <p className="text-primary-foreground/80">Monitor your learning journey and stay motivated.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
