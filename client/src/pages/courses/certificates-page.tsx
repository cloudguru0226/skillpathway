import { useQuery, useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Certificate } from "@shared/schema";
import { Link } from "wouter";
import { Loader2, Search, Award, Calendar, Download, Share2, ExternalLink } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";

export default function CertificatesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationResult, setVerificationResult] = useState<{ 
    verified: boolean;
    certificate?: Certificate;
    error?: string;
  } | null>(null);

  // Get user certificates
  const { data: certificates, isLoading } = useQuery<Certificate[]>({
    queryKey: ["/api/certificates"],
    enabled: !!user,
    onError: (error: Error) => {
      toast({
        title: "Error loading certificates",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter certificates based on search query
  const filteredCertificates = certificates?.filter((cert) => {
    return cert.courseName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Verify certificate
  const verifyMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await apiRequest("GET", `/api/certificates/verify/${code}`);
      return await res.json();
    },
    onSuccess: (data) => {
      if (data) {
        setVerificationResult({
          verified: true,
          certificate: data
        });
        toast({
          title: "Certificate Verified",
          description: "This certificate is valid.",
        });
      } else {
        setVerificationResult({
          verified: false,
          error: "Certificate not found or invalid."
        });
        toast({
          title: "Invalid Certificate",
          description: "This certificate could not be verified.",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      setVerificationResult({
        verified: false,
        error: error.message
      });
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleVerify = () => {
    if (!verificationCode.trim()) {
      toast({
        title: "Verification Code Required",
        description: "Please enter a verification code.",
        variant: "destructive",
      });
      return;
    }
    
    verifyMutation.mutate(verificationCode);
  };

  // Download certificate
  const downloadCertificate = (certificateId: number) => {
    window.open(`/api/certificates/${certificateId}/download`, '_blank');
  };
  
  // Share certificate
  const shareCertificate = (verificationCode: string) => {
    const url = `${window.location.origin}/certificates/verify/${verificationCode}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied",
      description: "Certificate verification link copied to clipboard.",
    });
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Certificates</h1>
          <p className="text-muted-foreground mt-2">
            View and share your course completion certificates.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Certificates</CardTitle>
              <CardDescription>
                Certificates you've earned by completing courses.
              </CardDescription>
              <div className="relative mt-4 w-full sm:w-96">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search certificates..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredCertificates && filteredCertificates.length > 0 ? (
                <div className="space-y-4">
                  {filteredCertificates.map((certificate) => (
                    <Card key={certificate.id} className="overflow-hidden bg-background border-muted hover:border-primary/50 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Award className="h-5 w-5 text-primary" />
                              <h3 className="text-lg font-semibold">{certificate.courseName}</h3>
                            </div>
                            <div className="text-sm text-muted-foreground mb-2">
                              Certificate ID: {certificate.verificationCode}
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                Issued on {new Date(certificate.issuedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => downloadCertificate(certificate.id)}>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => shareCertificate(certificate.verificationCode)}>
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-medium">No certificates yet</h3>
                  <p className="text-muted-foreground mt-2">
                    Complete courses to earn certificates that will appear here.
                  </p>
                  <Button asChild className="mt-4">
                    <Link to="/courses">Browse Courses</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Verify Certificate</CardTitle>
              <CardDescription>
                Enter a certificate verification code to validate its authenticity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Input
                    placeholder="Enter verification code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleVerify}
                  disabled={verifyMutation.isPending || !verificationCode.trim()}
                >
                  {verifyMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Certificate"
                  )}
                </Button>

                {verificationResult && (
                  <div className={`mt-4 p-4 rounded-md ${
                    verificationResult.verified ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
                  }`}>
                    {verificationResult.verified && verificationResult.certificate ? (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="h-5 w-5 text-green-500" />
                          <h3 className="font-semibold">Valid Certificate</h3>
                        </div>
                        <p className="text-sm mb-2">
                          This certificate was issued to <strong>{verificationResult.certificate.userName}</strong> for completing <strong>{verificationResult.certificate.courseName}</strong>.
                        </p>
                        <p className="text-sm flex items-center">
                          <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
                          Issued on {new Date(verificationResult.certificate.issuedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <h3 className="font-semibold text-red-500 mb-2">Invalid Certificate</h3>
                        <p className="text-sm">{verificationResult.error || "This certificate could not be verified."}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}