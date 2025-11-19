import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle,} from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "./ui/select";
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,} from "recharts";
import { Zap, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { websocketService, TOPICS } from "../services/websocketService";

const initialHourlyData = [
  { time: "00:00", power: 45 },
  { time: "02:00", power: 38 },
  { time: "04:00", power: 35 },
  { time: "06:00", power: 52 },
  { time: "08:00", power: 85 },
  { time: "10:00", power: 120 },
  { time: "12:00", power: 145 },
  { time: "14:00", power: 138 },
  { time: "16:00", power: 125 },
  { time: "18:00", power: 95 },
  { time: "20:00", power: 72 },
  { time: "22:00", power: 58 },
];

const distributionData = [
  { name: "Lobby", value: 24.5, color: "#59C19B" },
  { name: "Office", value: 45.2, color: "#FFA048" },
  { name: "Meeting Rooms", value: 36.6, color: "#3B82F6" },
  { name: "Server Room", value: 62.8, color: "#8B5CF6" },
  { name: "Others", value: 45.6, color: "#EC4899" },
];

const initialDailyData = [
  { day: "Mon", consumption: 1245 },
  { day: "Tue", consumption: 1189 },
  { day: "Wed", consumption: 1267 },
  { day: "Thu", consumption: 1198 },
  { day: "Fri", consumption: 1289 },
  { day: "Sat", consumption: 985 },
  { day: "Sun", consumption: 892 },
];

export default function EnergyMonitoring() {
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [hourlyData, setHourlyData] = useState(initialHourlyData);
  const [dailyData, setDailyData] = useState(initialDailyData);


  // Real-time data update simulation every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Update hourly data
      setHourlyData((prev) => {
        const newData = [...prev];
        const lastItem = newData[newData.length - 1];

        // Parse last time and add 2 hours
        const [hours, minutes] = lastItem.time
          .split(":")
          .map(Number);
        let newHours = (hours + 2) % 24;
        const newTime = `${String(newHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

        // Generate realistic power value based on time of day
        let basePower = 60;
        if (newHours >= 8 && newHours <= 18) {
          basePower = 120; // High during work hours
        } else if (newHours >= 19 && newHours <= 22) {
          basePower = 80; // Medium in evening
        }
        const newPower = Math.round(
          basePower + (Math.random() - 0.5) * 30,
        );

        newData.shift(); // Remove oldest
        newData.push({ time: newTime, power: newPower });
        return newData;
      });

      // Update daily data
      setDailyData((prev) => {
        const newData = [...prev];
        const days = [
          "Mon",
          "Tue",
          "Wed",
          "Thu",
          "Fri",
          "Sat",
          "Sun",
        ];
        const lastDay = newData[newData.length - 1].day;
        const currentIndex = days.indexOf(lastDay);
        const nextDay = days[(currentIndex + 1) % 7];

        // Generate realistic consumption (800-1400 kWh)
        const newConsumption = Math.round(
          Math.random() * 600 + 800,
        );

        newData.shift(); // Remove oldest
        newData.push({
          day: nextDay,
          consumption: newConsumption,
        });
        return newData;
      });
    }, 4000); // Update every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Monitor energy consumption across all locations
          </p>
        </div>
        <Select
          value={selectedLocation}
          onValueChange={setSelectedLocation}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="lobby">Lobby</SelectItem>
            <SelectItem value="office">Office Area</SelectItem>
            <SelectItem value="meeting">
              Meeting Rooms
            </SelectItem>
            <SelectItem value="server">Server Room</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Today's Energy Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-primary">
                    214.7
                  </span>
                  <span className="text-xl text-muted-foreground">
                    kWh
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-red-500" />
                  <span className="text-muted-foreground">
                    +12% vs yesterday
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Cost Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-accent">
                    Rp 429,400
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-red-500" />
                  <span className="text-muted-foreground">
                    +8% vs yesterday
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Hourly Usage Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Power Usage Per Hour (Today)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hourlyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E5E7EB"
                />
                <XAxis
                  dataKey="time"
                  stroke="#6B7280"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  stroke="#6B7280"
                  style={{ fontSize: "12px" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="power"
                  stroke="#59C19B"
                  strokeWidth={3}
                  name="Power (kWh)"
                  dot={{
                    fill: "#59C19B",
                    strokeWidth: 2,
                    r: 4,
                  }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Grid 2 kolom untuk Pie Chart dan Bar Chart - otomatis responsif ke 1 kolom di mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Card Pie Chart - Distribusi Energi per Ruangan */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Energy Distribution by Room
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="w-full"
                style={{ height: "300px" }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart
                    margin={{
                      top: 5,
                      right: 5,
                      bottom: 5,
                      left: 5,
                    }}
                  >
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                      isAnimationActive={false}
                    >
                      {distributionData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card Bar Chart - Konsumsi Harian Seminggu Terakhir */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Daily Consumption (This Week)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="w-full"
                style={{ height: "300px" }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dailyData}
                    margin={{
                      top: 10,
                      right: 10,
                      bottom: 10,
                      left: 10,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#E5E7EB"
                    />
                    <XAxis
                      dataKey="day"
                      stroke="#6B7280"
                      style={{ fontSize: "12px" }}
                    />
                    <YAxis
                      stroke="#6B7280"
                      style={{ fontSize: "12px" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="consumption"
                      fill="#59C19B"
                      name="Consumption (kWh)"
                      radius={[4, 4, 0, 0]}
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}