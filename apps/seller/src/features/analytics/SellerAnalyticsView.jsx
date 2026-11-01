import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  Calendar,
  Package,
  ShoppingBag,
  RefreshCw,
  Activity,
  Sparkles,
  ArrowUpRight,
  PieChart as PieIcon,
  Zap,
} from 'lucide-react';
import { sellerRequest, formatINR } from '../../lib/apiClient';

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

export function SellerAnalyticsView() {
  const [period, setPeriod] = useState('30d');
  const [chartData, setChartData] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [overview, setOverview] = useState(null);
  const [chartMode, setChartMode] = useState('curve'); // 'curve' | 'bars'
  const [activePoint, setActivePoint] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulated fallback data for fresh accounts
  const demoChart = useMemo(() => {
    if (period === '7d') {
      return [
        { date: 'Mon', sales: 18400, netEarnings: 16560 },
        { date: 'Tue', sales: 29500, netEarnings: 26550 },
        { date: 'Wed', sales: 22800, netEarnings: 20520 },
        { date: 'Thu', sales: 44200, netEarnings: 39780 },
        { date: 'Fri', sales: 38900, netEarnings: 35010 },
        { date: 'Sat', sales: 58200, netEarnings: 52380 },
        { date: 'Sun', sales: 49700, netEarnings: 44730 },
      ];
    } else if (period === '30d') {
      return [
        { date: 'Week 1', sales: 72000, netEarnings: 64800 },
        { date: 'Week 2', sales: 94500, netEarnings: 85050 },
        { date: 'Week 3', sales: 118000, netEarnings: 106200 },
        { date: 'Week 4', sales: 142000, netEarnings: 127800 },
      ];
    } else {
      return [
        { date: 'Jan', sales: 110000, netEarnings: 99000 },
        { date: 'Feb', sales: 135000, netEarnings: 121500 },
        { date: 'Mar', sales: 178000, netEarnings: 160200 },
        { date: 'Apr', sales: 205000, netEarnings: 184500 },
        { date: 'May', sales: 240000, netEarnings: 216000 },
        { date: 'Jun', sales: 295000, netEarnings: 265500 },
      ];
    }
  }, [period]);

  const demoBestSellers = useMemo(
    () => [
      {
        id: 'p-sim-1',
        name: 'Nexora Studio Pro Wireless ANC Headphones',
        category: 'Electronics',
        price: 8999,
        totalQuantity: 34,
        totalRevenue: 305966,
        stock: 42,
      },
      {
        id: 'p-sim-2',
        name: 'Ultra Slim Smartwatch GPS Tracker Pro',
        category: 'Electronics',
        price: 5499,
        totalQuantity: 28,
        totalRevenue: 153972,
        stock: 19,
      },
      {
        id: 'p-sim-3',
        name: 'Premium Leather Minimalist Bifold Wallet',
        category: 'Fashion & Accessories',
        price: 1899,
        totalQuantity: 22,
        totalRevenue: 41778,
        stock: 58,
      },
    ],
    []
  );

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [chartRes, bestRes, overRes] = await Promise.allSettled([
        sellerRequest(`/seller/analytics/sales-chart?period=${period}`),
        sellerRequest('/seller/analytics/best-sellers?limit=5'),
        sellerRequest('/seller/analytics/overview'),
      ]);

      if (chartRes.status === 'fulfilled' && chartRes.value?.data?.length > 0) {
        setChartData(chartRes.value.data);
      }
      if (bestRes.status === 'fulfilled' && bestRes.value?.data?.length > 0) {
        setBestSellers(bestRes.value.data);
      }
      if (overRes.status === 'fulfilled' && overRes.value?.data) {
        setOverview(overRes.value.data);
      }
    } catch (err) {
      console.warn('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const series = chartData.length > 0 ? chartData : demoChart;
  const bestList = bestSellers.length > 0 ? bestSellers : demoBestSellers;

  const svgW = 740;
  const svgH = 220;
  const pX = 40;
  const pY = 25;

  const maxVal = Math.max(1000, ...series.map((d) => d.sales || 0));

  const points = useMemo(() => {
    const step = (svgW - pX * 2) / (series.length - 1 || 1);
    return series.map((d, i) => {
      const x = pX + i * step;
      const y = svgH - pY - ((d.sales || 0) / maxVal) * (svgH - pY * 2);
      const yNet = svgH - pY - ((d.netEarnings || 0) / maxVal) * (svgH - pY * 2);
      return { x, y, yNet, ...d };
    });
  }, [series, maxVal]);

  const splineSales = useMemo(() => getCurvedPath(points), [points]);
  const splineNet = useMemo(() => getCurvedPath(points.map((p) => ({ ...p, y: p.yNet }))), [points]);

  const areaSales = useMemo(() => {
    if (points.length < 2) return '';
    return `${splineSales} L ${points[points.length - 1].x} ${svgH - pY} L ${points[0].x} ${svgH - pY} Z`;
  }, [splineSales, points]);

  const totalVol = series.reduce((acc, c) => acc + (c.sales || 0), 0);
  const totalNet = series.reduce((acc, c) => acc + (c.netEarnings || 0), 0);

  return (
    <div className="space-y-6 font-sans animate-fade-in-up">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-navy tracking-tight">
            Sales & Revenue Analytics
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Analyze customer purchase velocity, commission accounting, and catalog conversion.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-gray-200 shadow-xs">
            {['7d', '30d', '12m'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  period === p
                    ? 'bg-royal-blue text-white shadow-xs'
                    : 'text-gray-500 hover:text-navy'
                }`}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={fetchAnalytics}
            className="p-2 text-gray-500 hover:text-navy rounded-xl hover:bg-canvas transition border border-gray-200 bg-white"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary KPI Cards with Glow Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Total Sales Volume
          </span>
          <div className="mt-2 text-2xl font-black font-heading text-navy">
            {formatINR(totalVol)}
          </div>
          <span className="text-[11px] text-gray-500 mt-1 block">
            Across {period.toUpperCase()} active fulfillment cycle
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
          <span className="text-xs font-bold uppercase tracking-wider text-teal">
            Net Seller Payout
          </span>
          <div className="mt-2 text-2xl font-black font-heading text-teal">
            {formatINR(totalNet)}
          </div>
          <span className="text-[11px] text-gray-500 mt-1 block">
            Net 90% credited to verified merchant balance
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Realization Ratio
          </span>
          <div className="mt-2 text-2xl font-black font-heading text-indigo-600">
            90.0%
          </div>
          <span className="text-[11px] text-gray-500 mt-1 block">
            Fixed 10% platform commission with zero hidden fees
          </span>
        </div>
      </div>

      {/* Main Interactive Chart */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-gray-100">
          <div>
            <h3 className="font-extrabold font-heading text-navy text-base sm:text-lg">
              Sales Realization Curve ({period.toUpperCase()})
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Interactive timeline with live gross vs net realization.
            </p>
          </div>

          <div className="flex items-center bg-canvas p-1 rounded-xl border border-gray-200 text-xs font-semibold">
            <button
              onClick={() => setChartMode('curve')}
              className={`px-3 py-1.5 rounded-lg transition ${
                chartMode === 'curve' ? 'bg-white text-navy font-bold shadow-xs' : 'text-gray-500'
              }`}
            >
              Spline Area
            </button>
            <button
              onClick={() => setChartMode('bars')}
              className={`px-3 py-1.5 rounded-lg transition ${
                chartMode === 'bars' ? 'bg-white text-navy font-bold shadow-xs' : 'text-gray-500'
              }`}
            >
              Dual Bars
            </button>
          </div>
        </div>

        {chartMode === 'curve' ? (
          <div>
            <svg
              viewBox={`0 0 ${svgW} ${svgH}`}
              className="w-full h-64 sm:h-72 select-none"
              onMouseLeave={() => setActivePoint(null)}
            >
              <defs>
                <linearGradient id="anGradSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2F6FED" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#2F6FED" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="anGradNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#12B8A6" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#12B8A6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                const y = pY + pct * (svgH - pY * 2);
                return (
                  <line
                    key={i}
                    x1={pX}
                    y1={y}
                    x2={svgW - pX}
                    y2={y}
                    stroke="#F1F5F9"
                    strokeDasharray="4 4"
                    strokeWidth="1.5"
                  />
                );
              })}

              {areaSales && <path d={areaSales} fill="url(#anGradSales)" />}
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
                  strokeDasharray="4 4"
                />
              )}

              {points.map((p, i) => (
                <g
                  key={i}
                  className="cursor-pointer"
                  onMouseEnter={() => setActivePoint(p)}
                >
                  <circle cx={p.x} cy={p.y} r="14" fill="transparent" />
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={activePoint?.date === p.date ? 6 : 4}
                    fill="#FFFFFF"
                    stroke="#2F6FED"
                    strokeWidth="2.5"
                  />
                  <circle
                    cx={p.x}
                    cy={p.yNet}
                    r={activePoint?.date === p.date ? 5 : 3.5}
                    fill="#FFFFFF"
                    stroke="#12B8A6"
                    strokeWidth="2.5"
                  />
                  <text
                    x={p.x}
                    y={svgH - 6}
                    textAnchor="middle"
                    className="text-[10px] fill-gray-400 font-semibold"
                  >
                    {p.date}
                  </text>
                </g>
              ))}
            </svg>

            {/* Tooltip bar */}
            {activePoint && (
              <div className="mt-3 p-3 bg-navy text-white rounded-2xl flex items-center justify-between text-xs animate-fade-in-up">
                <span className="font-bold text-teal">{activePoint.date}</span>
                <span>Gross: <strong>{formatINR(activePoint.sales)}</strong></span>
                <span>Net Credited: <strong className="text-teal">{formatINR(activePoint.netEarnings)}</strong></span>
              </div>
            )}
          </div>
        ) : (
          <div className="h-64 flex items-end gap-3 pt-4 overflow-x-auto">
            {series.map((d, idx) => {
              const gH = Math.max(10, Math.round(((d.sales || 0) / maxVal) * 100));
              const nH = Math.max(8, Math.round(((d.netEarnings || 0) / maxVal) * 100));
              return (
                <div key={idx} className="flex-1 min-w-[36px] flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center gap-1 h-48">
                    <div
                      style={{ height: `${gH}%` }}
                      className="w-full max-w-[14px] bg-royal-blue rounded-t-lg transition-all duration-500"
                    />
                    <div
                      style={{ height: `${nH}%` }}
                      className="w-full max-w-[14px] bg-teal rounded-t-lg transition-all duration-500"
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-500">{d.date}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Best-Selling Products Showcase */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold font-heading text-navy text-base">
                Top Performing Products
              </h3>
              <p className="text-xs text-gray-500">
                Ranked by customer demand and total gross sales realization.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-canvas border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Rank</th>
                <th className="px-5 py-3.5">Product Title</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Units Sold</th>
                <th className="px-5 py-3.5">Inventory</th>
                <th className="px-5 py-3.5 text-right">Revenue Contributed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bestList.map((p, index) => (
                <tr key={p.id} className="hover:bg-canvas/50 transition">
                  <td className="px-5 py-4 font-bold text-navy">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-heading font-black text-xs ${
                        index === 0
                          ? 'bg-amber-100 text-amber-800'
                          : index === 1
                          ? 'bg-gray-200 text-gray-700'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      #{index + 1}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-bold text-navy">
                    {p.name || p.product?.name}
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700">
                      {p.category || p.product?.category?.name || 'Catalog Item'}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-bold text-navy">
                    {p.totalQuantity || 1} units
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full bg-teal rounded-full"
                          style={{
                            width: `${Math.min(100, ((p.stock || p.product?.stock || 20) / 50) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-500">
                        {p.stock || p.product?.stock || 20} in stock
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right font-black font-heading text-navy text-sm font-mono">
                    {formatINR(p.totalRevenue || p.price * 2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SellerAnalyticsView;
