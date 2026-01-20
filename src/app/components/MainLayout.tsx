import { useState } from 'react';
import { User } from '../App';
import { GuestsPage } from './GuestsPage';
import { DoorPage } from './DoorPage';
import { AdminDashboard } from './AdminDashboard';
import { AdminStaffPage } from './AdminStaffPage';
import { AdminSettingsPage } from './AdminSettingsPage';
import { Button } from './ui/button';
import { Users, DoorOpen, LayoutDashboard, LogOut, Menu, X, UserCog } from 'lucide-react';

interface MainLayoutProps {
  user: User;
  onLogout: () => void;
}

type Page = 'guests' | 'door' | 'dashboard' | 'staff' | 'settings';

export function MainLayout({ user, onLogout }: MainLayoutProps) {
  const [currentPage, setCurrentPage] = useState<Page>('guests');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const canAccessDoor = user.role === 'ADMIN' || user.role === 'STAFF';
  const canAccessAdmin = user.role === 'ADMIN';
  const clubInitial = (user.clubName?.trim?.() || '?').charAt(0).toUpperCase();
  const clubLogoAlt = `${user.clubName} 로고`;
  const ClubIdentity = () => (
    <div className="flex flex-col">
      <div className="w-full overflow-hidden rounded-lg bg-accent p-2">
        {user.clubImageUrl ? (
          <img
            src={user.clubImageUrl}
            alt={clubLogoAlt}
            className="h-24 w-full object-fill"
            data-slot="club-logo"
          />
        ) : (
          <div className="h-24 w-full flex items-center justify-center text-2xl text-muted-foreground">
            {clubInitial}
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-foreground leading-tight">{user.clubName}</h1>
        <div className="flex flex-col">
          <p className="text-base text-foreground">{user.displayName}</p>
          <p className="text-sm text-muted-foreground">{user.role}</p>
        </div>
      </div>
    </div>
  );

  const renderPage = () => {
    switch (currentPage) {
      case 'guests':
        return <GuestsPage user={user} />;
      case 'door':
        return canAccessDoor ? <DoorPage user={user} /> : <GuestsPage user={user} />;
      case 'dashboard':
        return canAccessAdmin ? <AdminDashboard user={user} /> : <GuestsPage user={user} />;
      case 'staff':
        return canAccessAdmin ? <AdminStaffPage user={user} /> : <GuestsPage user={user} />;
      case 'settings':
        return canAccessAdmin ? <AdminSettingsPage user={user} /> : <GuestsPage user={user} />;
      default:
        return <GuestsPage user={user} />;
    }
  };

  const NavItem = ({ page, icon: Icon, label, onClick }: { page: Page; icon: any; label: string; onClick?: () => void }) => (
    <button
      onClick={() => {
        if (onClick) onClick();
        setCurrentPage(page);
        setMobileMenuOpen(false);
      }}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentPage === page
        ? 'bg-primary text-primary-foreground'
        : 'hover:bg-accent text-muted-foreground hover:text-foreground'
        }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-border/50 bg-card backdrop-blur-sm sticky top-0 z-40">
        <ClubIdentity />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-card">
          <div className="p-4 border-b border-border/50 flex items-center justify-between">
            <h2 className="font-semibold">메뉴</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <nav className="flex flex-col gap-2 p-4">
            <button
              onClick={() => { setCurrentPage('guests'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-5 py-4 rounded-lg transition-all text-left ${currentPage === 'guests'
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                : 'hover:bg-accent/50 text-foreground'
                }`}
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">게스트</span>
            </button>
            {canAccessDoor && (
              <button
                onClick={() => { setCurrentPage('door'); setMobileMenuOpen(false); }}
                className={`flex items-center gap-3 px-5 py-4 rounded-lg transition-all text-left ${currentPage === 'door'
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                  : 'hover:bg-accent/50 text-foreground'
                  }`}
              >
                <DoorOpen className="w-5 h-5" />
                <span className="font-medium">도어 체크인</span>
              </button>
            )}
            {canAccessAdmin && (
              <>
                <div className="border-t border-border/50 my-2 pt-3">
                  <p className="text-xs text-muted-foreground px-4 mb-2 uppercase tracking-wider">관리자</p>
                </div>
                <button
                  onClick={() => { setCurrentPage('dashboard'); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 px-5 py-4 rounded-lg transition-all text-left ${currentPage === 'dashboard'
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                    : 'hover:bg-accent/50 text-foreground'
                    }`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="font-medium">대시보드</span>
                </button>
                <button
                  onClick={() => { setCurrentPage('staff'); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 px-5 py-4 rounded-lg transition-all text-left ${currentPage === 'staff'
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                    : 'hover:bg-accent/50 text-foreground'
                    }`}
                >
                  <Users className="w-5 h-5" />
                  <span className="font-medium">스탭 관리</span>
                </button>
                <button
                  onClick={() => { setCurrentPage('settings'); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 px-5 py-4 rounded-lg transition-all text-left ${currentPage === 'settings'
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                    : 'hover:bg-accent/50 text-foreground'
                    }`}
                >
                  <UserCog className="w-5 h-5" />
                  <span className="font-medium">설정</span>
                </button>
              </>
            )}
            <Button
              variant="outline"
              className="justify-start mt-4 h-12"
              onClick={onLogout}
            >
              <LogOut className="w-5 h-5 mr-3" />
              로그아웃
            </Button>
          </nav>
        </div>
      )}

      <div className="lg:grid lg:grid-cols-[280px_1fr] lg:h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col border-r border-border bg-card">
          <div className="p-6 border-b border-border">
            <ClubIdentity />
          </div>

          <nav className="flex-1 p-4 space-y-1">
            <button
              onClick={() => setCurrentPage('guests')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm ${currentPage === 'guests'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
            >
              <Users className="w-4 h-4" />
              <span>게스트</span>
            </button>

            {canAccessDoor && (
              <button
                onClick={() => setCurrentPage('door')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm ${currentPage === 'door'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
              >
                <DoorOpen className="w-4 h-4" />
                <span>도어 체크인</span>
              </button>
            )}

            {canAccessAdmin && (
              <>
                <div className="pt-4 pb-2">
                  <p className="text-xs text-muted-foreground px-3">관리</p>
                </div>
                <button
                  onClick={() => setCurrentPage('dashboard')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm ${currentPage === 'dashboard'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>대시보드</span>
                </button>

                <button
                  onClick={() => setCurrentPage('staff')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm ${currentPage === 'staff'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                >
                  <Users className="w-4 h-4" />
                  <span>스탭 관리</span>
                </button>

                <button
                  onClick={() => setCurrentPage('settings')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm ${currentPage === 'settings'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                >
                  <UserCog className="w-4 h-4" />
                  <span>설정</span>
                </button>
              </>
            )}
          </nav>

          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start text-sm text-muted-foreground hover:text-foreground"
              onClick={onLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="overflow-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
