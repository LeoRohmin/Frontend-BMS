import { useState, useEffect, useRef } from "react";
import {Card,CardContent,CardHeader,CardTitle,} from "./ui/card";
import { Badge } from "./ui/badge";
import {Zap,DollarSign,AlertTriangle,Sun,TrendingUp,TrendingDown,Building,Activity,} from "lucide-react";
import {LineChart,Line,BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,Legend,} from "recharts";
import {motion,useMotionValue,useSpring,useTransform,animate,} from "motion/react";
import { toast } from "sonner";
import { websocketService, TOPICS } from "../services/websocketService";


const initialPowerData = [
  { time: "00:00", power: 85 },
  { time: "04:00", power: 65 },
  { time: "08:00", power: 120 },
  { time: "12:00", power: 145 },
  { time: "16:00", power: 135 },
  { time: "20:00", power: 110 },
  { time: "23:59", power: 90 },
];

const initialComparisonData = [
  { name: "Mon", pln: 145, solar: 65 },
  { name: "Tue", pln: 138, solar: 72 },
  { name: "Wed", pln: 142, solar: 68 },
  { name: "Thu", pln: 135, solar: 75 },
  { name: "Fri", pln: 148, solar: 70 },
  { name: "Sat", pln: 120, solar: 60 },
  { name: "Sun", pln: 115, solar: 58 },
];

const FloorsStatus = [
  {
    id: 1,
    name: "Floor 1 - Lobby",
    power: 24.5,
    ac: "ON",
    lights: "ON",
    status: "normal",
  },
  {
    id: 2,
    name: "Floor 2 - Office",
    power: 45.2,
    ac: "ON",
    lights: "ON",
    status: "normal",
  },
  {
    id: 3,
    name: "Floor 3 - Meeting",
    power: 18.3,
    ac: "ON",
    lights: "PARTIAL",
    status: "normal",
  },
  {
    id: 4,
    name: "Floor 4 - Server",
    power: 62.8,
    ac: "ON",
    lights: "ON",
    status: "warning",
  },
];

// Animated Counter Component
function AnimatedCounter({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(displayValue, value, {
      duration: 1,
      onUpdate: (latest) => setDisplayValue(latest),
    });
    return () => controls.stop();
  }, [value]);

  return (
    <span>
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export default function Dashboard() {
  const [totalPower, setTotalPower] = useState(142.5);
  const [pctPower, setPctPower] = useState(12);
  const [todayCost, setTodayCost] = useState(285000);
  const [pctCost, setPctCost] = useState(8);
  const [solarOutput, setSolarOutput] = useState(68.2);
  const [solarOutputOfTotal, setSolarsolarOutputOfTotal] = useState(2);
  const [powerData, setPowerData] = useState(initialPowerData);
  const [comparisonData, setComparisonData] = useState(initialComparisonData,);
  const [activeAlarms, setActiveAlarms] = useState(5);
  const [highPriorityAlarms, setHighPriorityAlarms] = useState(2);
  const [floors, setFloors] = useState(FloorsStatus);


  // === WEBSOCKET CONNECTION ===
  useEffect(() => {
    const connectWS = async () => {
      try {
        await websocketService.connect();
      } catch (err) {
        console.error("WebSocket connection failed:", err);
      }
    };

    connectWS();

    // Subscribe ke data power_summary (sesuai format dari backend)
    const unsubscribe = websocketService.subscribe(TOPICS.POWER, (payload) => {
      // Kalau backend kirim format {"type": "power_summary", "payload": {...}}
      setTotalPower(payload.total_today_kwh ?? 0);
      setTodayCost(payload.total_today_cost ?? 0);
      setPctPower(payload.pct_change_power_vs_yesterday ?? 0);
      setPctCost(payload.pct_change_cost_vs_yesterday ?? 0);
    });

    // subscribe ke topic alarms
    const unsubscribeAlarms = websocketService.subscribe(TOPICS.ALARMS, (payload) => {
      setActiveAlarms(payload.active_alarms ?? 0);
      setHighPriorityAlarms(payload.high_priority_alarms ?? 0);
    });

    // subscribe ke topic solar data
    const unsubscribeSolarData = websocketService.subscribe(TOPICS.SOLAR, (payload) => {
      setSolarOutput(payload.solar_today_kwh ?? 0);
      setSolarsolarOutputOfTotal(payload.solar_share_pct ?? 0);
    });

     // === Subscribe ke real-time energy chart ===
    const unsubscribeRealtime = websocketService.subscribe("energy", (data) => {
      // Pastikan payload ada dan array
      if (Array.isArray(data)) {
        const formatted = data.map((item: any) => ({
          time: new Date(item.time).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          }), // hasil: "15:30"
          power: item.value,
        }));

        setPowerData(formatted);
      }
    });


    // === Subscribe ke chart data ===
    const unsubscribeComparisonData = websocketService.subscribe("pln_vs_solar", (data) => {
      if (data?.pln && data?.solar) {
        console.log("Received PLN vs Solar data:", data);
        const formattedData = data.pln.map((plnItem: any, i: number) => ({
          name: new Date(plnItem.date).toLocaleDateString("en-US", {
            weekday: "short",
          }), // contoh: "Thu"
          pln: plnItem.value,
          solar: data.solar[i]?.value ?? 0,
        }));

        setComparisonData(formattedData);
      }
    });

    // === Subscribe ke overview_room ===
    const unsubscribeOverview = websocketService.subscribe("floor_status", (data) => {
      if (Array.isArray(data)) {
        // Mapping backend → frontend format
        const formatted = data.map((item: any, index: number) => ({
          id: index + 1,
          name: `Floor ${index + 1} - ${item.device}`, // contoh nama
          power: parseFloat((item.power_kwh / 1000).toFixed(2)), // misalnya convert ke kWh kecil
          ac: item.ac ? "ON" : "OFF",
          lights: item.lamp ? "ON" : "OFF",
          status: item.ac && item.lamp ? "normal" : "warning", // contoh logika status
        }));

        setFloors(formatted);
      }
    });

      // Tes Data
    const unsubscribeTes = websocketService.subscribe(TOPICS.TES, (payload) => {
        console.log("Received TES data:", payload);
    });

    return () => {
      unsubscribe();
      unsubscribeAlarms();
      unsubscribeComparisonData();
      unsubscribeSolarData();
      unsubscribeRealtime();
      unsubscribeOverview();
      unsubscribeTes();
      websocketService.disconnect();
    };
  }, []);

  

  const statCards = [
    {
      title: "Total Power Usage",
      value: totalPower,
      unit: " kWh",
      change: `${pctPower}% vs yesterday`,
      trend: pctPower >= 0 ? "up" : "down",
      icon: Zap,
      color: "bg-primary",
      textColor: "text-primary",
    },
    {
      title: "Today's Cost",
      value: todayCost,
      unit: "",
      prefix: "Rp ",
      change: `${pctCost}% vs yesterday`,
      trend: pctCost >= 0 ? "up" : "down",
      icon: DollarSign,
      color: "bg-accent",
      textColor: "text-accent",
      isCurrency: true,
    },
    {
      title: "Active Alarms",
      value: activeAlarms,
      unit: "",
      change: `${highPriorityAlarms} High Priority`,
      trend: "neutral",
      icon: AlertTriangle,
      color: "bg-red-500",
      textColor: "text-red-500",
    },
    {
      title: "Total Solar Output",
      value: solarOutput,
      unit: " kWh",
      change: `${solarOutputOfTotal}% of total`,
      trend: "down",
      icon: Sun,
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
    },
  ];

  return (

    <div className="p-4 sm:p-6 lg:p-8 space-y-4">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border border-border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div
                  className={`h-10 w-10 rounded-lg ${card.color} flex items-center justify-center`}
                >
                  <card.icon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="text-2xl font-semibold text-foreground">
                    {card.isCurrency ? (
                      <>
                        Rp{" "}
                        <AnimatedCounter
                          value={card.value}
                          decimals={0}
                        />
                      </>
                    ) : (
                      <>
                        <AnimatedCounter
                          value={card.value}
                          decimals={
                            card.unit === " kWh" ? 1 : 0
                          }
                        />
                        {card.unit}
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    {card.trend === "up" && (
                      <TrendingUp className="h-3 w-3 text-red-500" />
                    )}
                    {card.trend === "down" && (
                      <TrendingDown className="h-3 w-3 text-green-500" />
                    )}
                    <span className="text-muted-foreground">
                      {card.change}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Real-time Power Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={powerData}>
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

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Sun className="h-5 w-5 text-yellow-600" />
                PLN vs Solar Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={comparisonData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E5E7EB"
                  />
                  <XAxis
                    dataKey="name"
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
                  <Legend />
                  <Bar
                    dataKey="pln"
                    fill="#59C19B"
                    name="PLN (kWh)"
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={false}
                  />
                  <Bar
                    dataKey="solar"
                    fill="#FFA048"
                    name="Solar (kWh)"
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Building Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              Building Overview - Floor Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {floors.map((floor, index) => (
                <motion.div
                  key={floor.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="p-4 border border-border rounded-lg hover:border-primary transition-colors cursor-pointer bg-white"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-sm text-foreground">
                      {floor.name}
                    </h4>
                    <Badge
                      variant={
                        floor.status === "normal"
                          ? "default"
                          : "secondary"
                      }
                      className={
                        floor.status === "normal"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }
                    >
                      {floor.status}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Power:
                      </span>
                      <span className="font-medium text-primary">
                        {floor.power} kWh
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        AC:
                      </span>
                      <Badge
                        variant="outline"
                        className="text-xs"
                      >
                        {floor.ac}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Lights:
                      </span>
                      <Badge
                        variant="outline"
                        className="text-xs"
                      >
                        {floor.lights}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}