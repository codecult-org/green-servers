"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { motion } from "framer-motion";
import { Loader2, Lock, Mail, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post("http://localhost:3000/login", data);

      if (response.data.token) {
        login(response.data.token);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "Login failed. Please try again."
        );
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-green-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4 border border-green-500/20">
              <Image
                src="/Green Server1.png"
                alt="Green Server Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              Welcome Back
            </h1>
            <p className="text-white/40 text-sm mt-2">
              Sign in to manage your green servers
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-green-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="name@example.com"
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs ml-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70 ml-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-green-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  {...register("password")}
                  type="password"
                  placeholder="Enter your password"
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
                />
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs ml-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.password.message}
                </p>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2 text-red-200 text-sm"
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-medium py-3 rounded-xl transition-colors shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
