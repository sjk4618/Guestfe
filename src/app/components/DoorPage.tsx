import { useEffect, useState } from "react";
import { User } from "../App";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { supabase } from "@/lib/supabase";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar as CalendarIcon,
  CheckCircle2,
  Undo2,
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { toast } from "sonner";
import { getDayChar } from "@/lib/date-utils";
import {
  DEFAULT_CUTOFF_HOUR,
  DEFAULT_CUTOFF_MINUTE,
  getBusinessDateFor,
} from "@/lib/business-date";

interface Guest {
  id: string;
  name: string;
  phone?: string;
  type: "FREE" | "PAID";
  status: "REGISTERED" | "CHECKED_IN";
  creatorId?: string;
  createdBy: string;
  businessDate: string;
  checkedInAt?: string;
  checkedInById?: string;
  checkedInBy?: string;
}

interface DoorPageProps {
  user: User;
}

const GUESTS_TABLE = "guest_entries";

export function DoorPage({ user }: DoorPageProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    getBusinessDateFor(
      new Date(),
      user.cutoffHour ?? DEFAULT_CUTOFF_HOUR,
      user.cutoffMinute ?? DEFAULT_CUTOFF_MINUTE
    )
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmGuest, setConfirmGuest] = useState<Guest | null>(null);
  const [cancelGuest, setCancelGuest] = useState<Guest | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(false);

  const businessDate = format(selectedDate, "yyyy-MM-dd");

  const mapGuestFromDb = (row: any): Guest => ({
    id: row.id,
    name: row.guest_name || row.name,
    phone: row.phone || undefined,
    type: (row.guest_type || row.type || "FREE") as Guest["type"],
    status: (row.status || "REGISTERED") as Guest["status"],
    creatorId: row.created_by,
    createdBy:
      row.created_by_profile?.display_name ||
      row.created_by_profile?.username ||
      (row.created_by === user.id ? user.displayName : row.created_by) ||
      "",
    businessDate: row.business_date,
    checkedInAt: row.checked_in_at || undefined,
    checkedInById: row.checked_in_by || undefined,
    checkedInBy:
      row.checked_in_by_profile?.display_name ||
      row.checked_in_by_profile?.username ||
      (row.checked_in_by === user.id ? user.displayName : row.checked_in_by) ||
      undefined,
  });

  const fetchGuests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from(GUESTS_TABLE)
        .select(
          `
          *,
          created_by_profile:profiles!guest_entries_created_by_fkey (
            display_name,
            username
          ),
          checked_in_by_profile:profiles!guest_entries_checked_in_by_fkey (
            display_name,
            username
          )
        `
        )
        .eq("club_id", user.clubId)
        .eq("business_date", businessDate)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setGuests((data || []).map(mapGuestFromDb));
    } catch (error) {
      console.error("Error loading guests:", error);
      toast.error("게스트 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, [businessDate, user.clubId]);

  const filteredGuests = guests.filter((guest) => {
    const matchesDate = guest.businessDate === businessDate;
    const matchesSearch =
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (guest.phone && guest.phone.includes(searchQuery));
    return matchesDate && matchesSearch;
  });

  const handleCheckIn = (guest: Guest) => {
    setConfirmGuest(guest);
  };

  const handleCancelCheckIn = (guest: Guest) => {
    setCancelGuest(guest);
  };

  const confirmCancelCheckIn = async () => {
    if (!cancelGuest) return;

    try {
      const { data, error } = await supabase
        .from(GUESTS_TABLE)
        .update({
          status: "REGISTERED",
          checked_in_at: null,
          checked_in_by: null,
        })
        .eq("id", cancelGuest.id)
        .eq("club_id", user.clubId)
        .select(`
          *,
          created_by_profile:profiles!guest_entries_created_by_fkey (
            display_name,
            username
          ),
          checked_in_by_profile:profiles!guest_entries_checked_in_by_fkey (
            display_name,
            username
          )
        `)
        .single();

      if (error) throw error;

      if (data) {
        setGuests(
          guests.map((g) =>
            g.id === cancelGuest.id ? mapGuestFromDb(data) : g
          )
        );
      }

      toast.success(`${cancelGuest.name}님 입장이 취소되었습니다`);
    } catch (error) {
      console.error("Cancel check-in error:", error);
      toast.error("입장 취소에 실패했습니다");
    } finally {
      setCancelGuest(null);
    }
  };

  const confirmCheckIn = async () => {
    if (!confirmGuest) return;

    try {
      const checkedInAt = new Date().toISOString();
      const { data, error } = await supabase
        .from(GUESTS_TABLE)
        .update({
          status: "CHECKED_IN",
          checked_in_at: checkedInAt,
          checked_in_by: user.id,
        })
        .eq("id", confirmGuest.id)
        .eq("club_id", user.clubId)
        .select(`
          *,
          created_by_profile:profiles!guest_entries_created_by_fkey (
            display_name,
            username
          ),
          checked_in_by_profile:profiles!guest_entries_checked_in_by_fkey (
            display_name,
            username
          )
        `)
        .single();

      if (error) throw error;

      if (data) {
        setGuests(
          guests.map((g) =>
            g.id === confirmGuest.id ? mapGuestFromDb(data) : g
          )
        );
      }

      toast.success(`${confirmGuest.name}님 입장 처리 완료`);
    } catch (error) {
      console.error("Check-in error:", error);
      toast.error("입장 처리에 실패했습니다");
    } finally {
      setConfirmGuest(null);
      setSearchQuery("");
    }
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const guestsForDate = guests.filter((g) => g.businessDate === businessDate);
  const stats = {
    total: guestsForDate.length,
    checkedIn: guestsForDate.filter((g) => g.status === "CHECKED_IN").length,
    pending: guestsForDate.filter((g) => g.status === "REGISTERED").length,
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl mb-2">도어 체크인</h1>
        <p className="text-muted-foreground">게스트 입장을 처리하세요</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">총 게스트</div>
          <div className="text-2xl">{stats.total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">입장 완료</div>
          <div className="text-2xl text-green-600">{stats.checkedIn}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">입장 전</div>
          <div className="text-2xl text-orange-600">{stats.pending}</div>
        </Card>
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
                  {format(selectedDate, "PPP", { locale: ko })}({getDayChar(selectedDate)})
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

            <Button variant="outline" size="icon" onClick={() => changeDate(1)}>
              <ChevronRight className="w-4 h-4" />
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
              autoFocus
            />
          </div>
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
            <p className="text-muted-foreground">모든 게스트가 입장했습니다</p>
          </Card>
        ) : (
          filteredGuests.map((guest) => {
            const isCheckedIn = guest.status === "CHECKED_IN";
            return (
              <Card
                key={guest.id}
                className={`p-4 transition-colors ${isCheckedIn
                  ? "bg-gray-700 border border-gray-200"
                  : "hover:bg-accent/10"
                  }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-medium">{guest.name}</span>
                      <Badge
                        variant={
                          guest.type === "FREE" ? "secondary" : "default"
                        }
                      >
                        {guest.type === "FREE" ? "무료" : "유료"}
                      </Badge>
                      {guest.status === "CHECKED_IN" && (
                        <Badge variant="checked">입장완료</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm">
                      {guest.phone && (
                        <span className="text-muted-foreground">
                          📞 {guest.phone}
                        </span>
                      )}
                      <span
                        className={
                          isCheckedIn ? "text-white" : "text-muted-foreground"
                        }
                      >
                        등록한 사람: {guest.createdBy}
                      </span>
                      {guest.checkedInAt && (
                        <>
                          <span
                            className={
                              isCheckedIn
                                ? "text-white"
                                : "text-muted-foreground"
                            }
                          >
                            입장시간:{" "}
                            {format(new Date(guest.checkedInAt), "HH:mm")}
                          </span>
                          <span
                            className={
                              isCheckedIn
                                ? "text-white"
                                : "text-muted-foreground"
                            }
                          >
                            처리: {guest.checkedInBy}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {guest.status === "REGISTERED" ? (
                      <Button
                        size="lg"
                        onClick={() => handleCheckIn(guest)}
                        className="min-w-[120px]"
                      >
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        입장
                      </Button>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-md">
                          <CheckCircle2 className="w-5 h-5" />
                          <span>입장 완료됨</span>
                        </div>
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => handleCancelCheckIn(guest)}
                          className="min-w-[120px] text-destructive border-destructive hover:bg-destructive/10"
                        >
                          <Undo2 className="w-5 h-5 mr-2" />
                          입장 취소
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmGuest !== null}
        onOpenChange={(open) => !open && setConfirmGuest(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>입장 처리 확인</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-lg mb-4">
              <span className="font-semibold">{confirmGuest?.name}</span>님을
              <br />
              입장 처리하시겠습니까?
            </p>
            <div className="bg-accent p-4 rounded-md space-y-2 text-sm">
              {confirmGuest?.phone && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">전화번호</span>
                  <span>{confirmGuest.phone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">타입</span>
                <span>{confirmGuest?.type === "FREE" ? "무료" : "유료"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">등록자</span>
                <span>{confirmGuest?.createdBy}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmGuest(null)}>
              취소
            </Button>
            <Button onClick={confirmCheckIn}>확인</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={cancelGuest !== null}
        onOpenChange={(open) => !open && setCancelGuest(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>입장 취소 확인</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-lg mb-4">
              <span className="font-semibold">{cancelGuest?.name}</span>님의
              <br />
              입장을 취소하시겠습니까?
            </p>
            <div className="bg-accent p-4 rounded-md space-y-2 text-sm">
              {cancelGuest?.phone && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">전화번호</span>
                  <span>{cancelGuest.phone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">타입</span>
                <span>{cancelGuest?.type === "FREE" ? "무료" : "유료"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">입장 시간</span>
                <span>
                  {cancelGuest?.checkedInAt
                    ? format(new Date(cancelGuest.checkedInAt), "HH:mm")
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">처리자</span>
                <span>{cancelGuest?.checkedInBy || "-"}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelGuest(null)}>
              아니오
            </Button>
            <Button variant="destructive" onClick={confirmCancelCheckIn}>
              입장 취소
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
