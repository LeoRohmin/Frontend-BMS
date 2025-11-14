import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { AlertTriangle, Bell, CheckCircle, Filter } from 'lucide-react';
import { motion } from 'motion/react';

const alarms = [
  { id: 1, time: '2025-01-24 14:32', source: 'Server Room - AC Unit 2', level: 'High', status: 'Active', message: 'Temperature exceeds threshold (28°C)' },
  { id: 2, time: '2025-01-24 12:15', source: 'Floor 4 - Power Meter', level: 'Medium', status: 'Active', message: 'Voltage fluctuation detected' },
  { id: 3, time: '2025-01-24 09:45', source: 'Parking - Lighting Zone B', level: 'Low', status: 'Acknowledged', message: 'Light sensor malfunction' },
  { id: 4, time: '2025-01-23 22:18', source: 'Lobby - HVAC System', level: 'Medium', status: 'Acknowledged', message: 'Filter maintenance required' },
  { id: 5, time: '2025-01-23 18:30', source: 'Meeting Room A - AC', level: 'Low', status: 'Resolved', message: 'Temperature setpoint conflict' },
  { id: 6, time: '2025-01-23 16:22', source: 'Office Area - Power Usage', level: 'Medium', status: 'Resolved', message: 'Power consumption spike detected' },
  { id: 7, time: '2025-01-23 11:10', source: 'Solar Panel Array', level: 'Low', status: 'Resolved', message: 'Panel efficiency below 90%' },
];

export default function AlarmPage() {
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredAlarms = alarms.filter(alarm => {
    const levelMatch = filterLevel === 'all' || alarm.level === filterLevel;
    const statusMatch = filterStatus === 'all' || alarm.status === filterStatus;
    return levelMatch && statusMatch;
  });

  const activeCount = alarms.filter(a => a.status === 'Active').length;
  const highPriorityCount = alarms.filter(a => a.level === 'High' && a.status === 'Active').length;

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'High': return 'bg-red-100 text-red-700 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-red-100 text-red-700';
      case 'Acknowledged': return 'bg-yellow-100 text-yellow-700';
      case 'Resolved': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Monitor and manage system alarms and notifications
        </p>
        <Button variant="outline" size="sm">
          <Bell className="h-4 w-4 mr-2" />
          Notification Settings
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Alarms</CardTitle>
                <div className="h-10 w-10 rounded-lg bg-red-500 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{activeCount}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">High Priority</CardTitle>
                <div className="h-10 w-10 rounded-lg bg-red-600 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{highPriorityCount}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Acknowledged</CardTitle>
                <div className="h-10 w-10 rounded-lg bg-yellow-500 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {alarms.filter(a => a.status === 'Acknowledged').length}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Resolved Today</CardTitle>
                <div className="h-10 w-10 rounded-lg bg-green-500 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {alarms.filter(a => a.status === 'Resolved').length}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Alarm Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Alarm History
              </CardTitle>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filterLevel} onValueChange={setFilterLevel}>
                  <SelectTrigger className="w-[140px] h-9">
                    <SelectValue placeholder="Filter Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[140px] h-9">
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Acknowledged">Acknowledged</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlarms.map((alarm, index) => (
                  <motion.tr
                    key={alarm.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="border-b border-border"
                  >
                    <TableCell className="font-medium text-sm">{alarm.time}</TableCell>
                    <TableCell className="text-sm">{alarm.source}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getLevelColor(alarm.level)}>
                        {alarm.level}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs">{alarm.message}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(alarm.status)}>
                        {alarm.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {alarm.status === 'Active' && (
                        <Button variant="outline" size="sm">
                          Acknowledge
                        </Button>
                      )}
                      {alarm.status === 'Acknowledged' && (
                        <Button variant="outline" size="sm" className="bg-green-50 hover:bg-green-100">
                          Resolve
                        </Button>
                      )}
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Alert Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-700">
              <strong>⚠️ Important:</strong> High priority alarms require immediate attention. 
              Please acknowledge and investigate all active alarms to ensure system safety and optimal performance.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
