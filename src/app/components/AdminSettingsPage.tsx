import { useEffect, useState } from 'react';
import { User } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Clock, Save, Info } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { DEFAULT_CUTOFF_HOUR, DEFAULT_CUTOFF_MINUTE } from '@/lib/business-date';

interface AdminSettingsPageProps {
  user: User;
}


export function AdminSettingsPage({ user }: AdminSettingsPageProps) {
  const [cutoffHour, setCutoffHour] = useState(
    DEFAULT_CUTOFF_HOUR.toString().padStart(2, '0'),
  );
  const [cutoffMinute, setCutoffMinute] = useState(
    DEFAULT_CUTOFF_MINUTE.toString().padStart(2, '0'),
  );
  const [timezone, setTimezone] = useState('Asia/Seoul');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleCutoffChange = (hour: string, minute: string) => {
    setCutoffHour(hour);
    setCutoffMinute(minute);
    setHasChanges(true);
  };

  useEffect(() => {
    let isMounted = true;
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('clubs')
          .select('cutoff_time')
          .eq('id', user.clubId)
          .single();

        if (error) throw error;
        if (!isMounted) return;

        const cutoffTime = data?.cutoff_time as string | null | undefined;
        const [hourText, minuteText] = cutoffTime ? cutoffTime.split(':') : [];
        const hourValue = Number(hourText);
        const minuteValue = Number(minuteText);
        const nextHour = Number.isFinite(hourValue)
          ? hourValue
          : DEFAULT_CUTOFF_HOUR;
        const nextMinute = Number.isFinite(minuteValue)
          ? minuteValue
          : DEFAULT_CUTOFF_MINUTE;

        setCutoffHour(nextHour.toString().padStart(2, '0'));
        setCutoffMinute(nextMinute.toString().padStart(2, '0'));
        setHasChanges(false);
      } catch (error) {
        console.error('Error loading settings:', error);
        toast.error('설정을 불러오는데 실패했습니다.');
      }
    };

    loadSettings();
    return () => {
      isMounted = false;
    };
  }, [user.clubId]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('clubs')
        .update({
          cutoff_time: `${cutoffHour}:${cutoffMinute}:00`,
        })
        .eq('id', user.clubId);

      if (error) throw error;

      toast.success('설정이 저장되었습니다', {
        description: `저장 이후 체크인부터 적용됩니다. (컷오프 시간: ${cutoffHour}:${cutoffMinute})`,
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('설정 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl mb-2">설정</h1>
        <p className="text-muted-foreground">클럽 운영 설정을 관리하세요</p>
      </div>

      {/* Cutoff Time Settings */}
      <Card className="p-6 mb-6">
        <div className="flex items-start gap-3 mb-6">
          <Clock className="w-6 h-6 text-primary mt-1" />
          <div className="flex-1">
            <h2 className="text-lg mb-1">컷오프 시간 (Cutoff Time)</h2>
            <p className="text-sm text-muted-foreground">
              영업일 기준 시간을 설정합니다. 이 시간 이전에 입장한 게스트는 전날 영업일로 기록됩니다.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label>컷오프 시간</Label>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Select 
                  value={cutoffHour} 
                  onValueChange={(value) => handleCutoffChange(value, cutoffMinute)}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {hours.map((hour) => (
                      <SelectItem key={hour} value={hour}>
                        {hour}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-muted-foreground">시</span>
              </div>

              <div className="flex items-center gap-2">
                <Select 
                  value={cutoffMinute} 
                  onValueChange={(value) => handleCutoffChange(cutoffHour, value)}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {minutes.map((minute) => (
                      <SelectItem key={minute} value={minute}>
                        {minute}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-muted-foreground">분</span>
              </div>
            </div>
          </div>

          {/* Example */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex gap-2 mb-2">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <p className="font-medium mb-1">예시</p>
                <p className="text-blue-700 dark:text-blue-300">
                  컷오프 시간이 {cutoffHour}:{cutoffMinute}일 때:
                </p>
                <ul className="mt-2 space-y-1 text-blue-700 dark:text-blue-300">
                  <li>• 1월 2일 오전 {parseInt(cutoffHour) - 1}:30 입장 → 영업일: 1월 1일</li>
                  <li>• 1월 2일 오후 {parseInt(cutoffHour) + 1}:00 입장 → 영업일: 1월 2일</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex gap-2">
              <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-900 dark:text-amber-100">
                <p className="font-medium mb-1">주의사항</p>
                <p className="text-amber-700 dark:text-amber-300">
                  컷오프 시간을 변경하면 저장 이후 체크인부터 새로운 기준이 적용됩니다.
                  과거 통계는 당시 설정된 컷오프 시간으로 유지됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Timezone Settings */}
      <Card className="p-6 mb-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg mb-1">타임존</h2>
            <p className="text-sm text-muted-foreground">
              클럽이 위치한 시간대를 설정합니다.
            </p>
          </div>

          <div className="space-y-2">
            <Label>타임존</Label>
            <Select value={timezone} onValueChange={setTimezone} disabled>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Seoul">Asia/Seoul (KST)</SelectItem>
                <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              * 현재 버전에서는 타임존 변경이 제한되어 있습니다.
            </p>
          </div>
        </div>
      </Card>

      {/* Club Info */}
      <Card className="p-6 mb-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg mb-1">클럽 정보</h2>
            <p className="text-sm text-muted-foreground">
              현재 클럽의 기본 정보입니다.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">클럽명</Label>
              <p className="mt-1">{user.clubName}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">클럽 슬러그</Label>
              <p className="mt-1 font-mono text-sm">{user.clubSlug}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          size="lg"
        >
          <Save className="w-4 h-4 mr-2" />
          설정 저장
        </Button>
      </div>
    </div>
  );
}
