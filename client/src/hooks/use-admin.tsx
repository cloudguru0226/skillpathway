import { useMutation, useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { queryClient } from "../lib/queryClient";
import { useToast } from "./use-toast";

// Define types for the admin API responses
export type UserDetails = {
  user: User;
  progress: any[];
  roles: any[];
  experience: any;
  badges: any[];
};

export type UserProgressReport = {
  userId: number;
  username: string;
  email: string;
  roadmapProgress: {
    roadmapId: number;
    roadmapTitle: string;
    completionPercentage: number;
    completedNodes: number;
    totalNodes: number;
    lastAccessedAt: string;
  }[];
};

export type LearningVelocity = {
  users: {
    userId: number;
    username: string;
    avgNodesPerWeek: number;
    lastActive: Date;
  }[];
  overall: {
    period: string;
    average: number;
  }[];
};

export type PlatformStats = {
  totalUsers: number;
  totalRoadmaps: number;
  activeUsers: number;
  totalComments: number;
  totalDiscussions: number;
  averageCompletionRate: number;
  totalCourses?: number;
  totalLabEnvironments?: number;
  activeLabInstances?: number;
};

// Admin hooks for managing users and getting reports
export function useAdminUsers() {
  return useQuery({
    queryKey: ["/api/admin/users"],
    enabled: false, // Don't auto-fetch, we'll fetch when the admin page loads
  });
}

export function useAdminUserDetails(userId: number) {
  return useQuery({
    queryKey: ["/api/admin/users", userId],
    enabled: !!userId, // Only fetch when userId is provided
  });
}

export function useCreateUser() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (userData: Partial<User>) => {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create user");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateUser() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ userId, userData }: { userId: number; userData: Partial<User> }) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update user");
      }
      
      return response.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users", variables.userId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useAssignRoadmap() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ userId, roadmapId }: { userId: number; roadmapId: number }) => {
      const response = await fetch(`/api/admin/users/${userId}/roadmaps`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roadmapId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to assign roadmap");
      }
      
      return response.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: "Roadmap assigned successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users", variables.userId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUserProgressReport() {
  return useQuery({
    queryKey: ["/api/admin/reports/user-progress"],
    enabled: false, // Don't auto-fetch
  });
}

export function useLearningVelocityReport(days: number = 30) {
  return useQuery({
    queryKey: ["/api/admin/reports/learning-velocity", days],
    enabled: false, // Don't auto-fetch
  });
}

export function usePlatformStats() {
  return useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: false, // Don't auto-fetch
  });
}