import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import ComprehensiveContentEditor from "@/components/admin/comprehensive-content-editor";

export default function ContentEditorPage() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  // Get content ID from URL params if editing existing content
  const urlParams = new URLSearchParams(window.location.search);
  const contentId = urlParams.get('id') ? parseInt(urlParams.get('id')!) : undefined;
  const contentType = urlParams.get('type') || 'roadmap';
  
  // Redirect if not admin
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Check if user exists and is admin
  if (!user || !user.isAdmin) {
    // Use setTimeout to avoid state update during render
    setTimeout(() => {
      navigate("/");
    }, 0);
    return null;
  }
  
  return (
    <div className="min-h-screen bg-background">
      <ComprehensiveContentEditor contentId={contentId} contentType={contentType} />
    </div>
  );
}