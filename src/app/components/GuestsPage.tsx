import { useEffect, useState } from 'react';
import { User } from '../App';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Switch } from './ui/switch';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, ChevronRight, Plus, Search, Edit, Trash2, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { toast } from 'sonner';
import { getDayChar } from '@/lib/date-utils';
import {
  DEFAULT_CUTOFF_HOUR,
  DEFAULT_CUTOFF_MINUTE,
  getBusinessDateFor,
} from '@/lib/business-date';

interface Guest {
  id: string;
  name: string;
  phone?: string;
  type: 'FREE' | 'PAID';
  status: 'REGISTERED' | 'CHECKED_IN';
  creatorId?: string;
  createdBy: string;
  businessDate: string;
  checkedInAt?: string;
}

interface GuestsPageProps {
  user: User;
}

const GUESTS_TABLE = 'guest_entries';

export function GuestsPage({ user }: GuestsPageProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    getBusinessDateFor(
      new Date(),
      user.cutoffHour ?? DEFAULT_CUTOFF_HOUR,
      user.cutoffMinute ?? DEFAULT_CUTOFF_MINUTE,
    ),
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'FREE' | 'PAID'>('ALL');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formIsPaid, setFormIsPaid] = useState(false);

  const businessDate = format(selectedDate, 'yyyy-MM-dd');

  // Filter logic based on user role
  const canSeeAllGuests = user.role === 'ADMIN' || user.role === 'STAFF';

  const mapGuestFromDb = (row: any): Guest => ({
    id: row.id,
    name: row.guest_name || row.name,
    phone: row.phone || undefined,
    type: (row.guest_type || row.type || 'FREE') as Guest['type'],
    status: (row.status || 'REGISTERED') as Guest['status'],
    creatorId: row.created_by,
    createdBy:
      row.created_by_profile?.display_name ||
      row.created_by_profile?.username ||
      (row.created_by === user.id ? user.displayName : row.created_by) ||
      '',
    businessDate: row.business_date,
    checkedInAt: row.checked_in_at || undefined
  });

  const fetchGuests = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from(GUESTS_TABLE)
        .select(`
          *,
          created_by_profile:profiles!guest_entries_created_by_fkey (
            display_name,
            username
          )
        `)
        .eq('club_id', user.clubId)
        .eq('business_date', businessDate)
        .order('created_at', { ascending: false });

      if (!canSeeAllGuests) {
        query = query.eq('created_by', user.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      setGuests((data || []).map(mapGuestFromDb));
    } catch (error) {
      console.error('Error fetching guests:', error);
      toast.error('게스트 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, [businessDate, user.clubId, user.username, user.role]);

  const filteredGuests = guests.filter((guest) => {
    const matchesDate = guest.businessDate === businessDate;
    const matchesSearch = guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (guest.phone && guest.phone.includes(searchQuery));
    const matchesType = filterType === 'ALL' ? true : guest.type === filterType;

    // DJ/PROMOTER/EXTERNAL_EVENT can only see their own guests
    const matchesCreator = canSeeAllGuests ? true : guest.creatorId === user.id;

    return matchesDate && matchesSearch && matchesType && matchesCreator;
  });

  const isDailyLimitExceededError = (error: unknown) => {
    const message = typeof (error as { message?: unknown })?.message === 'string'
      ? (error as { message: string }).message
      : '';
    return message.includes('daily_guest_limit_exceeded');
  };

  const isCreatedByMismatchError = (error: unknown) => {
    const message = typeof (error as { message?: unknown })?.message === 'string'
      ? (error as { message: string }).message
      : '';
    return message.includes('created_by_mismatch');
  };

  const fetchCreatedCount = async () => {
    const { count, error } = await supabase
      .from(GUESTS_TABLE)
      .select('id', { count: 'exact', head: true })
      .eq('club_id', user.clubId)
      .eq('business_date', businessDate)
      .eq('created_by', user.id);

    if (error || typeof count !== 'number') {
      console.error('Error counting guests:', error);
      throw new Error('daily_limit_check_failed');
    }

    return count;
  };

  const handleAddGuest = async () => {
    if (!formName.trim()) {
      toast.error('이름을 입력해주세요');
      return;
    }

    try {
      if (user.role !== 'ADMIN' && user.dailyGuestLimit !== null) {
        let currentCount = 0;
        try {
          currentCount = await fetchCreatedCount();
        } catch {
          toast.error('등록 가능 인원을 확인하지 못했습니다. 잠시 후 다시 시도해주세요.');
          return;
        }

        if (currentCount >= user.dailyGuestLimit) {
          toast.error(`하루 등록 가능 인원(${user.dailyGuestLimit}명)을 초과할 수 없습니다.`);
          return;
        }
      }

      const guestType = formIsPaid ? 'PAID' : 'FREE';
      const payload = {
        guest_name: formName.trim(),
        phone: formPhone.trim() || null,
        guest_type: guestType,
        status: 'REGISTERED',
        created_by: user.id,
        club_id: user.clubId,
        business_date: businessDate
      };

      const { data, error } = await supabase
        .from(GUESTS_TABLE)
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setGuests([mapGuestFromDb(data), ...guests]);
      }
      toast.success('게스트가 등록되었습니다');
    } catch (error) {
      console.error('Add guest error:', error);
      if (isDailyLimitExceededError(error)) {
        const limitLabel = user.dailyGuestLimit === null
          ? '하루 등록 가능 인원을 초과할 수 없습니다.'
          : `하루 등록 가능 인원(${user.dailyGuestLimit}명)을 초과할 수 없습니다.`;
        toast.error(limitLabel);
        return;
      }
      if (isCreatedByMismatchError(error)) {
        toast.error('등록자 정보가 올바르지 않습니다.');
        return;
      }
      toast.error('게스트 등록에 실패했습니다');
      return;
    }

    // Reset form
    setFormName('');
    setFormPhone('');
    setFormIsPaid(false);
    setIsAddDialogOpen(false);
  };

  const handleUpdateGuest = async () => {
    if (!editingGuest || !formName.trim()) return;

    try {
      const guestType = formIsPaid ? 'PAID' : 'FREE';
      const { data, error } = await supabase
        .from(GUESTS_TABLE)
        .update({
          guest_name: formName.trim(),
          phone: formPhone.trim() || null,
          guest_type: guestType
        })
        .eq('id', editingGuest.id)
        .eq('club_id', user.clubId)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setGuests(guests.map(g =>
          g.id === editingGuest.id
            ? mapGuestFromDb(data)
            : g
        ));
      }
      toast.success('게스트 정보가 수정되었습니다');
      setEditingGuest(null);
      setFormName('');
      setFormPhone('');
      setFormIsPaid(false);
    } catch (error) {
      console.error('Update guest error:', error);
      toast.error('수정에 실패했습니다');
    }
  };

  const handleDeleteGuest = async (guestId: string) => {
    try {
      const { error } = await supabase
        .from(GUESTS_TABLE)
        .delete()
        .eq('id', guestId)
        .eq('club_id', user.clubId);

      if (error) throw error;

      setGuests(guests.filter(g => g.id !== guestId));
      toast.success('게스트가 삭제되었습니다');
    } catch (error) {
      console.error('Delete guest error:', error);
      toast.error('삭제에 실패했습니다');
    }
  };

  const openEditDialog = (guest: Guest) => {
    setEditingGuest(guest);
    setFormName(guest.name);
    setFormPhone(guest.phone || '');
    setFormIsPaid(guest.type === 'PAID');
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-1">게스트 리스트</h1>
        <p className="text-sm text-muted-foreground">게스트를 등록하고 관리하세요</p>
      </div>

      {/* Controls */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Date Selector */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => changeDate(-1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="min-w-[200px]">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {format(selectedDate, 'PPP', { locale: ko })}({getDayChar(selectedDate)})
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  locale={ko}
                />
              </PopoverContent>
            </Popover>

            <Button
              variant="outline"
              size="icon"
              onClick={() => changeDate(1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <Button
              variant={filterType === 'ALL' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('ALL')}
            >
              <Filter className="w-4 h-4 mr-2" />
              전체
            </Button>
            <Button
              variant={filterType === 'FREE' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('FREE')}
            >
              무료
            </Button>
            <Button
              variant={filterType === 'PAID' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('PAID')}
            >
              유료
            </Button>
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="이름 또는 전화번호 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Add Button */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                게스트 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 게스트 등록</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">이름 *</Label>
                  <Input
                    id="name"
                    placeholder="게스트 이름"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">전화번호</Label>
                  <Input
                    id="phone"
                    placeholder="010-0000-0000"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="paid">유료 게스트</Label>
                  <Switch
                    id="paid"
                    checked={formIsPaid}
                    onCheckedChange={setFormIsPaid}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  취소
                </Button>
                <Button onClick={handleAddGuest}>등록</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {/* Guest List */}
      <div className="space-y-2">
        {loading ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">게스트를 불러오는 중...</p>
          </Card>
        ) : filteredGuests.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">아직 등록된 게스트가 없어요</p>
          </Card>
        ) : (
          filteredGuests.map((guest) => (
            <Card key={guest.id} className="p-4">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-lg">{guest.name}</span>
                    <Badge variant={guest.type === 'FREE' ? 'free' : 'paid'}>
                      {guest.type === 'FREE' ? '무료' : '유료'}
                    </Badge>
                    <Badge variant={guest.status === 'CHECKED_IN' ? 'checked' : 'registered'}>
                      {guest.status === 'CHECKED_IN' ? '입장완료' : '입장 전'}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {guest.phone && <span>📞 {guest.phone}</span>}
                    <span>등록한 사람: {guest.createdBy}</span>
                    {guest.checkedInAt && (
                      <span>입장: {format(new Date(guest.checkedInAt), 'HH:mm')}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {guest.status === 'REGISTERED' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        aria-label="게스트 수정"
                        onClick={() => openEditDialog(guest)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        aria-label="게스트 삭제"
                        onClick={() => handleDeleteGuest(guest.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </>
                  )}
                  {guest.status === 'CHECKED_IN' && (
                    <span className="text-sm text-muted-foreground px-3 py-2">
                      수정/삭제 불가
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editingGuest !== null} onOpenChange={(open) => !open && setEditingGuest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>게스트 정보 수정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">이름 *</Label>
              <Input
                id="edit-name"
                placeholder="게스트 이름"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">전화번호</Label>
              <Input
                id="edit-phone"
                placeholder="010-0000-0000"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-paid">유료 게스트</Label>
              <Switch
                id="edit-paid"
                checked={formIsPaid}
                onCheckedChange={setFormIsPaid}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingGuest(null)}>
              취소
            </Button>
            <Button onClick={handleUpdateGuest}>수정</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
