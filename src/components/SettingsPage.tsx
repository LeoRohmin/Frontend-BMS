import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Settings, Plus, Trash2, Edit, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { websocketService, TOPICS } from '../services/websocketService';

const powerMeters = [
  { id: 1, name: 'Main Lobby Meter', location: 'Floor 1 - Lobby', ip: '192.168.1.101', modbusAddr: '01', status: 'Online' },
  { id: 2, name: 'Office Area Meter', location: 'Floor 2 - Office', ip: '192.168.1.102', modbusAddr: '02', status: 'Online' },
  { id: 3, name: 'Meeting Room Meter', location: 'Floor 3 - Meeting', ip: '192.168.1.103', modbusAddr: '03', status: 'Online' },
  { id: 4, name: 'Server Room Meter', location: 'Floor 3 - Server', ip: '192.168.1.104', modbusAddr: '04', status: 'Online' },
  { id: 5, name: 'Cafeteria Meter', location: 'Floor 1 - Cafeteria', ip: '192.168.1.105', modbusAddr: '05', status: 'Offline' },
];

export default function SettingsPage() {
  const [isAddingMeter, setIsAddingMeter] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    ip: '',
    modbusAddr: '',
  });

  useEffect(() => {
    websocketService.connect()
    return () => websocketService.disconnect();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    setIsAddingMeter(false);
    setFormData({ name: '', location: '', ip: '', modbusAddr: '' });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Configure power meters and system settings
        </p>
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={() => setIsAddingMeter(!isAddingMeter)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Power Meter
        </Button>
      </div>

      {/* Add Power Meter Form */}
      {isAddingMeter && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border border-primary/20 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Add New Power Meter</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Meter Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Parking Meter"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Basement - Parking Area"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ip">IP Address *</Label>
                    <Input
                      id="ip"
                      placeholder="e.g., 192.168.1.106"
                      value={formData.ip}
                      onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modbus">Modbus Address *</Label>
                    <Input
                      id="modbus"
                      placeholder="e.g., 06"
                      value={formData.modbusAddr}
                      onChange={(e) => setFormData({ ...formData, modbusAddr: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setIsAddingMeter(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90">
                    Add Meter
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Power Meter List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Power Meter List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Modbus Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {powerMeters.map((meter, index) => (
                  <motion.tr
                    key={meter.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="border-b border-border"
                  >
                    <TableCell className="font-medium">{meter.name}</TableCell>
                    <TableCell className="text-sm">{meter.location}</TableCell>
                    <TableCell className="text-sm font-mono">{meter.ip}</TableCell>
                    <TableCell className="text-sm font-mono">{meter.modbusAddr}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={meter.status === 'Online' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}
                      >
                        <Activity className="h-3 w-3 mr-1" />
                        {meter.status}
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

      {/* System Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rate">Electricity Rate (Rp/kWh)</Label>
                <Input id="rate" defaultValue="2000" type="number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" defaultValue="IDR (Rp)" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input id="timezone" defaultValue="Asia/Jakarta (GMT+7)" disabled />
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90">Save Settings</Button>
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
              <CardTitle className="text-base font-semibold">Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium text-sm">Email Alerts</p>
                  <p className="text-xs text-muted-foreground">Send email for high priority alarms</p>
                </div>
                <Badge className="bg-green-100 text-green-700">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium text-sm">SMS Alerts</p>
                  <p className="text-xs text-muted-foreground">Send SMS for critical alarms</p>
                </div>
                <Badge className="bg-green-100 text-green-700">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium text-sm">Daily Report</p>
                  <p className="text-xs text-muted-foreground">Automated daily summary</p>
                </div>
                <Badge className="bg-green-100 text-green-700">Enabled</Badge>
              </div>
              <Button variant="outline" className="w-full">Configure Notifications</Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
