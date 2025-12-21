"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowLeft,
  AlertTriangle,
  Save,
  Activity,
  HardDrive,
  Cpu,
} from "lucide-react";
import { Card } from "@/components/ui/card";

// Zod schema for validation
const thresholdSchema = z.object({
  cpuThreshold: z
    .number()
    .min(0, "Must be at least 0")
    .max(100, "Must be at most 100"),
  memoryThreshold: z
    .number()
    .min(0, "Must be at least 0")
    .max(100, "Must be at most 100"),
  diskThreshold: z
    .number()
    .min(0, "Must be at least 0")
    .max(100, "Must be at most 100"),
});

type ThresholdFormValues = z.infer<typeof thresholdSchema>;

export default function SetAlertThresholdModule() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ThresholdFormValues>({
    resolver: zodResolver(thresholdSchema),
    defaultValues: {
      cpuThreshold: 80, // Default suggested values
      memoryThreshold: 80,
      diskThreshold: 90,
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const onSubmit = async (data: ThresholdFormValues) => {
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const token = localStorage.getItem("token");

      // Using the specific URL requested
      await axios.post("http://localhost:3000/set-threshold", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setSubmitStatus({
        type: "success",
        message:
          "Threshold set. If server metrics goes above you will receive alert in your registered mail.",
      });

      // Redirect back to dashboard after 3 seconds
      setTimeout(() => router.push("/dashboard"), 3000);
    } catch (error: any) {
      console.error("Error setting thresholds:", error);
      setSubmitStatus({
        type: "error",
        message: error.response?.data?.message || "Failed to set thresholds",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground p-6 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center text-sm text-muted-foreground hover:text-cyan-400 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        <Card className="bg-card/30 backdrop-blur-xl border border-white/10 p-8 shadow-2xl">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <AlertTriangle className="w-6 h-6 text-cyan-400" />
              </div>
              <h1 className="text-2xl font-light text-white">
                Alert Thresholds
              </h1>
            </div>
            <p className="text-sm text-muted-foreground ml-1">
              Configure when to receive system alerts based on resource usage.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* CPU Threshold */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                CPU Threshold (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  {...register("cpuThreshold", { valueAsNumber: true })}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-light"
                  placeholder="80"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  %
                </span>
              </div>
              {errors.cpuThreshold && (
                <p className="text-red-400 text-xs">
                  {errors.cpuThreshold.message}
                </p>
              )}
            </div>

            {/* Memory Threshold */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                Memory Threshold (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  {...register("memoryThreshold", { valueAsNumber: true })}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-light"
                  placeholder="80"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  %
                </span>
              </div>
              {errors.memoryThreshold && (
                <p className="text-red-400 text-xs">
                  {errors.memoryThreshold.message}
                </p>
              )}
            </div>

            {/* Disk Threshold */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-green-400" />
                Disk Threshold (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  {...register("diskThreshold", { valueAsNumber: true })}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all font-light"
                  placeholder="90"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  %
                </span>
              </div>
              {errors.diskThreshold && (
                <p className="text-red-400 text-xs">
                  {errors.diskThreshold.message}
                </p>
              )}
            </div>

            {/* Status Messages */}
            {submitStatus.message && (
              <div
                className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                  submitStatus.type === "success"
                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}
              >
                {submitStatus.message}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-linear-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Thresholds
                </>
              )}
            </button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
