import { FileStack, CheckCircle2, XCircle, Clock, Archive } from 'lucide-react';
import { MetricCard } from '../app/components/common/MetricCard';
import { useDashboard } from '../hooks/useDashboard';
import { useFileRecords } from '../hooks/useFileRecords';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card } from '../app/components/ui/card';
import { format } from 'date-fns';
import { DataTable, Column } from '../app/components/common/DataTable';
import { FileLoadMetaData } from '../types';
import { StatusBadge } from '../app/components/common/StatusBadge';

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { data: metrics, isLoading: metricsLoading } = useDashboard();
  const { data: files, isLoading: filesLoading } = useFileRecords();

  const processingCount = files?.filter((f) => f.status === 'PROCESSING').length || 0;
  const archivedCount = files?.filter((f) => f.status === 'ARCHIVED').length || 0;

  const trendData = files
    ?.slice()
    .sort((a, b) => new Date(a.uploadTime).getTime() - new Date(b.uploadTime).getTime())
    .map((file) => ({
      date: format(new Date(file.uploadTime), 'MMM dd, HH:mm'),
      success: file.successCount,
      error: file.errorCount,
    }))
    .slice(-7) || [];

  const formatYAxisTick = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
    return val.toString();
  };

  const statusData = [
    { name: 'Completed', value: files?.filter((f) => f.status === 'COMPLETED').length || 0, color: '#10B981' },
    { name: 'Processing', value: processingCount, color: '#8B5CF6' },
    { name: 'Failed', value: files?.filter((f) => f.status === 'FAILED').length || 0, color: '#F43F5E' },
    { name: 'With Errors', value: files?.filter((f) => f.status === 'COMPLETED_WITH_ERROR').length || 0, color: '#F59E0B' },
  ];

  const recentFiles = files?.slice(0, 5) || [];

  const columns: Column<FileLoadMetaData>[] = [
    {
      header: 'File Name',
      accessor: (row) => <span className="font-mono text-sm">{row.filename}</span>,
    },
    {
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Records',
      accessor: (row) => <span className="text-sm">{row.totalRecords.toLocaleString()}</span>,
    },
    {
      header: 'Upload Time',
      accessor: (row) => <span className="text-sm text-muted-foreground">{format(new Date(row.uploadTime), 'MMM dd, HH:mm')}</span>,
    },
  ];

  return (
    <motion.div variants={containerVariants} initial="initial" animate="animate" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <motion.div variants={itemVariants}>
          <Link to="/files" className="block h-full">
            <MetricCard
              title="Total Files"
              value={metrics?.totalFiles || 0}
              icon={FileStack}
              gradient="bg-gradient-to-br from-indigo-500 to-indigo-600"
              isLoading={metricsLoading}
            />
          </Link>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Link to="/files" className="block h-full">
            <MetricCard
              title="Success Records"
              value={metrics?.successRecords || 0}
              icon={CheckCircle2}
              gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
              isLoading={metricsLoading}
            />
          </Link>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Link to="/errors" className="block h-full">
            <MetricCard
              title="Error Records"
              value={metrics?.errorRecords || 0}
              icon={XCircle}
              gradient="bg-gradient-to-br from-rose-500 to-rose-600"
              isLoading={metricsLoading}
            />
          </Link>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Link to="/files?status=PROCESSING" className="block h-full">
            <MetricCard
              title="Processing"
              value={processingCount}
              icon={Clock}
              gradient="bg-gradient-to-br from-purple-500 to-purple-600"
              isLoading={filesLoading}
            />
          </Link>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Link to="/files?status=ARCHIVED" className="block h-full">
            <MetricCard
              title="Archived"
              value={archivedCount}
              icon={Archive}
              gradient="bg-gradient-to-br from-slate-500 to-slate-600"
              isLoading={filesLoading}
            />
          </Link>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="p-6 rounded-2xl border border-border">
            <h3 className="font-semibold mb-4">Records Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="errorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)' }} fontSize={11} />
                <YAxis tick={{ fill: 'var(--text-muted)' }} width={80} tickFormatter={formatYAxisTick} fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                />
                <Area type="monotone" dataKey="success" stroke="#10B981" fill="url(#successGradient)" strokeWidth={2} />
                <Area type="monotone" dataKey="error" stroke="#F43F5E" fill="url(#errorGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-6 rounded-2xl border border-border">
            <h3 className="font-semibold mb-4">Status Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {statusData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}: {item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card className="p-6 rounded-2xl border border-border">
          <h3 className="font-semibold mb-4">Recent Uploads</h3>
          <DataTable
            columns={columns}
            data={recentFiles}
            isLoading={filesLoading}
            emptyMessage="No files uploaded yet"
          />
        </Card>
      </motion.div>
    </motion.div>
  );
}
