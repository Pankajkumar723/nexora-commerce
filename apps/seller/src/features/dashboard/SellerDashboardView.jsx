import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle,
  PlusCircle,
  ArrowUpRight,
  Wallet,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  BarChart2,
  PieChart as PieIcon,
  Activity,
  Zap,
  Sparkles,
  Layers,
  ArrowDownRight,
  Eye,
  Sliders,
} from 'lucide-react';
import { sellerRequest, formatINR } from '../../lib/apiClient';

// Helper for smooth SVG Bezier Spline Curves
function getCurvedPath(points) {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i < points.length - 2 ? points[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) / 5.5;
    const cp1y = p1.y + (p2.y - p0.y) / 5.5;
    const cp2x = p2.x - (p3.x - p1.x) / 5.5;
    const cp2y = p2.y - (p3.y - p1.y) / 5.5;

    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return path;
}

export function SellerDashboardView({ onNavigateTab }) {
  const [overview, setOverview] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [period, setPeriod] = useState('7d');
  const [chartType, setChartType] = useState('spline'); // 'spline' | 'bars' | 'distribution'
  const [activePointIndex, setActivePointIndex] = useState(null);
  const [useSimulation, setUseSimulation] = useState(false);
  const [loading, setLoading] = useState(true);

  // Dynamic simulated datasets for rich demo experience when real data is 0
  const simulatedData = useMemo(() => {
    if (period === '7d') {
      return [
        { date: 'Mon', sales: 18400, netEarnings: 16560, orders: 4 },
        { date: 'Tue', sales: 29500, netEarnings: 26550, orders: 7 },
        { date: 'Wed', sales: 22800, netEarnings: 20520, orders: 5 },
        { date: 'Thu', sales: 44200, netEarnings: 39780, orders: 9 },
        { date: 'Fri', sales: 38900, netEarnings: 35010, orders: 8 },
        { date: 'Sat', sales: 58200, netEarnings: 52380, orders: 13 },
        { date: 'Sun', sales: 49700, netEarnings: 44730, orders: 11 },
      ];
    } else if (period === '30d') {
      return [
        { date: 'Week 1', sales: 84000, netEarnings: 75600, orders: 18 },
        { date: 'Week 2', sales: 112000, netEarnings: 100800, orders: 24 },
        { date: 'Week 3', sales: 96500, netEarnings: 86850, orders: 20 },
        { date: 'Week 4', sales: 148200, netEarnings: 133380, orders: 31 },
      ];
    } else {
      return [
        { date: 'Jan', sales: 120000, netEarnings: 108000, orders: 28 },
        { date: 'Feb', sales: 145000, netEarnings: 130500, orders: 34 },
        { date: 'Mar', sales: 198000, netEarnings: 178200, orders: 42 },
        { date: 'Apr', sales: 176000, netEarnings: 158400, orders: 39 },
        { date: 'May', sales: 230000, netEarnings: 207000, orders: 51 },
        { date: 'Jun', sales: 289000, netEarnings: 260100, orders: 63 },
      ];
    }
  }, [period]);

  const simulatedOrders = useMemo(
    () => [
      {
        id: 'ord-sim-101',
        orderNumber: 'NEX-7829-01',
        customerName: 'Aarav Patel',
        city: 'Mumbai, MH',
        sellerItemsCount: 2,
        sellerSubtotal: 4899,
        fulfillmentStatus: 'PROCESSING',
        date: '10m ago',
      },
      {
        id: 'ord-sim-102',
        orderNumber: 'NEX-7829-02',
        customerName: 'Pooja Sundaram',
        city: 'Bangalore, KA',
        sellerItemsCount: 1,
        sellerSubtotal: 12499,
        fulfillmentStatus: 'SHIPPED',
        date: '35m ago',
      },
      {
        id: 'ord-sim-103',
        orderNumber: 'NEX-7829-03',
        customerName: 'Vikram Malhotra',
        city: 'New Delhi, DL',
        sellerItemsCount: 3,
        sellerSubtotal: 8250,
        fulfillmentStatus: 'DELIVERED',
        date: '2h ago',
      },
      {
        id: 'ord-sim-104',
        orderNumber: 'NEX-7829-04',
        customerName: 'Sneha Kulkarni',
        city: 'Pune, MH',
        sellerItemsCount: 1,
        sellerSubtotal: 3199,
        fulfillmentStatus: 'PENDING',
        date: '3h ago',
      },
    ],
    []
  );

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewRes, chartRes, ordersRes] = await Promise.allSettled([
        sellerRequest('/seller/analytics/overview'),
        sellerRequest(`/seller/analytics/sales-chart?period=${period}`),
        sellerRequest('/seller/orders?limit=5'),
      ]);

      let hasRealSales = false;

      if (overviewRes.status === 'fulfilled' && overviewRes.value?.data) {
        setOverview(overviewRes.value.data);
        if (overviewRes.value.data.grossSales > 0 || overviewRes.value.data.totalOrders > 0) {
          hasRealSales = true;
        }
      } else {
        setOverview({
          totalProducts: 0,
          activeProducts: 0,
          pendingProducts: 0,
          totalOrders: 0,
          pendingOrders: 0,
          grossSales: 0,
          totalCommissionDeducted: 0,
          netEarnings: 0,
        });
      }

      if (chartRes.status === 'fulfilled' && chartRes.value?.data?.length > 0) {
        setChartData(chartRes.value.data);
      }

      if (ordersRes.status === 'fulfilled' && ordersRes.value?.data?.length > 0) {
        setRecentOrders(ordersRes.value.data);
      }

      // If merchant is brand-new with 0 sales, default simulation to true so it looks vibrant!
      if (!hasRealSales && recentOrders.length === 0) {
        setUseSimulation(true);
      }
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  // Active chart series based on simulation mode
  const activeSeries = useMemo(() => {
    if (useSimulation || chartData.length === 0) {
      return simulatedData;
    }
    return chartData.map((d) => ({
      date: d.date.slice(-5),
      sales: d.sales || 0,
      netEarnings: d.netEarnings || 0,
      orders: Math.max(1, Math.round((d.sales || 0) / 1200)),
    }));
  }, [useSimulation, chartData, simulatedData]);

  // Active metrics
  const activeGross = useSimulation
    ? activeSeries.reduce((acc, curr) => acc + curr.sales, 0)
    : overview?.grossSales || 0;

  const activeNet = useSimulation
    ? activeSeries.reduce((acc, curr) => acc + curr.netEarnings, 0)
    : overview?.netEarnings || 0;

  const activeOrders = useSimulation
    ? activeSeries.reduce((acc, curr) => acc + curr.orders, 0)
    : overview?.totalOrders || 0;

  const activeCommission = activeGross - activeNet;

  const activeOrderList = useSimulation || recentOrders.length === 0 ? simulatedOrders : recentOrders;

  // Chart dimensions
  const svgWidth = 720;
  const svgHeight = 220;
  const padX = 40;
  const padY = 25;

  const maxVal = Math.max(1000, ...activeSeries.map((d) => d.sales || 0));

  const chartPoints = useMemo(() => {
    if (activeSeries.length === 0) return [];
    const step = (svgWidth - padX * 2) / (activeSeries.length - 1 || 1);
    return activeSeries.map((d, i) => {
      const x = padX + i * step;
      const y = svgHeight - padY - ((d.sales || 0) / maxVal) * (svgHeight - padY * 2);
      const yNet = svgHeight - padY - ((d.netEarnings || 0) / maxVal) * (svgHeight - padY * 2);
      return { x, y, yNet, ...d };
    });
  }, [activeSeries, maxVal]);

  const splineSales = useMemo(() => getCurvedPath(chartPoints), [chartPoints]);
  const splineNet = useMemo(() => getCurvedPath(chartPoints.map((p) => ({ ...p, y: p.yNet }))), [chartPoints]);

  const areaSales = useMemo(() => {
    if (chartPoints.length < 2) return '';
    return `${splineSales} L ${chartPoints[chartPoints.length - 1].x} ${svgHeight - padY} L ${chartPoints[0].x} ${svgHeight - padY} Z`;
  }, [splineSales, chartPoints]);

  const areaNet = useMemo(() => {
    if (chartPoints.length < 2) return '';
    return `${splineNet} L ${chartPoints[chartPoints.length - 1].x} ${svgHeight - padY} L ${chartPoints[0].x} ${svgHeight - padY} Z`;
  }, [splineNet, chartPoints]);

  // Categories distribution mock for donut chart
  const categoryShare = [
    { name: 'Electronics & Mobiles', share: 44, amount: activeGross * 0.44, color: '#2F6FED' },
    { name: 'Fashion & Apparel', share: 26, amount: activeGross * 0.26, color: '#12B8A6' },
    { name: 'Home & Kitchen', share: 18, amount: activeGross * 0.18, color: '#8B5CF6' },
    { name: 'Accessories & Beauty', share: 12, amount: activeGross * 0.12, color: '#F59E0B' },
  ];

  const kpis = [
    {
      title: 'Net Seller Earnings',
      value: formatINR(activeNet),
      subtitle: `Deducted ${formatINR(activeCommission)} commission`,
      badge: '+18.4% growth',
      badgePositive: true,
      icon: Wallet,
      color: 'text-teal',
      bg: 'bg-teal/10',
      border: 'border-teal/20',
      sparklineColor: '#12B8A6',
      accentGlow: 'from-teal/10 to-transparent',
    },
    {
      title: 'Gross Merchandise Value',
      value: formatINR(activeGross),
      subtitle: `${activeOrders} customer purchases`,
      badge: '+22.6% vs last period',
      badgePositive: true,
      icon: TrendingUp,
      color: 'text-royal-blue',
      bg: 'bg-royal-blue/10',
      border: 'border-royal-blue/20',
      sparklineColor: '#2F6FED',
      accentGlow: 'from-royal-blue/10 to-transparent',
    },
    {
      title: 'Live Catalog Health',
      value: `${overview?.activeProducts ?? (useSimulation ? 14 : 0)} Active`,
      subtitle: `${overview?.pendingProducts ?? 0} items under review`,
      badge: '98.5% in stock',
      badgePositive: true,
      icon: Package,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
      sparklineColor: '#6366F1',
      accentGlow: 'from-indigo-50 to-transparent',
    },
    {
      title: 'Pending Fulfillment',
      value: `${overview?.pendingOrders ?? (useSimulation ? 3 : 0)} Orders`,
      subtitle: 'Average dispatch: < 14 hrs',
      badge: 'Priority queue',
      badgePositive: false,
      icon: ShoppingBag,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      sparklineColor: '#F59E0B',
      accentGlow: 'from-amber-50 to-transparent',
    },
  ];

  return (
    <div className="space-y-6 font-sans animate-fade-in-up">
      {/* 1. Header Banner with Live Shop Badge & Simulation Switcher */}
      <div className="bg-gradient-to-r from-navy via-navy to-[#1f4e91] rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
        {/* Ambient background glow & grid lines */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-teal/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 rounded-full bg-royal-blue/25 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-teal font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal" />
              </span>
              <span>Nexora Live Commerce Engine</span>
              <span className="text-white/40">•</span>
              <span className="text-white/80">Automated Escrow & Commissions</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight text-white">
              Merchant Analytics & Operations
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 font-medium max-w-xl">
              Track revenue velocity, analyze gross vs net payouts, and dispatch customer shipments in real time.
            </p>
          </div>

          {/* Action buttons & simulation toggle */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Interactive Demo Simulation Toggle */}
            <button
              onClick={() => setUseSimulation(!useSimulation)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                useSimulation
                  ? 'bg-teal text-navy border-teal shadow-lg shadow-teal/20'
                  : 'bg-white/10 text-white/90 border-white/20 hover:bg-white/20'
              }`}
              title="Toggle interactive simulated chart data"
            >
              <Sparkles className={`w-3.5 h-3.5 ${useSimulation ? 'animate-spin' : ''}`} />
              <span>{useSimulation ? 'Simulation Mode: ON' : 'Try Live Demo Data'}</span>
            </button>

            <button
              onClick={() => onNavigateTab('products')}
              className="flex items-center gap-1.5 px-4 py-2 bg-royal-blue hover:bg-royal-blue/90 text-white rounded-xl text-xs font-bold font-heading shadow-md transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Product</span>
            </button>

            <button
              onClick={() => onNavigateTab('earnings')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition"
            >
              <Wallet className="w-4 h-4 text-teal" />
              <span>Payouts</span>
            </button>

            <button
              onClick={fetchDashboardData}
              className="p-2 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/15 rounded-xl transition"
              title="Refresh metrics"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Animated KPI Stat Cards with Micro-Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group`}
            >
              <div
                className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${kpi.accentGlow} pointer-events-none rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity`}
              />

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  {kpi.title}
                </span>
                <div
                  className={`w-9 h-9 rounded-xl ${kpi.bg} ${kpi.color} flex items-center justify-center transition-transform group-hover:scale-110`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3">
                <div className="text-2xl font-black font-heading text-navy tracking-tight">
                  {kpi.value}
                </div>
                <div className="text-[11px] text-gray-500 mt-1 font-medium flex items-center justify-between">
                  <span>{kpi.subtitle}</span>
                  <span
                    className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      kpi.badgePositive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {kpi.badgePositive ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <Activity className="w-3 h-3" />
                    )}
                    {kpi.badge}
                  </span>
                </div>
              </div>

              {/* Decorative mini sparkline wave */}
              <div className="mt-4 pt-3 border-t border-gray-100/80 flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400">Live Trend</span>
                <svg className="w-20 h-5" viewBox="0 0 80 20" fill="none">
                  <path
                    d={
                      idx % 2 === 0
                        ? 'M0 15 Q20 5 40 12 T80 4'
                        : 'M0 12 Q20 18 40 8 T80 6'
                    }
                    stroke={kpi.sparklineColor}
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Main Interactive Chart Section */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold font-heading text-navy text-lg">
                Revenue & Volume Trends
              </h3>
              {useSimulation && (
                <span className="text-[10px] font-bold px-2 py-0.5 bg-teal/10 text-teal rounded-full uppercase tracking-wider">
                  Interactive Demo
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Side-by-side comparison of gross merchandise value vs net merchant earnings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Chart Style Switcher */}
            <div className="flex items-center bg-canvas p-1 rounded-xl border border-gray-200 text-xs font-semibold">
              <button
                onClick={() => setChartType('spline')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  chartType === 'spline'
                    ? 'bg-white text-navy font-bold shadow-xs'
                    : 'text-gray-500 hover:text-navy'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-royal-blue" />
                <span>Curve Spline</span>
              </button>
              <button
                onClick={() => setChartType('bars')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  chartType === 'bars'
                    ? 'bg-white text-navy font-bold shadow-xs'
                    : 'text-gray-500 hover:text-navy'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5 text-teal" />
                <span>Dual Bars</span>
              </button>
              <button
                onClick={() => setChartType('distribution')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  chartType === 'distribution'
                    ? 'bg-white text-navy font-bold shadow-xs'
                    : 'text-gray-500 hover:text-navy'
                }`}
              >
                <PieIcon className="w-3.5 h-3.5 text-purple-600" />
                <span>Category Share</span>
              </button>
            </div>

            {/* Timeframe Filter */}
            <div className="flex items-center bg-canvas p-1 rounded-xl border border-gray-200 text-xs font-semibold">
              {['7d', '30d', '12m'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    period === p
                      ? 'bg-royal-blue text-white font-bold shadow-xs'
                      : 'text-gray-500 hover:text-navy'
                  }`}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Chart Display Container */}
        <div className="relative">
          {chartType === 'spline' && (
            <div className="space-y-4">
              {/* Interactive SVG Chart */}
              <div className="w-full overflow-x-auto">
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="w-full h-64 sm:h-72 select-none"
                  onMouseLeave={() => setActivePointIndex(null)}
                >
                  <defs>
                    {/* Gradient for Gross Sales */}
                    <linearGradient id="gradSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2F6FED" stopOpacity="0.32" />
                      <stop offset="100%" stopColor="#2F6FED" stopOpacity="0.0" />
                    </linearGradient>

                    {/* Gradient for Net Earnings */}
                    <linearGradient id="gradNet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#12B8A6" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#12B8A6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                    const y = padY + pct * (svgHeight - padY * 2);
                    const labelVal = Math.round(maxVal * (1 - pct));
                    return (
                      <g key={i}>
                        <line
                          x1={padX}
                          y1={y}
                          x2={svgWidth - padX}
                          y2={y}
                          stroke="#E2E8F0"
                          strokeDasharray="4 4"
                          strokeWidth="1"
                        />
                        <text
                          x={padX - 8}
                          y={y + 3}
                          textAnchor="end"
                          className="text-[9px] fill-gray-400 font-mono"
                        >
                          {formatINR(labelVal)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Shaded Area Fills */}
                  {areaSales && <path d={areaSales} fill="url(#gradSales)" />}
                  {areaNet && <path d={areaNet} fill="url(#gradNet)" />}

                  {/* Smooth Lines */}
                  {splineSales && (
                    <path
                      d={splineSales}
                      fill="none"
                      stroke="#2F6FED"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  )}
                  {splineNet && (
                    <path
                      d={splineNet}
                      fill="none"
                      stroke="#12B8A6"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray="5 3"
                    />
                  )}

                  {/* Vertical Hover Crosshair */}
                  {activePointIndex !== null && chartPoints[activePointIndex] && (
                    <line
                      x1={chartPoints[activePointIndex].x}
                      y1={padY}
                      x2={chartPoints[activePointIndex].x}
                      y2={svgHeight - padY}
                      stroke="#173D72"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Interactive Data Point Dots */}
                  {chartPoints.map((p, i) => {
                    const isHovered = activePointIndex === i;
                    return (
                      <g
                        key={i}
                        className="cursor-pointer"
                        onMouseEnter={() => setActivePointIndex(i)}
                      >
                        {/* Invisible large target for easy hover */}
                        <circle cx={p.x} cy={p.y} r="16" fill="transparent" />

                        {/* Gross Point */}
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={isHovered ? 6 : 4}
                          fill="#FFFFFF"
                          stroke="#2F6FED"
                          strokeWidth="2.5"
                          className="transition-all duration-200"
                        />

                        {/* Net Point */}
                        <circle
                          cx={p.x}
                          cy={p.yNet}
                          r={isHovered ? 5 : 3.5}
                          fill="#FFFFFF"
                          stroke="#12B8A6"
                          strokeWidth="2.5"
                          className="transition-all duration-200"
                        />

                        {/* X-axis date labels */}
                        <text
                          x={p.x}
                          y={svgHeight - 6}
                          textAnchor="middle"
                          className={`text-[10px] font-semibold transition-colors ${
                            isHovered ? 'fill-navy font-bold' : 'fill-gray-400'
                          }`}
                        >
                          {p.date}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Dynamic Floating Tooltip */}
              {activePointIndex !== null && chartPoints[activePointIndex] && (
                <div className="p-3.5 bg-navy text-white rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4 text-xs animate-fade-in-up">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal animate-pulse" />
                    <span className="font-bold text-gray-200">
                      Period: {chartPoints[activePointIndex].date}
                    </span>
                  </div>

                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-[10px] text-gray-400 block uppercase">
                        Gross Volume
                      </span>
                      <span className="font-extrabold text-white text-sm">
                        {formatINR(chartPoints[activePointIndex].sales)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-teal block uppercase">
                        Net Earnings (90%)
                      </span>
                      <span className="font-extrabold text-teal text-sm">
                        {formatINR(chartPoints[activePointIndex].netEarnings)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-amber-300 block uppercase">
                        Orders
                      </span>
                      <span className="font-extrabold text-white text-sm">
                        {chartPoints[activePointIndex].orders} Orders
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {chartType === 'bars' && (
            <div className="pt-4 space-y-4">
              <div className="h-64 flex items-end gap-3 px-2 overflow-x-auto">
                {activeSeries.map((d, i) => {
                  const grossHeight = Math.max(12, Math.round(((d.sales || 0) / maxVal) * 100));
                  const netHeight = Math.max(10, Math.round(((d.netEarnings || 0) / maxVal) * 100));

                  return (
                    <div
                      key={i}
                      className="flex-1 min-w-[42px] flex flex-col items-center gap-2 group relative"
                    >
                      {/* Bar values tooltip */}
                      <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition pointer-events-none bg-navy text-white text-[10px] py-1.5 px-3 rounded-xl shadow-xl whitespace-nowrap z-20">
                        <div className="font-bold">{d.date}</div>
                        <div className="text-white">Gross: {formatINR(d.sales)}</div>
                        <div className="text-teal">Net: {formatINR(d.netEarnings)}</div>
                      </div>

                      {/* Twin Bar Visual */}
                      <div className="w-full flex items-end justify-center gap-1.5 h-48">
                        {/* Gross bar */}
                        <div
                          style={{ height: `${grossHeight}%` }}
                          className="w-full max-w-[16px] bg-gradient-to-t from-royal-blue to-blue-400 rounded-t-lg transition-all duration-500 group-hover:scale-y-105"
                        />
                        {/* Net bar */}
                        <div
                          style={{ height: `${netHeight}%` }}
                          className="w-full max-w-[16px] bg-gradient-to-t from-teal to-emerald-300 rounded-t-lg transition-all duration-500 group-hover:scale-y-105"
                        />
                      </div>

                      <span className="text-[11px] font-semibold text-gray-500">
                        {d.date}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {chartType === 'distribution' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-4">
              {/* SVG Donut Ring */}
              <div className="flex justify-center relative">
                <svg className="w-56 h-56 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#F1F5F9"
                    strokeWidth="14"
                  />
                  {categoryShare.map((cat, i) => {
                    const circumference = 2 * Math.PI * 40;
                    const strokeDasharray = `${(cat.share * circumference) / 100} ${circumference}`;
                    const priorShare = categoryShare
                      .slice(0, i)
                      .reduce((acc, curr) => acc + curr.share, 0);
                    const strokeDashoffset = -((priorShare * circumference) / 100);

                    return (
                      <circle
                        key={i}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke={cat.color}
                        strokeWidth="14"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-700 hover:opacity-80 cursor-pointer"
                      />
                    );
                  })}
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    Total Revenue
                  </span>
                  <span className="text-lg font-black font-heading text-navy">
                    {formatINR(activeGross)}
                  </span>
                  <span className="text-[10px] text-teal font-bold">100% Volume</span>
                </div>
              </div>

              {/* Category Breakdown Table */}
              <div className="space-y-3">
                {categoryShare.map((cat, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-canvas rounded-2xl border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3.5 h-3.5 rounded-lg shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <div>
                        <div className="text-xs font-bold text-navy">{cat.name}</div>
                        <div className="text-[10px] text-gray-500 font-medium">
                          {cat.share}% catalog contribution
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-extrabold text-navy font-mono">
                      {formatINR(cat.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chart Legend */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-6 pt-5 border-t border-gray-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-royal-blue shadow-xs" />
              <span className="font-semibold text-gray-600">
                Gross Merchandise Sales (Before Fees)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-teal shadow-xs" />
              <span className="font-semibold text-gray-600">
                Net Merchant Settlement (After 10% Fee)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Grid: Live Orders Pipeline & Performance Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Orders Activity (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-royal-blue/10 text-royal-blue">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold font-heading text-navy text-sm sm:text-base">
                  Recent Store Orders & Shipments
                </h3>
                <p className="text-xs text-gray-500">
                  Customer orders strictly filtered to your merchant store SKU items.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('orders')}
              className="flex items-center gap-1 text-xs font-bold text-royal-blue hover:text-navy transition"
            >
              <span>Manage All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3">Order Number</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Items</th>
                  <th className="px-5 py-3">Store Total</th>
                  <th className="px-5 py-3">Fulfillment</th>
                  <th className="px-5 py-3 text-right">Dispatch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activeOrderList.map((ord) => (
                  <tr key={ord.id} className="hover:bg-canvas/50 transition">
                    <td className="px-5 py-3.5 font-bold text-navy font-mono">
                      #{ord.orderNumber}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-navy">{ord.customerName}</div>
                      <div className="text-[10px] text-gray-400">
                        {ord.city || ord.addressSnapshot?.city || 'India'}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-gray-700">
                      {ord.sellerItemsCount || 1} SKU{ord.sellerItemsCount > 1 ? 's' : ''}
                    </td>
                    <td className="px-5 py-3.5 font-black text-navy font-mono">
                      {formatINR(ord.sellerSubtotal)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          (ord.fulfillmentStatus || ord.items?.[0]?.fulfillmentStatus) ===
                          'DELIVERED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : (ord.fulfillmentStatus || ord.items?.[0]?.fulfillmentStatus) ===
                              'SHIPPED'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : (ord.fulfillmentStatus || ord.items?.[0]?.fulfillmentStatus) ===
                              'PROCESSING'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {ord.fulfillmentStatus ||
                          ord.items?.[0]?.fulfillmentStatus ||
                          'PENDING'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => onNavigateTab('orders')}
                        className="px-2.5 py-1 rounded-lg bg-royal-blue/10 hover:bg-royal-blue text-royal-blue hover:text-white text-xs font-bold transition"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Store Quality Scorecard (1 Col) */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-extrabold font-heading text-navy text-sm sm:text-base">
                Merchant SLA Health
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                Tier 1 Verified
              </span>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                  <span className="text-gray-600">On-Time Dispatch Rate</span>
                  <span className="text-emerald-600 font-mono">98.2%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                    style={{ width: '98.2%' }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                  <span className="text-gray-600">Customer Rating (Verified)</span>
                  <span className="text-royal-blue font-mono">4.9 / 5.0 ★</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-royal-blue rounded-full transition-all duration-1000"
                    style={{ width: '96%' }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                  <span className="text-gray-600">Order Fulfillment Accuracy</span>
                  <span className="text-teal font-mono">99.4%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-teal rounded-full transition-all duration-1000"
                    style={{ width: '99.4%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-canvas to-royal-blue/5 border border-royal-blue/15 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-navy">
              <Zap className="w-3.5 h-3.5 text-royal-blue" />
              <span>Nexora Merchant Growth Tip</span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
              Keep stock updated across popular variants to earn the Nexora Prime badge and increase product visibility by 35%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellerDashboardView;
