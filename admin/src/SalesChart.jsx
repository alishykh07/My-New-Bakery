import { useEffect, useMemo, useRef } from 'react';
import Highcharts from 'highcharts';

const money = value => `Rs. ${Math.round(value || 0).toLocaleString()}`;

export default function SalesChart({ items, period }) {
  const containerRef = useRef(null);
  const labels = useMemo(() => items.map((item, index) => {
    if (period !== 'week') return item.label;
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - 6 + index);
    return date.toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'short' });
  }), [items, period]);
  const values = useMemo(() => items.map(item => Number(item.value) || 0), [items]);
  const average = useMemo(() => values.map((_, index) => {
    const start = Math.max(0, index - 2);
    const window = values.slice(start, index + 1);
    return window.reduce((sum, value) => sum + value, 0) / window.length;
  }), [values]);

  useEffect(() => {
    if (!containerRef.current || !items.length) return undefined;
    const chart = Highcharts.chart(containerRef.current, {
      chart: {
        type: 'spline',
        backgroundColor: 'transparent',
        plotBackgroundColor: '#fffdfa',
        plotBorderColor: '#ead9bc',
        plotBorderWidth: 1,
        plotBorderRadius: 8,
        spacing: [18, 18, 12, 12],
        animation: { duration: 420 },
        style: { fontFamily: 'DM Sans, sans-serif' },
      },
      title: { text: 'Paid sales trend', align: 'left', style: { color: '#3b0e06', fontFamily: 'Playfair Display, serif', fontSize: '21px', fontWeight: '500' } },
      subtitle: { text: period === 'day' ? 'Today, in four-hour intervals' : period === 'week' ? 'Last seven days' : 'Last thirty days', align: 'left', style: { color: '#8d6b52', fontSize: '11px' } },
      credits: { enabled: false },
      accessibility: { enabled: false },
      legend: { enabled: false },
      xAxis: {
        categories: labels,
        crosshair: { color: '#b9a78e', dashStyle: 'ShortDot', width: 1 },
        lineWidth: 0,
        tickLength: 6,
        tickColor: '#d9c6a7',
        labels: { step: period === 'month' ? 5 : 1, style: { color: '#795139', fontSize: '10px', fontWeight: '600' } },
      },
      yAxis: {
        min: 0,
        allowDecimals: false,
        title: { text: 'Revenue (PKR)', style: { color: '#8d6b52', fontSize: '10px', fontWeight: '600' } },
        gridLineColor: '#eadfce',
        gridLineDashStyle: 'ShortDot',
        labels: { formatter() { return money(this.value); }, style: { color: '#8d6b52', fontSize: '10px' } },
      },
      tooltip: {
        shared: true,
        useHTML: true,
        backgroundColor: '#fffaf0',
        borderColor: '#cba66c',
        borderRadius: 8,
        shadow: { color: 'rgba(59,14,6,.18)', offsetX: 0, offsetY: 7, opacity: .15, width: 14 },
        headerFormat: '<div class="hc-tooltip-date">{point.key}</div><table>',
        pointFormat: '<tr><td><span class="hc-series-dot" style="background:{series.color}"></span>{series.name}</td><td><b>Rs. {point.y:,.0f}</b></td></tr>',
        footerFormat: '</table>',
      },
      plotOptions: {
        series: { animation: { duration: 480 }, lineWidth: 2.5, marker: { enabled: false }, states: { hover: { lineWidthPlus: 0 } } },
      },
      series: [
        { name: 'Paid sales', color: '#7b3518', data: values, zIndex: 2 },
        { name: '3-period average', color: '#8c9098', dashStyle: 'ShortDot', lineWidth: 2, data: average, zIndex: 1 },
      ],
    });
    return () => chart.destroy();
  }, [average, items.length, labels, period, values]);

  if (!items.length) return <div className="sales-empty">No paid sales data yet.</div>;
  const total = values.reduce((sum, value) => sum + value, 0);
  const active = values.filter(value => value > 0).length;
  return <div className="sales-chart-professional">
    <div className="chart-summary"><span><small>Total paid sales</small><b>{money(total)}</b></span><span><small>Average</small><b>{money(total / values.length)}</b></span><span><small>Active periods</small><b>{active} / {values.length}</b></span></div>
    <div ref={containerRef} className="highcharts-container-host"/>
  </div>;
}
