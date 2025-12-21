"use client";

import { motion } from "framer-motion";
import { Terminal, Copy, Check, ChevronRight } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function GetStartedPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      title: "Clone the Repository",
      description:
        "Start by cloning the Green Servers repository to your local machine.",
      command: "git clone https://github.com/codecult-org/green-servers",
    },
    {
      title: "Create Virtual Environment",
      description:
        "Create a Python virtual environment to isolate dependencies.",
      tabs: [
        {
          label: "Linux / Mac / Windows",
          command: "python -m venv venv",
        },
      ],
    },
    {
      title: "Activate Environment",
      description: "Activate the virtual environment you just created.",
      tabs: [
        {
          label: "Linux / Mac",
          command: "source venv/bin/activate",
        },
        {
          label: "Windows",
          command: "venv\\Scripts\\activate",
        },
      ],
    },
    {
      title: "Install Dependencies",
      description: "Install the package in editable mode.",
      command: "pip install -e .",
    },
    {
      title: "Login",
      description: "Authenticate with your Green Servers account credentials.",
      command: "green-watcher login",
    },
    {
      title: "Start Monitoring",
      description:
        "Start the watcher to begin sending metrics to your dashboard.",
      command: "green-watcher start",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12 pt-24 font-sans selection:bg-cyan-500/30">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="space-y-12"
        >
          {/* Header */}
          <motion.div
            variants={fadeInUp}
            className="text-center space-y-4 mb-16"
          >
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-cyan-500/10 mb-4">
              <Terminal className="w-8 h-8 text-cyan-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Set up your monitoring agent
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Follow these steps to install the CLI tool and connect your first
              server to the dashboard.
            </p>
          </motion.div>

          {/* Steps */}
          <div className="space-y-8 relative">
            {/* Vertical connector line */}
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gradient-to-b from-cyan-500/50 via-cyan-500/10 to-transparent hidden md:block" />

            {steps.map((step, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="relative md:pl-16 group"
              >
                {/* Step number bubble */}
                <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-[#0a0a0a] border border-cyan-500/30 text-cyan-500 flex items-center justify-center text-sm font-mono font-medium z-10 hidden md:flex group-hover:border-cyan-500 group-hover:scale-110 transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                  {index + 1}
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-cyan-500/30 transition-colors duration-300">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                      <span className="md:hidden text-cyan-500 font-mono text-sm mr-2">
                        {index + 1}.
                      </span>
                      {step.title}
                    </h3>
                    <p className="text-gray-400 mb-6">{step.description}</p>

                    {/* Command Block */}
                    <div className="bg-black/50 rounded-lg border border-white/5 overflow-hidden">
                      {step.tabs ? (
                        <div className="space-y-0">
                          {step.tabs.map((tab, tabIndex) => (
                            <div
                              key={tabIndex}
                              className="border-b border-white/5 last:border-0"
                            >
                              <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-white/5 border-b border-white/5">
                                {tab.label}
                              </div>
                              <div className="flex items-center justify-between p-4 group/cmd hover:bg-white/5 transition-colors">
                                <code className="font-mono text-cyan-400 text-sm">
                                  {tab.command}
                                </code>
                                <button
                                  onClick={() =>
                                    handleCopy(
                                      tab.command,
                                      index * 10 + tabIndex
                                    )
                                  }
                                  className="p-2 hover:bg-white/10 rounded-md transition-colors text-gray-500 hover:text-white"
                                  title="Copy command"
                                >
                                  {copiedIndex === index * 10 + tabIndex ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-4 group/cmd hover:bg-white/5 transition-colors">
                          <code className="font-mono text-cyan-400 text-sm">
                            {step.command}
                          </code>
                          <button
                            onClick={() => handleCopy(step.command!, index)}
                            className="p-2 hover:bg-white/10 rounded-md transition-colors text-gray-500 hover:text-white"
                            title="Copy command"
                          >
                            {copiedIndex === index ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeInUp} className="text-center pt-12 pb-20">
            <p className="text-gray-500 mb-6">Waiting for incoming data...</p>
            <div className="flex justify-center gap-2">
              <span
                className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"
                style={{ animationDelay: "0s" }}
              ></span>
              <span
                className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"
                style={{ animationDelay: "0.2s" }}
              ></span>
              <span
                className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"
                style={{ animationDelay: "0.4s" }}
              ></span>
            </div>

            <div className="mt-8">
              <Link
                href="/dashboard"
                className="text-cyan-500 hover:text-cyan-400 font-medium transition-colors hover:underline flex items-center justify-center gap-2 group/link"
              >
                After steps are done, go to dashboard
                <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
