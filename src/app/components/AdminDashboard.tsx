import { useEffect, useMemo, useState } from 'react';
import { User } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Calendar as CalendarIcon, TrendingUp, TrendingDown, Users, CheckCircle, Percent } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subDays, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { getDayChar } from '@/lib/date-utils';

interface AdminDashboardProps {
  user: User;
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const today = new Date();
  const [dateFrom, setDateFrom] = useState<Date>(today);
  const [dateTo, setDateTo] = useState<Date>(today);
  const [quickRange, setQuickRange] = useState('today');
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<any[]>([]);
  const [lastWeekEntries, setLastWeekEntries] = useState<any[]>([]);

  const handleQuickRange = (range: string) => {
    setQuickRange(range);
    const today = new Date();

    switch (range) {
      case 'today':
        setDateFrom(today);
        setDateTo(today);
        break;
      case 'month':
        setDateFrom(startOfMonth(today));
        setDateTo(endOfMonth(today));
        break;
      case 'custom':
        // Keep current dates
        break;
    }
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const startDate = format(dateFrom, 'yyyy-MM-dd');
        const endDate = format(dateTo, 'yyyy-MM-dd');

        // Calculate last week's date range (same duration, shifted back by the duration + 1 day)
        const rangeDays = differenceInDays(dateTo, dateFrom);
        const lastWeekEnd = subDays(dateFrom, 1);
        const lastWeekStart = subDays(lastWeekEnd, rangeDays);
        const lastWeekStartDate = format(lastWeekStart, 'yyyy-MM-dd');
        const lastWeekEndDate = format(lastWeekEnd, 'yyyy-MM-dd');

        // Fetch current period and last week data in parallel
        const [currentResult, lastWeekResult] = await Promise.all([
          supabase
            .from('guest_entries')
            .select(
              `
              id,
              status,
              guest_type,
              business_date,
              checked_in_at,
              created_by,
              created_by_profile:profiles!guest_entries_created_by_fkey (
                display_name,
                username
              )
            `,
            )
            .eq('club_id', user.clubId)
            .gte('business_date', startDate)
            .lte('business_date', endDate),
          supabase
            .from('guest_entries')
            .select('id, status')
            .eq('club_id', user.clubId)
            .gte('business_date', lastWeekStartDate)
            .lte('business_date', lastWeekEndDate),
        ]);

        if (currentResult.error) throw currentResult.error;
        if (lastWeekResult.error) throw lastWeekResult.error;

        setEntries(currentResult.data || []);
        setLastWeekEntries(lastWeekResult.data || []);
      } catch (error) {
        console.error('Error fetching dashboard:', error);
        toast.error('대시보드 데이터를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [dateFrom, dateTo, user.clubId]);

  const kpiData = useMemo(() => {
    const totalRegistered = entries.length;
    const totalCheckedIn = entries.filter((entry) => entry.status === 'CHECKED_IN').length;
    const freeGuests = entries.filter((entry) => entry.guest_type === 'FREE').length;
    const paidGuests = entries.filter((entry) => entry.guest_type === 'PAID').length;
    const checkInRate = totalRegistered
      ? Number(((totalCheckedIn / totalRegistered) * 100).toFixed(1))
      : 0;

    return { totalRegistered, totalCheckedIn, checkInRate, freeGuests, paidGuests };
  }, [entries]);

  const weeklyComparison = useMemo(() => {
    // Calculate comparison period dates
    const rangeDays = differenceInDays(dateTo, dateFrom);
    const lastWeekEnd = subDays(dateFrom, 1);
    const lastWeekStart = subDays(lastWeekEnd, rangeDays);

    // Format comparison period with day of week
    // If single day, show only one date; otherwise show range
    const isSingleDay = rangeDays === 0;
    const comparisonPeriod = isSingleDay
      ? `${format(lastWeekEnd, 'MM/dd')}(${getDayChar(lastWeekEnd)})`
      : `${format(lastWeekStart, 'MM/dd')}(${getDayChar(lastWeekStart)})~${format(lastWeekEnd, 'MM/dd')}(${getDayChar(lastWeekEnd)})`;

    if (lastWeekEntries.length === 0) {
      return { diff: null, isPositive: true, hasData: false, comparisonPeriod };
    }
    const lastWeekTotal = lastWeekEntries.length;
    const lastWeekCheckedIn = lastWeekEntries.filter((e) => e.status === 'CHECKED_IN').length;
    const lastWeekRate = lastWeekTotal ? (lastWeekCheckedIn / lastWeekTotal) * 100 : 0;

    const diff = kpiData.checkInRate - lastWeekRate;
    return {
      diff: Number(diff.toFixed(1)),
      isPositive: diff >= 0,
      hasData: true,
      comparisonPeriod,
    };
  }, [kpiData.checkInRate, lastWeekEntries, dateFrom, dateTo]);

  const hourlyData = useMemo(() => {
    const startHour = 21;
    const cutoffHour = Number.isFinite(user.cutoffHour) ? user.cutoffHour : 6;
    const displayHours: number[] = [];

    for (let hour = startHour; hour < 24; hour += 1) {
      displayHours.push(hour);
    }
    for (let hour = 0; hour <= cutoffHour; hour += 1) {
      displayHours.push(hour);
    }

    const counts = new Map<number, number>();
    displayHours.forEach((hour) => counts.set(hour, 0));

    entries.forEach((entry) => {
      if (!entry.checked_in_at) return;
      const hour = new Date(entry.checked_in_at).getHours();
      if (!counts.has(hour)) return;
      counts.set(hour, (counts.get(hour) || 0) + 1);
    });

    return displayHours.map((hour) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      count: counts.get(hour) || 0,
    }));
  }, [entries, user.cutoffHour]);

  const dailyData = useMemo(() => {
    const days = eachDayOfInterval({ start: dateFrom, end: dateTo });
    return days.map((day) => {
      const businessDate = format(day, 'yyyy-MM-dd');
      const dayEntries = entries.filter((entry) => entry.business_date === businessDate);
      const registered = dayEntries.length;
      const checkedIn = dayEntries.filter((entry) => entry.status === 'CHECKED_IN').length;
      return {
        date: `${format(day, 'MM/dd')}(${getDayChar(day)})`,
        registered,
        checkedIn,
      };
    });
  }, [dateFrom, dateTo, entries]);

  const creatorData = useMemo(() => {
    const map = new Map<string, { name: string; registered: number; checkedIn: number }>();
    entries.forEach((entry) => {
      const name =
        entry.created_by_profile?.display_name ||
        entry.created_by_profile?.username ||
        entry.created_by ||
        '알 수 없음';
      const current = map.get(name) || { name, registered: 0, checkedIn: 0 };
      current.registered += 1;
      if (entry.status === 'CHECKED_IN') {
        current.checkedIn += 1;
      }
      map.set(name, current);
    });
    return Array.from(map.values())
      .map((creator) => ({
        ...creator,
        rate: creator.registered
          ? Number(((creator.checkedIn / creator.registered) * 100).toFixed(1))
          : 0,
      }))
      .sort((a, b) => b.registered - a.registered);
  }, [entries]);

  const escapeCsvValue = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) return '';
    const text = String(value);
    if (/[",\n]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  const downloadCsv = () => {
    const fromLabel = format(dateFrom, 'yyyy-MM-dd');
    const toLabel = format(dateTo, 'yyyy-MM-dd');
    const rows: string[][] = [];

    rows.push(['클럽', user.clubName]);
    rows.push(['기간', `${fromLabel} ~ ${toLabel}`]);
    rows.push(['생성 시각', format(new Date(), 'yyyy-MM-dd HH:mm:ss')]);
    rows.push([]);
    rows.push(['요약', '값']);
    rows.push(['총 등록', kpiData.totalRegistered]);
    rows.push(['총 입장', kpiData.totalCheckedIn]);
    rows.push(['입장률(%)', kpiData.checkInRate]);
    rows.push(['무료 게스트', kpiData.freeGuests]);
    rows.push(['유료 게스트', kpiData.paidGuests]);
    rows.push([]);
    rows.push(['생성자별 통계', '', '', '']);
    rows.push(['이름', '등록', '입장', '입장률(%)']);
    creatorData.forEach((creator) => {
      rows.push([creator.name, creator.registered, creator.checkedIn, creator.rate]);
    });

    const csv = rows
      .map((row) => row.map((cell) => escapeCsvValue(cell)).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${user.clubName}_${fromLabel}_${toLabel}_dashboard.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl mb-2">대시보드</h1>
          <p className="text-muted-foreground">게스트 통계와 분석을 확인하세요</p>
        </div>
        <Button variant="outline" size="sm" onClick={downloadCsv}>
          CSV 다운로드
        </Button>
      </div>

      {/* Date Range Selector */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={quickRange === 'today' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleQuickRange('today')}
            >
              오늘
            </Button>
            <Button
              variant={quickRange === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleQuickRange('month')}
            >
              이번 달
            </Button>
            <Button
              variant={quickRange === 'custom' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleQuickRange('custom')}
            >
              사용자 정의
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {format(dateFrom, 'PPP', { locale: ko })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={(date) => date && setDateFrom(date)}
                  locale={ko}
                />
              </PopoverContent>
            </Popover>

            <span className="text-muted-foreground">~</span>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {format(dateTo, 'PPP', { locale: ko })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={(date) => date && setDateTo(date)}
                  locale={ko}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">총 등록</span>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl mb-1">{kpiData.totalRegistered}</div>
          <div className="text-xs text-muted-foreground">명</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">총 입장</span>
            <CheckCircle className="w-5 h-5 text-success" />
          </div>
          <div className="text-3xl mb-1">{kpiData.totalCheckedIn}</div>
          <div className="text-xs text-muted-foreground">명</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">입장률</span>
            <Percent className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-3xl mb-1">{kpiData.checkInRate}%</div>
          {weeklyComparison.hasData ? (
            <div className={`text-xs flex items-center ${weeklyComparison.isPositive ? 'text-green-600' : 'text-red-500'}`}>
              {weeklyComparison.isPositive ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {weeklyComparison.isPositive ? '+' : ''}{weeklyComparison.diff}% vs {weeklyComparison.comparisonPeriod}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">비교 데이터 없음</div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">무료/유료</span>
            <Users className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl mb-1">{kpiData.freeGuests}/{kpiData.paidGuests}</div>
          <div className="text-xs text-muted-foreground">
            무료 {kpiData.totalRegistered ? Math.round((kpiData.freeGuests / kpiData.totalRegistered) * 100) : 0}%
          </div>
        </Card>
      </div>

      {loading && (
        <Card className="p-6 mb-6 text-center text-muted-foreground">
          데이터를 불러오는 중입니다...
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Hourly Check-in */}
        <Card className="p-6">
          <h3 className="mb-4">시간대별 입장</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="checkinGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#16a34a" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 6" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="hour" tick={{ fill: '#a1a1aa', fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fill: '#a1a1aa', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: '#0f172a',
                  border: '1px solid rgba(148,163,184,0.2)',
                  borderRadius: 12,
                  color: '#e2e8f0',
                }}
                labelStyle={{ color: '#cbd5f5' }}
                formatter={(value: number) => [`${value}명`, '입장 수']}
                cursor={false}
              />
              <Bar dataKey="count" fill="url(#checkinGradient)" radius={[8, 8, 4, 4]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Daily Trend */}
        <Card className="p-6">
          <h3 className="mb-4">일별 추이</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 6" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="date" tick={{ fill: '#a1a1aa', fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fill: '#a1a1aa', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: '#0f172a',
                  border: '1px solid rgba(148,163,184,0.2)',
                  borderRadius: 12,
                  color: '#e2e8f0',
                }}
                labelStyle={{ color: '#cbd5f5' }}
                formatter={(value: number, name: string) => [
                  `${value}명`,
                  name === '등록' ? '등록' : name === '입장' ? '입장' : name,
                ]}
                cursor={false}
              />
              <Legend iconType="circle" />
              <Line
                type="monotone"
                dataKey="registered"
                stroke="#60a5fa"
                name="등록"
                strokeWidth={2}
                dot={{ r: 3, stroke: '#60a5fa', strokeWidth: 2, fill: '#0f172a' }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="checkedIn"
                stroke="#34d399"
                name="입장"
                strokeWidth={2}
                dot={{ r: 3, stroke: '#34d399', strokeWidth: 2, fill: '#0f172a' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Creator Stats Table */}
      <Card className="p-6">
        <h3 className="mb-4">생성자별 게스트 통계</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead className="text-right">등록</TableHead>
                <TableHead className="text-right">입장</TableHead>
                <TableHead className="text-right">입장률</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {creatorData.map((creator) => (
                <TableRow key={creator.name}>
                  <TableCell>{creator.name}</TableCell>
                  <TableCell className="text-right">{creator.registered}</TableCell>
                  <TableCell className="text-right">{creator.checkedIn}</TableCell>
                  <TableCell className="text-right">
                    <span className={creator.rate >= 75 ? 'text-green-600' : 'text-orange-600'}>
                      {creator.rate}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
