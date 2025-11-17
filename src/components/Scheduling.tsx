import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar, Plus, Trash2, Edit, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { websocketService, TOPICS } from '../services/websocketService';

const schedules = [
  { id: 1, startTime: '06:00', endTime: '22:00', action: 'ON', target: 'Lights - All Floors', active: true, days: 'Mon-Fri' },
  { id: 2, startTime: '07:00', endTime: '18:00', action: 'ON', target: 'AC - Office Areas', active: true, days: 'Mon-Fri' },
  { id: 3, startTime: '18:00', endTime: '22:00', action: 'DIM 50%', target: 'Lights - Lobby', active: true, days: 'Daily' },
  { id: 4, startTime: '22:00', endTime: '06:00', action: 'OFF', target: 'AC - All Except Server', active: true, days: 'Daily' },
  { id: 5, startTime: '00:00', endTime: '23:59', action: 'ON', target: 'AC - Server Room', active: true, days: 'Daily' },
];

const activeSchedules = [
  { name: 'Morning Lights ON', status: 'Running', nextRun: 'Tomorrow 06:00' },
  { name: 'Office AC ON', status: 'Running', nextRun: 'Tomorrow 07:00' },
  { name: 'Night Mode', status: 'Scheduled', nextRun: 'Today 22:00' },
];

export default function Scheduling() {
  // State untuk mengontrol dialog form Add Schedule
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    action: '',
    target: '',
    days: ''
  });

  // === CONNECT WEBSOCKET ===
    useEffect(() => {
      websocketService.connect()
      return () => websocketService.disconnect();
    }, []);

  // Handler untuk submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('New Schedule:', formData);
    // TODO: Tambahkan logic untuk menyimpan schedule baru
    setOpenDialog(false);
    // Reset form
    setFormData({
      startTime: '',
      endTime: '',
      action: '',
      target: '',
      days: ''
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Manage automated schedules for lights and AC systems
        </p>
        
        {/* Dialog Form untuk Add Schedule */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Schedule</DialogTitle>
              <DialogDescription>
                Create a new automated schedule for lighting or AC control
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {/* Input Waktu Mulai */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                  />
                </div>
                
                {/* Input Waktu Selesai */}
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Select Action */}
              <div className="space-y-2">
                <Label htmlFor="action">Action</Label>
                <Select value={formData.action} onValueChange={(value) => setFormData({ ...formData, action: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ON">Turn ON</SelectItem>
                    <SelectItem value="OFF">Turn OFF</SelectItem>
                    <SelectItem value="DIM 50%">Dim 50%</SelectItem>
                    <SelectItem value="DIM 25%">Dim 25%</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Select Target */}
              <div className="space-y-2">
                <Label htmlFor="target">Target Device</Label>
                <Select value={formData.target} onValueChange={(value) => setFormData({ ...formData, target: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target device" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lights - All Floors">Lights - All Floors</SelectItem>
                    <SelectItem value="Lights - Lobby">Lights - Lobby</SelectItem>
                    <SelectItem value="Lights - Office">Lights - Office</SelectItem>
                    <SelectItem value="AC - All Areas">AC - All Areas</SelectItem>
                    <SelectItem value="AC - Office Areas">AC - Office Areas</SelectItem>
                    <SelectItem value="AC - Server Room">AC - Server Room</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Select Days */}
              <div className="space-y-2">
                <Label htmlFor="days">Days</Label>
                <Select value={formData.days} onValueChange={(value) => setFormData({ ...formData, days: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select days" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Mon-Fri">Monday - Friday</SelectItem>
                    <SelectItem value="Weekend">Weekend Only</SelectItem>
                    <SelectItem value="Custom">Custom Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tombol Submit dan Cancel */}
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpenDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/90"
                >
                  Create Schedule
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schedule Table */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Schedule List
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule, index) => (
                    <motion.tr
                      key={schedule.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-border"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3 text-primary" />
                          {schedule.startTime} - {schedule.endTime}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          {schedule.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{schedule.target}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{schedule.days}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={schedule.active ? 'default' : 'secondary'}
                          className={schedule.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}
                        >
                          {schedule.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Schedules */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Active Schedules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeSchedules.map((schedule, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="p-4 border border-border rounded-lg bg-muted/30"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{schedule.name}</h4>
                    <Badge 
                      variant="outline"
                      className={schedule.status === 'Running' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}
                    >
                      {schedule.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Next run: {schedule.nextRun}</p>
                </motion.div>
              ))}

              <div className="pt-4 border-t border-border">
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-medium text-foreground">Scheduler Status</span>
                  </div>
                  <p className="text-xs text-muted-foreground">All automated schedules running normally</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
