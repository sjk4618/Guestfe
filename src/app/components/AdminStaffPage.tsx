import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User, UserRole } from "../App";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Switch } from "./ui/switch";
import {
  Edit,
  Trash2,
  Calendar as CalendarIcon,
  Eye,
  EyeOff,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { toast } from "sonner";
import { getDayChar, formatDateWithDayShort } from "@/lib/date-utils";

interface StaffMember {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  dailyGuestLimit?: number | null;
  createdAt: string;
}

interface AdminStaffPageProps {
  user: User;
}

export function AdminStaffPage({ user }: AdminStaffPageProps) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter and Sort state
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  const [accessDateSort, setAccessDateSort] = useState<"newest" | "oldest" | "none">("none");

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [formUsername, setFormUsername] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formDisplayName, setFormDisplayName] = useState("");
  const [formRole, setFormRole] = useState<UserRole>("STAFF");
  const [formStartDate, setFormStartDate] = useState<Date>();
  const [formEndDate, setFormEndDate] = useState<Date>();
  const [formDailyGuestLimit, setFormDailyGuestLimit] = useState("");

  // Loading states for buttons
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const resetForm = () => {
    setFormUsername("");
    setFormPassword("");
    setFormDisplayName("");
    setFormRole("STAFF");
    setFormStartDate(undefined);
    setFormEndDate(undefined);
    setFormDailyGuestLimit("");
    setShowPassword(false);
  };

  const validateUsername = (value: string) => {
    return /^[a-zA-Z0-9]+$/.test(value);
  };

  const parseDailyGuestLimit = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 0) {
      return undefined;
    }
    return parsed;
  };

  const getAccessToken = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;

    const session = data?.session;
    if (!session?.access_token) {
      throw new Error("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    if (session.expires_at && session.expires_at <= nowSeconds + 30) {
      const { data: refreshed, error: refreshError } =
        await supabase.auth.refreshSession();
      if (refreshError) throw refreshError;
      if (!refreshed.session?.access_token) {
        throw new Error("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
      }
      return refreshed.session.access_token;
    }

    return session.access_token;
  };

  useEffect(() => {
    fetchStaffList();
  }, [user.clubId]);

  const fetchStaffList = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select(
          `
          *,
          user_access_scopes (
            start_date,
            end_date
          )
        `
        )
        .eq("club_id", user.clubId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedStaff: StaffMember[] = data.map((profile: any) => {
          const rawDailyLimit = profile.daily_guest_limit as
            | number
            | string
            | null
            | undefined;
          const parsedDailyLimit =
            typeof rawDailyLimit === "number"
              ? rawDailyLimit
              : typeof rawDailyLimit === "string"
                ? Number(rawDailyLimit)
                : null;
          const dailyGuestLimit =
            Number.isFinite(parsedDailyLimit) && parsedDailyLimit >= 0
              ? Math.trunc(parsedDailyLimit)
              : null;

          return {
            id: profile.user_id,
            username: profile.username,
            displayName: profile.display_name || profile.username,
            role: profile.role as UserRole,
            isActive: profile.is_active,
            createdAt: profile.created_at,
            startDate: profile.user_access_scopes?.[0]?.start_date,
            endDate: profile.user_access_scopes?.[0]?.end_date,
            dailyGuestLimit,
          };
        });
        setStaff(mappedStaff);
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
      toast.error("직원 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async () => {
    if (
      !formUsername.trim() ||
      !formPassword.trim() ||
      !formDisplayName.trim()
    ) {
      toast.error("모든 필수 항목을 입력해주세요");
      return;
    }

    if (formPassword.trim().length < 8) {
      toast.error("비밀번호는 8자 이상이어야 합니다");
      return;
    }

    if (!validateUsername(formUsername.trim())) {
      toast.error("아이디는 공백/한글/특수문자 없이 영문과 숫자만 가능합니다");
      return;
    }

    if ((formStartDate && !formEndDate) || (!formStartDate && formEndDate)) {
      toast.error("접근 기간을 모두 선택하거나 비워주세요");
      return;
    }

    const dailyGuestLimit = parseDailyGuestLimit(formDailyGuestLimit);
    if (dailyGuestLimit === undefined) {
      toast.error("하루 등록 가능 인원은 0 이상의 정수로 입력해주세요");
      return;
    }

    setIsCreating(true);

    try {
      const accessToken = await getAccessToken();
      const { data, error } = await supabase.functions.invoke("create-user", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: {
          username: formUsername,
          password: formPassword,
          displayName: formDisplayName,
          role: formRole,
          clubId: user.clubId,
          startDate: formStartDate
            ? format(formStartDate, "yyyy-MM-dd")
            : undefined,
          endDate: formEndDate ? format(formEndDate, "yyyy-MM-dd") : undefined,
          dailyGuestLimit,
        },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      toast.success(`${formDisplayName} 계정이 생성되었습니다`);
      resetForm();
      setIsCreateDialogOpen(false);
      fetchStaffList(); // Refresh list
    } catch (error: any) {
      console.error("Create staff error:", error);
      toast.error(error.message || "계정 생성에 실패했습니다.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateStaff = async () => {
    if (!editingStaff || !formDisplayName.trim()) return;

    if (formPassword.trim() && formPassword.trim().length < 8) {
      toast.error("비밀번호는 8자 이상이어야 합니다");
      return;
    }

    if ((formStartDate && !formEndDate) || (!formStartDate && formEndDate)) {
      toast.error("접근 기간을 모두 선택하거나 비워주세요");
      return;
    }

    const dailyGuestLimit = parseDailyGuestLimit(formDailyGuestLimit);
    if (dailyGuestLimit === undefined) {
      toast.error("하루 등록 가능 인원은 0 이상의 정수로 입력해주세요");
      return;
    }

    setIsUpdating(true);

    try {
      const accessToken = await getAccessToken();
      const { data, error } = await supabase.functions.invoke("update-user", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: {
          userId: editingStaff.id,
          displayName: formDisplayName,
          role: formRole,
          password: formPassword.trim() || undefined,
          startDate: formStartDate
            ? format(formStartDate, "yyyy-MM-dd")
            : undefined,
          endDate: formEndDate ? format(formEndDate, "yyyy-MM-dd") : undefined,
          dailyGuestLimit,
        },
      });

      if (error) throw error;
      if (data?.error) {
        throw new Error(data.error);
      }

      toast.success("계정 정보가 수정되었습니다");
      setEditingStaff(null);
      resetForm();
      fetchStaffList();
    } catch (error) {
      console.error("Update error:", error);
      toast.error("수정에 실패했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleActive = async (staffId: string, current: boolean) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: !current })
        .eq("user_id", staffId);

      if (error) throw error;

      setStaff(
        staff.map((s) =>
          s.id === staffId ? { ...s, isActive: !s.isActive } : s
        )
      );
      toast.success("상태가 변경되었습니다");
    } catch (error) {
      console.error("Toggle active error:", error);
      toast.error("상태 변경에 실패했습니다.");
    }
  };

  const handleDeleteStaff = async (staffId: string, staffName: string) => {
    if (!confirm(`${staffName} 계정을 정말 삭제하시겠습니까?`)) {
      return;
    }

    setDeletingId(staffId);

    try {
      const accessToken = await getAccessToken();
      const { data, error } = await supabase.functions.invoke("delete-user", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: {
          userId: staffId,
        },
      });

      if (error) throw error;
      if (data?.error) {
        throw new Error(data.error);
      }

      setStaff(staff.filter((s) => s.id !== staffId));
      toast.success("계정이 삭제되었습니다");
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "삭제에 실패했습니다.");
    } finally {
      setDeletingId(null);
    }
  };

  const openEditDialog = (member: StaffMember) => {
    setEditingStaff(member);
    setFormDisplayName(member.displayName);
    setFormRole(member.role);
    setFormPassword(""); // Reset password field for editing
    setFormStartDate(member.startDate ? new Date(member.startDate) : undefined);
    setFormEndDate(member.endDate ? new Date(member.endDate) : undefined);
    setFormDailyGuestLimit(
      member.dailyGuestLimit === null || member.dailyGuestLimit === undefined
        ? ""
        : String(member.dailyGuestLimit)
    );
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return "default";
      case "STAFF":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return "관리자";
      case "STAFF":
        return "스태프";
      case "DJ":
        return "DJ";
      case "PROMOTER":
        return "프로모터";
      case "EXTERNAL_EVENT":
        return "외부행사";
    }
  };

  // Filtered and sorted staff list
  const filteredStaff = staff
    .filter((member) => {
      if (roleFilter === "ALL") return true;
      return member.role === roleFilter;
    })
    .sort((a, b) => {
      if (accessDateSort === "none") return 0;

      // Staff without access period goes to the end
      const aHasDate = a.startDate && a.endDate;
      const bHasDate = b.startDate && b.endDate;

      if (!aHasDate && !bHasDate) return 0;
      if (!aHasDate) return 1;
      if (!bHasDate) return -1;

      const aStart = new Date(a.startDate!).getTime();
      const bStart = new Date(b.startDate!).getTime();

      return accessDateSort === "newest" ? bStart - aStart : aStart - bStart;
    });

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl mb-2">스탭 관리</h1>
            <p className="text-muted-foreground">
              직원 계정을 생성하고 관리하세요
            </p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                계정 생성
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>새 스태프 계정 생성</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="username">아이디 *</Label>
                  <Input
                    id="username"
                    placeholder="영문/숫자"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    아이디는 공백/한글/특수문자 없이 영문과 숫자만 가능합니다
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">임시 비밀번호 *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="8자 이상"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayName">이름 *</Label>
                  <Input
                    id="displayName"
                    placeholder="표시될 이름"
                    value={formDisplayName}
                    onChange={(e) => setFormDisplayName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">직책 *</Label>
                  <Select
                    value={formRole}
                    onValueChange={(value) => setFormRole(value as UserRole)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">관리자</SelectItem>
                      <SelectItem value="STAFF">스태프</SelectItem>
                      <SelectItem value="DJ">DJ</SelectItem>
                      <SelectItem value="PROMOTER">프로모터</SelectItem>
                      <SelectItem value="EXTERNAL_EVENT">외부행사</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dailyGuestLimit">하루 등록 가능 인원</Label>
                  <Input
                    id="dailyGuestLimit"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="제한 없음"
                    value={formDailyGuestLimit}
                    onChange={(e) => setFormDailyGuestLimit(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    비워두면 제한 없음
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>접근 기간</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFormStartDate(undefined);
                        setFormEndDate(undefined);
                      }}
                    >
                      접근 기간 없음
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="flex-1">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {formStartDate
                            ? `${format(formStartDate, "PP", { locale: ko })}(${getDayChar(formStartDate)})`
                            : "시작일"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formStartDate}
                          onSelect={setFormStartDate}
                          locale={ko}
                        />
                      </PopoverContent>
                    </Popover>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="flex-1">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {formEndDate
                            ? `${format(formEndDate, "PP", { locale: ko })}(${getDayChar(formEndDate)})`
                            : "종료일"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formEndDate}
                          onSelect={setFormEndDate}
                          locale={ko}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                  }}
                  disabled={isCreating}
                >
                  취소
                </Button>
                <Button onClick={handleCreateStaff} isLoading={isCreating} loadingText="생성 중...">
                  생성
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-3">
          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select
              value={roleFilter}
              onValueChange={(value) => setRoleFilter(value as UserRole | "ALL")}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="직책 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체 직책</SelectItem>
                <SelectItem value="ADMIN">관리자</SelectItem>
                <SelectItem value="STAFF">스태프</SelectItem>
                <SelectItem value="DJ">DJ</SelectItem>
                <SelectItem value="PROMOTER">프로모터</SelectItem>
                <SelectItem value="EXTERNAL_EVENT">외부행사</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Access Date Sort */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
            <Select
              value={accessDateSort}
              onValueChange={(value) => setAccessDateSort(value as "newest" | "oldest" | "none")}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="접근 기간 정렬" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">기본 정렬</SelectItem>
                <SelectItem value="newest">접근 기간 최신순</SelectItem>
                <SelectItem value="oldest">접근 기간 오래된순</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter Result Count */}
          <div className="flex items-center text-sm text-muted-foreground ml-auto">
            {filteredStaff.length}명 표시 중
          </div>
        </div>
      </div>

      {/* Staff List */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>아이디</TableHead>
                <TableHead>직책</TableHead>
                <TableHead>하루 등록 한도</TableHead>
                <TableHead>접근 기간</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.displayName}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {member.username}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(member.role)}>
                      {getRoleLabel(member.role)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {member.dailyGuestLimit === null ||
                      member.dailyGuestLimit === undefined
                      ? "제한 없음"
                      : `${member.dailyGuestLimit}명`}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {member.startDate && member.endDate
                      ? `${formatDateWithDayShort(new Date(member.startDate))} ~ ${formatDateWithDayShort(new Date(member.endDate))}`
                      : "∞"}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={member.isActive}
                      onCheckedChange={() =>
                        handleToggleActive(member.id, member.isActive)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(member)}
                        disabled={deletingId === member.id}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDeleteStaff(member.id, member.displayName)
                        }
                        isLoading={deletingId === member.id}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={editingStaff !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingStaff(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>계정 정보 수정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>아이디</Label>
              <Input value={editingStaff?.username} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-password">새 비밀번호</Label>
              <div className="relative">
                <Input
                  id="edit-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="변경하려면 입력 (8자 이상)"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                비밀번호를 변경하지 않으려면 비워두세요
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-displayName">이름 *</Label>
              <Input
                id="edit-displayName"
                placeholder="표시될 이름"
                value={formDisplayName}
                onChange={(e) => setFormDisplayName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-role">직책 *</Label>
              <Select
                value={formRole}
                onValueChange={(value) => setFormRole(value as UserRole)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">관리자</SelectItem>
                  <SelectItem value="STAFF">스태프</SelectItem>
                  <SelectItem value="DJ">DJ</SelectItem>
                  <SelectItem value="PROMOTER">프로모터</SelectItem>
                  <SelectItem value="EXTERNAL_EVENT">외부행사</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-dailyGuestLimit">하루 등록 가능 인원</Label>
              <Input
                id="edit-dailyGuestLimit"
                type="number"
                min="0"
                step="1"
                placeholder="제한 없음"
                value={formDailyGuestLimit}
                onChange={(e) => setFormDailyGuestLimit(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                비워두면 제한 없음
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>접근 기간</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFormStartDate(undefined);
                    setFormEndDate(undefined);
                  }}
                >
                  접근 기간 없음
                </Button>
              </div>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {formStartDate
                        ? `${format(formStartDate, "PP", { locale: ko })}(${getDayChar(formStartDate)})`
                        : "시작일"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formStartDate}
                      onSelect={setFormStartDate}
                      locale={ko}
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {formEndDate
                        ? `${format(formEndDate, "PP", { locale: ko })}(${getDayChar(formEndDate)})`
                        : "종료일"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formEndDate}
                      onSelect={setFormEndDate}
                      locale={ko}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingStaff(null);
                resetForm();
              }}
              disabled={isUpdating}
            >
              취소
            </Button>
            <Button onClick={handleUpdateStaff} isLoading={isUpdating} loadingText="수정 중...">
              수정
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
