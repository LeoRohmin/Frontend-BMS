import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { FileText, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'motion/react';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';
import { websocketService, TOPICS } from '../services/websocketService';

const billingData = [
  { date: '2025-01-24', energyUsed: 214.7, cost: 429400, source: 'PLN: 146.5 / Solar: 68.2' },
  { date: '2025-01-23', energyUsed: 198.3, cost: 396600, source: 'PLN: 132.8 / Solar: 65.5' },
  { date: '2025-01-22', energyUsed: 205.1, cost: 410200, source: 'PLN: 139.2 / Solar: 65.9' },
  { date: '2025-01-21', energyUsed: 187.6, cost: 375200, source: 'PLN: 125.4 / Solar: 62.2' },
  { date: '2025-01-20', energyUsed: 192.4, cost: 384800, source: 'PLN: 128.7 / Solar: 63.7' },
  { date: '2025-01-19', energyUsed: 176.8, cost: 353600, source: 'PLN: 118.2 / Solar: 58.6' },
  { date: '2025-01-18', energyUsed: 169.2, cost: 338400, source: 'PLN: 113.1 / Solar: 56.1' },
];

export default function BillingReport() {
  const totalThisMonth = billingData.reduce((sum, item) => sum + item.cost, 0);
  const avgDaily = totalThisMonth / billingData.length;
  const totalEnergy = billingData.reduce((sum, item) => sum + item.energyUsed, 0);


  const handleExportPDF = () => {
    exportToPDF(
      billingData,
      'billing-report',
      'Monthly Energy Billing Report',
      [
        { key: 'date', label: 'Date' },
        { key: 'energyUsed', label: 'Energy Used (kWh)' },
        { key: 'cost', label: 'Cost (Rp)' },
        { key: 'source', label: 'Source Distribution' },
      ]
    );
  };

  const handleExportExcel = () => {
    exportToExcel(
      billingData,
      'billing-report',
      [
        { key: 'date', label: 'Date' },
        { key: 'energyUsed', label: 'Energy Used (kWh)' },
        { key: 'cost', label: 'Cost (Rp)' },
        { key: 'source', label: 'Source Distribution' },
      ]
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Monthly energy billing report and cost analysis
        </p>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Export PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>
          <Button variant="outline" size="sm" className="bg-primary text-white hover:bg-primary/90 flex-1 sm:flex-none" onClick={handleExportExcel}>
            <Download className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Export Excel</span>
            <span className="sm:hidden">Excel</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-foreground">
                  Rp {totalThisMonth.toLocaleString('id-ID')}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-red-500" />
                  <span className="text-muted-foreground">+8.5% vs last month</span>
                </div>
              </div>
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Daily Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-foreground">
                  Rp {Math.round(avgDaily).toLocaleString('id-ID')}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingDown className="h-4 w-4 text-green-500" />
                  <span className="text-muted-foreground">-2.1% vs last week</span>
                </div>
              </div>
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Energy Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">
                  {totalEnergy.toFixed(1)} kWh
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Last 7 days</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Billing Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Daily Billing Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Energy Used (kWh)</TableHead>
                  <TableHead>Cost (Rp)</TableHead>
                  <TableHead>Source Distribution</TableHead>
                  <TableHead className="text-right">Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billingData.map((item, index) => {
                  const prevItem = billingData[index + 1];
                  const trend = prevItem ? ((item.cost - prevItem.cost) / prevItem.cost) * 100 : 0;
                  
                  return (
                    <motion.tr
                      key={item.date}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      className="border-b border-border"
                    >
                      <TableCell className="font-medium">{item.date}</TableCell>
                      <TableCell className="text-primary font-medium">{item.energyUsed} kWh</TableCell>
                      <TableCell className="font-medium">Rp {item.cost.toLocaleString('id-ID')}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.source}</TableCell>
                      <TableCell className="text-right">
                        {index < billingData.length - 1 && (
                          <Badge 
                            variant="outline"
                            className={trend > 0 ? 'text-red-600 border-red-200' : 'text-green-600 border-green-200'}
                          >
                            {trend > 0 ? <TrendingUp className="h-3 w-3 inline mr-1" /> : <TrendingDown className="h-3 w-3 inline mr-1" />}
                            {Math.abs(trend).toFixed(1)}%
                          </Badge>
                        )}
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notes */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Note:</strong> Cost calculated at Rp 2,000/kWh base rate. 
              Solar energy reduces PLN dependency and overall costs. Export this data for accounting and budget planning.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}