import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Types for admin dashboard
export interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  totalRoadmaps: number;
  totalCourses?: number;
  totalLabEnvironments?: number;
  activeLabInstances?: number;
  totalComments: number;
  totalDiscussions: number;
  averageCompletionRate: number;
}

export interface UserProgressReport {
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
}

export interface LearningVelocity {
  users: {
    userId: number;
    username: string;
    avgNodesPerWeek: number;
    lastActive: string;
  }[];
  overall: {
    period: string;
    average: number;
  }[];
}

// Get all users for admin
export function useAdminUsers() {
  return useQuery({
    queryKey: ['/api/admin/users'],
    enabled: false, // Don't fetch automatically on component mount
  });
}

// Get platform stats for admin dashboard
export function usePlatformStats() {
  return useQuery<PlatformStats>({
    queryKey: ['/api/admin/stats'],
    enabled: false, // Don't fetch automatically on component mount
  });
}

// Get user progress report
export function useUserProgressReport() {
  return useQuery<UserProgressReport[]>({
    queryKey: ['/api/admin/reports/progress'],
    enabled: false, // Don't fetch automatically on component mount
  });
}

// Get learning velocity report
export function useLearningVelocityReport() {
  return useQuery<LearningVelocity>({
    queryKey: ['/api/admin/reports/velocity'],
    enabled: false, // Don't fetch automatically on component mount
  });
}

// Create a new user (admin only)
export function useCreateUser() {
  return useMutation({
    mutationFn: async (userData: any) => {
      const res = await apiRequest("POST", "/api/admin/users", userData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
  });
}

// Update an existing user (admin only)
export function useUpdateUser() {
  return useMutation({
    mutationFn: async ({ userId, userData }: { userId: number, userData: any }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${userId}`, userData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
  });
}

// Assign a roadmap to a user
export function useAssignRoadmap() {
  return useMutation({
    mutationFn: async ({ userId, roadmapId }: { userId: number, roadmapId: number }) => {
      const res = await apiRequest("POST", "/api/admin/assign-roadmap", { userId, roadmapId });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/progress'] });
    },
  });
}