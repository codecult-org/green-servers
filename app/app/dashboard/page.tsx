"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { PerformanceChart } from "@/components/performance-chart";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import axios from "axios";
import Select from "react-select";
import Image from "next/image";

// Animation variants for staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

const statsContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2,
    },
  },
};

const statItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 120,
      damping: 14,
    },
  },
};

interface SystemMetrics {
  cpu: {
    usage: number;
    speed: number;
    processes: number;
    threads: number;
    handles: number;
    uptime: string;
    cores: number;
    logicalProcessors: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    usage: number;
    type: string;
  };
}

// Custom styles for React Select
const customStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderColor: state.isFocused
      ? "rgb(6, 182, 212)"
      : "rgba(255, 255, 255, 0.1)",
    color: "white",
    boxShadow: state.isFocused ? "0 0 0 1px rgb(6, 182, 212)" : "none",
    "&:hover": {
      borderColor: "rgba(255, 255, 255, 0.2)",
    },
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: "#0a0a0a",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "rgb(6, 182, 212)"
      : state.isFocused
      ? "rgba(6, 182, 212, 0.1)"
      : "transparent",
    color: state.isSelected ? "white" : "white",
    cursor: "pointer",
    ":active": {
      ...provided[":active"],
      backgroundColor: "rgb(6, 182, 212)",
    },
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: "white",
  }),
  input: (provided: any) => ({
    ...provided,
    color: "white",
  }),
};

interface Server {
  id: number;
  server_name: string;
}

export default function PerformanceDashboard() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServerId, setSelectedServerId] = useState<number | null>(null);
  const [serversLoading, setServersLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: {
      usage: 8,
      speed: 2.0,
      processes: 259,
      threads: 4176,
      handles: 122284,
      uptime: "0:14:18:31",
      cores: 10,
      logicalProcessors: 16,
    },
    memory: {
      used: 10.5,
      total: 15.7,
      percentage: 67,
    },
    disk: {
      usage: 0,
      type: "SSD (NVMe)",
    },
  });

  const [cpuHistory, setCpuHistory] = useState<number[]>(Array(60).fill(10));
  const [memoryHistory, setMemoryHistory] = useState<number[]>(
    Array(60).fill(70)
  );
  const [diskHistory, setDiskHistory] = useState<number[]>(Array(60).fill(2));

  const [selectedMetric, setSelectedMetric] = useState<
    "cpu" | "memory" | "disk"
  >("cpu");

  // Fetch servers on mount
  useEffect(() => {
    const fetchServers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/list-servers`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const serverList = response.data.servers;
        if (serverList.length === 0) {
          router.push("/get-started");
          return;
        }
        setServers(serverList);
        if (serverList.length > 0 && !selectedServerId) {
          setSelectedServerId(serverList[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch servers:", error);
      } finally {
        setServersLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchServers();
    }
  }, [isAuthenticated]);

  // Fetch real data from API
  useEffect(() => {
    if (!selectedServerId || serversLoading) return;

    const fetchMetrics = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/fetch_metrics/${selectedServerId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const { cpu, memory, disk } = response.data.metrics;

        setCpuHistory((prev) => [...prev.slice(1), cpu]);
        setMemoryHistory((prev) => [...prev.slice(1), memory]);
        setDiskHistory((prev) => [...prev.slice(1), disk]);

        setMetrics((prev) => ({
          ...prev,
          cpu: {
            ...prev.cpu,
            usage: Math.round(cpu),
          },
          memory: {
            ...prev.memory,
            percentage: Math.round(memory),
          },
          disk: {
            ...prev.disk,
            usage: Math.round(disk),
          },
        }));
      } catch (error) {
        console.error("Failed to fetch metrics:", error);
      }
    };

    // Initial fetch
    fetchMetrics();

    const interval = setInterval(fetchMetrics, 12000);

    return () => clearInterval(interval);
  }, [selectedServerId]);

  if (isLoading || serversLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20 animate-pulse">
            <Image
              src="/Green Server1.png"
              alt="Loading..."
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <p className="text-white/40 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const getCurrentHistory = () => {
    switch (selectedMetric) {
      case "cpu":
        return cpuHistory;
      case "memory":
        return memoryHistory;
      case "disk":
        return diskHistory;
      default:
        return cpuHistory;
    }
  };

  const getCurrentMetricDetails = () => {
    switch (selectedMetric) {
      case "cpu":
        return (
          <div className="grid grid-cols-2 gap-x-16 gap-y-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                Utilization
              </div>
              <div className="text-3xl font-light">{metrics.cpu.usage}%</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Speed</div>
              <div className="text-3xl font-light">
                {metrics.cpu.speed.toFixed(2)} GHz
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                Processes
              </div>
              <div className="text-2xl font-light">{metrics.cpu.processes}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Threads</div>
              <div className="text-2xl font-light">{metrics.cpu.threads}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Handles</div>
              <div className="text-2xl font-light">{metrics.cpu.handles}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Up time</div>
              <div className="text-2xl font-light">{metrics.cpu.uptime}</div>
            </div>
          </div>
        );
      case "memory":
        return (
          <div className="grid grid-cols-2 gap-x-16 gap-y-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">In use</div>
              <div className="text-3xl font-light">
                {metrics.memory.used.toFixed(1)} GB
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                Available
              </div>
              <div className="text-3xl font-light">
                {(metrics.memory.total - metrics.memory.used).toFixed(1)} GB
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                Committed
              </div>
              <div className="text-2xl font-light">14.2/32.0 GB</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Cached</div>
              <div className="text-2xl font-light">3.2 GB</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                Paged pool
              </div>
              <div className="text-2xl font-light">512 MB</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                Non-paged pool
              </div>
              <div className="text-2xl font-light">256 MB</div>
            </div>
          </div>
        );
      case "disk":
        return (
          <div className="grid grid-cols-2 gap-x-16 gap-y-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                Active time
              </div>
              <div className="text-3xl font-light">{metrics.disk.usage}%</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Type</div>
              <div className="text-2xl font-light">{metrics.disk.type}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                Read speed
              </div>
              <div className="text-2xl font-light">0 MB/s</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                Write speed
              </div>
              <div className="text-2xl font-light">0 MB/s</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Capacity</div>
              <div className="text-2xl font-light">931 GB</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                Formatted
              </div>
              <div className="text-2xl font-light">NTFS</div>
            </div>
          </div>
        );
    }
  };

  const getMetricTitle = () => {
    switch (selectedMetric) {
      case "cpu":
        return "CPU";
      case "memory":
        return "Memory";
      case "disk":
        return "Disk 0 (C: D:)";
    }
  };

  const getMetricSubtitle = () => {
    switch (selectedMetric) {
      case "cpu":
        return "12th Gen Intel(R) Core(TM) i7-12650H";
      case "memory":
        return `${metrics.memory.used.toFixed(1)}/${metrics.memory.total} GB (${
          metrics.memory.percentage
        }%)`;
      case "disk":
        return `${metrics.disk.type}`;
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-[#0a0a0a] text-foreground flex pt-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Sidebar */}
      <motion.div
        className="w-56 border-r border-border/40 p-3 space-y-1"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="px-3 py-2 mb-2" variants={itemVariants}>
          <div className="mb-4">
            <label className="text-s text-gray-400 mb-1 block">
              Select Server
            </label>
            <Select
              value={
                selectedServerId
                  ? {
                      value: selectedServerId,
                      label:
                        servers.find((s) => s.id === selectedServerId)
                          ?.server_name || "",
                    }
                  : null
              }
              onChange={(option: any) => {
                if (option) setSelectedServerId(option.value);
              }}
              options={servers.map((server) => ({
                value: server.id,
                label: server.server_name,
              }))}
              styles={customStyles}
              className="text-sm"
              theme={(theme: any) => ({
                ...theme,
                colors: {
                  ...theme.colors,
                  primary: "rgb(6, 182, 212)",
                },
              })}
            />
          </div>
          <h2 className="text-sm font-medium text-foreground">Performance</h2>
        </motion.div>

        {/* CPU */}
        <motion.button
          onClick={() => setSelectedMetric("cpu")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm transition-colors ${
            selectedMetric === "cpu" ? "bg-accent" : "hover:bg-accent/50"
          }`}
          variants={itemVariants}
          whileHover={{ scale: 1.02, x: 4 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <div className="w-12 h-10 bg-accent/30 rounded-sm flex items-center justify-center">
            <div className="w-10 h-8">
              <svg viewBox="0 0 60 30" className="w-full h-full">
                <polyline
                  points={cpuHistory
                    .map(
                      (value, index) => `${index},${30 - (value / 100) * 30}`
                    )
                    .join(" ")}
                  fill="none"
                  stroke="rgb(6, 182, 212)"
                  strokeWidth="1.5"
                />
                <polyline
                  points={
                    cpuHistory
                      .map(
                        (value, index) => `${index},${30 - (value / 100) * 30}`
                      )
                      .join(" ") + " 60,30 0,30"
                  }
                  fill="rgba(6, 182, 212, 0.3)"
                  stroke="none"
                />
              </svg>
            </div>
          </div>
          <div className="flex-1 text-left">
            <div className="text-xs font-medium">CPU</div>
            <div className="text-xs text-muted-foreground">
              {metrics.cpu.usage}% {metrics.cpu.speed.toFixed(2)} GHz
            </div>
          </div>
        </motion.button>

        {/* Memory */}
        <motion.button
          onClick={() => setSelectedMetric("memory")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm transition-colors ${
            selectedMetric === "memory" ? "bg-accent" : "hover:bg-accent/50"
          }`}
          variants={itemVariants}
          whileHover={{ scale: 1.02, x: 4 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <div className="w-12 h-10 bg-accent/30 rounded-sm flex items-center justify-center">
            <div className="w-10 h-8">
              <svg viewBox="0 0 60 30" className="w-full h-full">
                <polyline
                  points={memoryHistory
                    .map(
                      (value, index) => `${index},${30 - (value / 100) * 30}`
                    )
                    .join(" ")}
                  fill="none"
                  stroke="rgb(147, 51, 234)"
                  strokeWidth="1.5"
                />
                <polyline
                  points={
                    memoryHistory
                      .map(
                        (value, index) => `${index},${30 - (value / 100) * 30}`
                      )
                      .join(" ") + " 60,30 0,30"
                  }
                  fill="rgba(147, 51, 234, 0.3)"
                  stroke="none"
                />
              </svg>
            </div>
          </div>
          <div className="flex-1 text-left">
            <div className="text-xs font-medium">Memory</div>
            <div className="text-xs text-muted-foreground">
              {metrics.memory.used.toFixed(1)}/{metrics.memory.total} GB (
              {metrics.memory.percentage}%)
            </div>
          </div>
        </motion.button>

        {/* Disk */}
        <motion.button
          onClick={() => setSelectedMetric("disk")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm transition-colors ${
            selectedMetric === "disk" ? "bg-accent" : "hover:bg-accent/50"
          }`}
          variants={itemVariants}
          whileHover={{ scale: 1.02, x: 4 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <div className="w-12 h-10 bg-accent/30 rounded-sm flex items-center justify-center">
            <div className="w-10 h-8">
              <svg viewBox="0 0 60 30" className="w-full h-full">
                <polyline
                  points={diskHistory
                    .map(
                      (value, index) => `${index},${30 - (value / 100) * 30}`
                    )
                    .join(" ")}
                  fill="none"
                  stroke="rgb(34, 197, 94)"
                  strokeWidth="1.5"
                />
                <polyline
                  points={
                    diskHistory
                      .map(
                        (value, index) => `${index},${30 - (value / 100) * 30}`
                      )
                      .join(" ") + " 60,30 0,30"
                  }
                  fill="rgba(34, 197, 94, 0.3)"
                  stroke="none"
                />
              </svg>
            </div>
          </div>
          <div className="flex-1 text-left">
            <div className="text-xs font-medium">Disk 0 (C: D:)</div>
            <div className="text-xs text-muted-foreground">
              {metrics.disk.type}
            </div>
            <div className="text-xs text-muted-foreground">
              {metrics.disk.usage}%
            </div>
          </div>
        </motion.button>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedMetric}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="mb-6 flex items-start justify-between"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
            >
              <div>
                <h1 className="text-2xl font-light mb-1">{getMetricTitle()}</h1>
                <p className="text-sm text-muted-foreground">
                  {getMetricSubtitle()}
                </p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                {selectedMetric === "cpu" && "100%"}
              </div>
            </motion.div>

            {/* Main Chart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="bg-card/50 border-border/40 p-6 mb-6 overflow-hidden">
                <div className="mb-2">
                  <div className="text-xs text-muted-foreground mb-1">
                    % Utilization
                  </div>
                </div>
                <PerformanceChart
                  data={getCurrentHistory()}
                  color={
                    selectedMetric === "cpu"
                      ? "rgb(6, 182, 212)"
                      : selectedMetric === "memory"
                      ? "rgb(147, 51, 234)"
                      : "rgb(34, 197, 94)"
                  }
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>60 seconds</span>
                  <span>0</span>
                </div>
              </Card>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              className="bg-card/30 border border-border/40 rounded-lg p-6"
              variants={statsContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {getCurrentMetricDetails()}
            </motion.div>

            {/* Additional Info */}
            {selectedMetric === "cpu" && (
              <motion.div
                className="mt-6 grid grid-cols-2 gap-6 text-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <motion.div
                  className="space-y-2"
                  variants={statsContainerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div
                    className="flex justify-between"
                    variants={statItemVariants}
                  >
                    <span className="text-muted-foreground">Base speed:</span>
                    <span>2.30 GHz</span>
                  </motion.div>
                  <motion.div
                    className="flex justify-between"
                    variants={statItemVariants}
                  >
                    <span className="text-muted-foreground">Sockets:</span>
                    <span>1</span>
                  </motion.div>
                  <motion.div
                    className="flex justify-between"
                    variants={statItemVariants}
                  >
                    <span className="text-muted-foreground">Cores:</span>
                    <span>{metrics.cpu.cores}</span>
                  </motion.div>
                  <motion.div
                    className="flex justify-between"
                    variants={statItemVariants}
                  >
                    <span className="text-muted-foreground">
                      Logical processors:
                    </span>
                    <span>{metrics.cpu.logicalProcessors}</span>
                  </motion.div>
                </motion.div>
                <motion.div
                  className="space-y-2"
                  variants={statsContainerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div
                    className="flex justify-between"
                    variants={statItemVariants}
                  >
                    <span className="text-muted-foreground">
                      Virtualization:
                    </span>
                    <span>Enabled</span>
                  </motion.div>
                  <motion.div
                    className="flex justify-between"
                    variants={statItemVariants}
                  >
                    <span className="text-muted-foreground">L1 cache:</span>
                    <span>864 KB</span>
                  </motion.div>
                  <motion.div
                    className="flex justify-between"
                    variants={statItemVariants}
                  >
                    <span className="text-muted-foreground">L2 cache:</span>
                    <span>9.5 MB</span>
                  </motion.div>
                  <motion.div
                    className="flex justify-between"
                    variants={statItemVariants}
                  >
                    <span className="text-muted-foreground">L3 cache:</span>
                    <span>24.0 MB</span>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
