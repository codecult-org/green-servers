"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";

export function GlassNavbar() {
  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/5 border-b border-white/10 shadow-lg"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
        duration: 0.6,
      }}
    >
      <div className="px-6 py-4 flex items-center justify-between">
        <Link href="/">
          <motion.div
            className="flex items-center gap-3 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            transition={{
              type: "spring" as const,
              stiffness: 400,
              damping: 25,
            }}
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
              <Image
                src="/Green Server1.png"
                alt="Green Server Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div className="text-green-500 text-sm font-semibold tracking-wide">
              Green Server
            </div>
          </motion.div>
        </Link>
        <NavContent />
      </div>
    </motion.nav>
  );
}

function NavContent() {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const isDashboard = pathname.includes("/dashboard");

  return (
    <div className="flex items-center gap-4">
      {!isDashboard && (
        <Link href="/dashboard">
          <motion.button
            className="px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-300 text-sm font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{
              type: "spring" as const,
              stiffness: 400,
              damping: 25,
            }}
          >
            Dashboard
          </motion.button>
        </Link>
      )}

      {isAuthenticated ? (
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
            {user?.email || "User"}
          </div>
          <motion.button
            onClick={logout}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 text-sm font-medium"
            whileHover={{
              scale: 1.05,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            Logout
          </motion.button>
        </div>
      ) : (
        <Link href="/login">
          <motion.button
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm transition-all duration-300 text-sm font-medium"
            whileHover={{
              scale: 1.05,
              backgroundColor: "rgba(255, 255, 255, 0.15)",
            }}
            whileTap={{ scale: 0.95 }}
            transition={{
              type: "spring" as const,
              stiffness: 400,
              damping: 25,
            }}
          >
            Login
          </motion.button>
        </Link>
      )}
    </div>
  );
}
