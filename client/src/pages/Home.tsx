import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, BookOpen, TrendingUp, Brain, BarChart3 } from "lucide-react";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: universities } = trpc.university.list.useQuery();
  const { data: userUni } = trpc.userUniversity.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const [selectedUniversity, setSelectedUniversity] = useState<number | null>(
    null
  );
  const setUserUniversityMutation = trpc.userUniversity.set.useMutation();

  useEffect(() => {
    if (isAuthenticated && userUni?.universityId) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, userUni, setLocation]);

  const handleUniversitySelect = async (universityId: number) => {
    setSelectedUniversity(universityId);
    try {
      await setUserUniversityMutation.mutateAsync({
        universityId,
      });
      // Redirect will happen via useEffect when userUni updates
    } catch (error) {
      console.error("Failed to set university:", error);
      setSelectedUniversity(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  // If authenticated but no university selected, show university selection
  if (isAuthenticated && !userUni?.universityId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold mb-4 text-foreground">
                Welcome to <span className="gradient-text">GradeFlow</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Select your university to get started
              </p>
            </div>

            {universities && universities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {universities.map((uni) => (
                  <button
                    key={uni.id}
                    onClick={() => handleUniversitySelect(uni.id)}
                    disabled={
                      selectedUniversity === uni.id ||
                      setUserUniversityMutation.isPending
                    }
                    className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 text-left transition-all hover:border-accent hover:shadow-lg disabled:opacity-50"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-accent/0 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative">
                      <h3 className="font-semibold text-lg mb-2">{uni.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {uni.abbreviation}
                      </p>
                      {selectedUniversity === uni.id && (
                        <Loader2 className="w-4 h-4 animate-spin mt-4 text-accent" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-4" />
                <p className="text-muted-foreground">Loading universities...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Landing page for non-authenticated users
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="font-bold text-lg">GradeFlow</span>
          </div>
          <Button onClick={() => (window.location.href = getLoginUrl())}>
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Master Your <span className="gradient-text">Academic Journey</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              GradeFlow is an intelligent academic platform designed for Ghanaian
              university students. Calculate your GPA, predict your grades, and
              unlock your academic potential with AI-powered insights.
            </p>
            <Button
              size="lg"
              onClick={() => (window.location.href = getLoginUrl())}
              className="text-lg px-8 py-6"
            >
              Get Started Free
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to excel academically
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: BookOpen,
                title: "Grade Calculation",
                description:
                  "Automatic grade calculation based on your university's official grading scale",
              },
              {
                icon: TrendingUp,
                title: "GPA & CGPA Tracking",
                description:
                  "Real-time GPA and CGPA calculations with semester-by-semester history",
              },
              {
                icon: Brain,
                title: "Smart Predictions",
                description:
                  "Predict the grades you need to reach your target CGPA or degree classification",
              },
              {
                icon: BarChart3,
                title: "Analytics Dashboard",
                description:
                  "Visualize your performance with charts and detailed analytics",
              },
              {
                icon: Loader2,
                title: "AI Assistant",
                description:
                  "Get personalized academic advice and explanations from our AI assistant",
              },
              {
                icon: BookOpen,
                title: "PDF Reports",
                description:
                  "Generate and download comprehensive academic reports anytime",
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={idx}
                  className="p-6 border border-border hover:border-accent transition-colors group"
                >
                  <Icon className="w-10 h-10 text-accent mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Supported Universities Section */}
      <section className="py-20 md:py-32 border-t border-border bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Supported Universities</h2>
            <p className="text-lg text-muted-foreground">
              Institution-specific grading systems for accurate calculations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {universities?.map((uni) => (
              <div
                key={uni.id}
                className="p-4 rounded-lg border border-border bg-background text-center hover:border-accent transition-colors"
              >
                <p className="font-semibold">{uni.abbreviation}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {uni.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Academics?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of Ghanaian students already using GradeFlow to
              achieve their academic goals.
            </p>
            <Button
              size="lg"
              onClick={() => (window.location.href = getLoginUrl())}
              className="text-lg px-8 py-6"
            >
              Start Free Today
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-card/50">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2026 GradeFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
