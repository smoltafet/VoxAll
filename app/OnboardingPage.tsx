"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Youtube, ArrowRight, Sparkles } from "lucide-react";
import { youtubeAPI, dashboardAPI } from "@/lib/api";
import { logger } from "@/lib/logger";

interface OnboardingProps {
  onComplete: () => void;
  onYouTubeConnected?: () => void;
}

export default function OnboardingPage({ onComplete, onYouTubeConnected }: OnboardingProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [youtubeConnected, setYoutubeConnected] = useState(false);

  // Check if YouTube is already connected
  useEffect(() => {
    const checkYouTubeConnection = async () => {
      try {
        logger.debug("YouTube Onboarding", "Checking dashboard for YouTube connection");
        const dashboard = await dashboardAPI.getDashboard();
        logger.debug("YouTube Onboarding", "Dashboard response", {
          has_youtube_connection: dashboard.has_youtube_connection,
          connections_count: dashboard.youtube_connections.length,
        });
        if (dashboard.has_youtube_connection) {
          logger.info("YouTube Onboarding", "YouTube already connected, completing onboarding");
          setYoutubeConnected(true);
          // Auto-complete onboarding if YouTube is already connected
          setTimeout(() => {
            onComplete();
          }, 1000);
        }
      } catch (error) {
        logger.error("YouTube Onboarding", "Failed to check YouTube connection", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkYouTubeConnection();
  }, [onComplete]);

  const handleConnectYouTube = async () => {
    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      // Use 10.0.0.15 instead of localhost
      const currentOrigin = window.location.origin.replace(/localhost|127\.0\.0\.1/, "10.0.0.15");
      const successRedirectUri = `${currentOrigin}/youtube/connect/success`;
      
      logger.debug("YouTube OAuth", "handleConnectYouTube called");
      logger.debug("YouTube OAuth", "successRedirectUri", successRedirectUri);
      
      const { auth_url } = await youtubeAPI.initiateConnection(successRedirectUri);
      
      logger.debug("YouTube OAuth", "auth_url received", auth_url);
      
      const token = localStorage.getItem("access_token");
      if (auth_url.includes("/youtube/connect") && token && !auth_url.includes("token=")) {
        const separator = auth_url.includes("?") ? "&" : "?";
        const finalUrl = `${auth_url}${separator}token=${encodeURIComponent(token)}`;
        logger.debug("YouTube OAuth", "Redirecting to (with token)", finalUrl);
        window.location.href = finalUrl;
      } else {
        logger.debug("YouTube OAuth", "Redirecting to (direct)", auth_url);
        window.location.href = auth_url;
      }
    } catch (error) {
      logger.error("YouTube OAuth", "Error in handleConnectYouTube", error);
      const token = localStorage.getItem("access_token");
      const currentOrigin = window.location.origin.replace(/localhost|127\.0\.0\.1/, "10.0.0.15");
      const successRedirectUri = `${currentOrigin}/youtube/connect/success`;
      logger.debug("YouTube OAuth", "Fallback redirect - successRedirectUri", successRedirectUri);
      if (token) {
        const fallbackUrl = `http://10.0.0.15:8000/youtube/connect?token=${encodeURIComponent(token)}&redirect_uri=${encodeURIComponent(successRedirectUri)}`;
        logger.debug("YouTube OAuth", "Fallback redirect URL", fallbackUrl);
        window.location.href = fallbackUrl;
      } else {
        setConnectionError(error instanceof Error ? error.message : "Failed to connect YouTube. Please try again.");
        setIsConnecting(false);
      }
    }
  };

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="absolute inset-0 w-full h-full flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-white/90 to-gray-50/95 backdrop-blur-md" />
        <div className="relative text-center">
          <svg className="animate-spin h-8 w-8 text-gray-900 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Checking connection...</p>
        </div>
      </div>
    );
  }

  // If already connected, show success message briefly before completing
  if (youtubeConnected) {
    return (
      <div className="absolute inset-0 w-full h-full flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-white/90 to-gray-50/95 backdrop-blur-md" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">All Set!</h2>
          <p className="text-gray-600">Redirecting to your content...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center z-50 p-8">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-white/90 to-gray-50/95 backdrop-blur-md" />
      
      {/* Main Content Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-2xl"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12 md:p-16">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 mb-6 shadow-lg shadow-red-500/20">
              <Sparkles className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
              Welcome to <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Sheaperd</span>
            </h1>
            <p className="text-xl text-gray-600 font-medium">
              Let's get your content ready for the world
            </p>
          </motion.div>

          {/* YouTube Connection Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-200/50">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                  <Youtube className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Connect Your YouTube Channel
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    Link your primary YouTube account to start managing and distributing your content across multiple languages and platforms.
                  </p>
                </div>
              </div>

              {connectionError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"
                >
                  {connectionError}
                </motion.div>
              )}

              <motion.button
                onClick={handleConnectYouTube}
                disabled={isConnecting}
                whileHover={{ scale: isConnecting ? 1 : 1.02 }}
                whileTap={{ scale: isConnecting ? 1 : 0.98 }}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isConnecting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Youtube className="w-5 h-5" />
                    <span>Connect YouTube Account</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Features List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center"
          >
            {[
              { icon: "🌍", title: "Multi-Language", desc: "Reach global audiences" },
              { icon: "🚀", title: "Auto-Distribute", desc: "Publish everywhere" },
              { icon: "📊", title: "Analytics", desc: "Track performance" },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
                className="p-4 rounded-xl bg-gray-50/50 border border-gray-100"
              >
                <div className="text-3xl mb-2">{feature.icon}</div>
                <div className="font-semibold text-gray-900 mb-1">{feature.title}</div>
                <div className="text-sm text-gray-600">{feature.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
