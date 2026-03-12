import { Clock3, LoaderCircle, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import logoUrl from '@/assets/pigx-app.png';
import { appRoutes } from '@/config/routes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getSessionValue, setSessionValue } from '@/lib/session';
import { fetchDashboardCurrentUser, fetchDashboardLogs, fetchDashboardUserProfile } from './service';
import type { DashboardFavoriteRoute, DashboardLogItem, DashboardUserProfile } from './types';

const FAVORITE_ROUTES_KEY = 'dashboardFavorites';
const defaultFavoritePaths = [
    '/admin/user/index',
    '/admin/role/index',
    '/gen/table/index',
    '/ext/cache',
    '/admin/client/index',
    '/daemon/job-manage/index',
];

export const DashboardPage = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<DashboardUserProfile | null>(null);
    const [logs, setLogs] = useState<DashboardLogItem[]>([]);
    const [favoritePaths, setFavoritePaths] = useState<string[]>(() => getSessionValue<string[]>(FAVORITE_ROUTES_KEY) ?? defaultFavoritePaths);
    const favoriteRoutes = useMemo<DashboardFavoriteRoute[]>(
        () => favoritePaths.map((path) => appRoutes.find((route) => route.path === path)).filter(Boolean) as DashboardFavoriteRoute[],
        [favoritePaths]
    );
    const calendarDays = useMemo(() => buildCalendarDays(currentTime), [currentTime]);

    useEffect(() => {
        const timer = window.setInterval(() => setCurrentTime(new Date()), 1000);
        return () => window.clearInterval(timer);
    }, []);

    useEffect(() => {
        void loadDashboardData();
    }, []);

    async function loadDashboardData() {
        try {
            setLoading(true);
            const currentUser = await fetchDashboardCurrentUser();
            setSessionValue('currentUser', currentUser.data);
            const [profileResponse, logsResponse] = await Promise.all([
                fetchDashboardUserProfile(currentUser.data.userId),
                fetchDashboardLogs(),
            ]);
            setProfile(profileResponse.data);
            setLogs(logsResponse.data.records ?? []);
        } finally {
            setLoading(false);
        }
    }

    function removeFavorite(path: string) {
        const next = favoritePaths.filter((item) => item !== path);
        setFavoritePaths(next);
        setSessionValue(FAVORITE_ROUTES_KEY, next);
    }

    return (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
            <div className="grid min-w-0 gap-6">
                <div className="grid gap-6 lg:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.1fr)]">
                    <Card className="overflow-hidden">
                        <div className="h-24 bg-[linear-gradient(135deg,rgba(226,107,76,0.92),rgba(245,173,94,0.88))]" />
                        <CardContent className="-mt-10 flex flex-col gap-5">
                            <Avatar className="size-20 rounded-[26px] border-4 border-background shadow-xl">
                                <AvatarImage src={profile?.avatar || logoUrl} alt={profile?.name ?? 'Pig'} />
                                <AvatarFallback>{(profile?.name ?? 'PX').slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-2">
                                    <h2 className="font-display text-2xl tracking-tight">{profile?.name ?? '管理员控制台'}</h2>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge>{profile?.dept?.name ?? '未分配部门'}</Badge>
                                        {profile?.postList?.length ? <Badge variant="secondary">{profile.postList.map((item) => item.postName).join('、')}</Badge> : null}
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-right">
                                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Current Time</p>
                                    <p className="mt-1 font-display text-lg">
                                        {new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(
                                            currentTime
                                        )}
                                    </p>
                                </div>
                            </div>
                            {loading ? (
                                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                    加载首页信息
                                </div>
                            ) : null}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>快捷导航</CardTitle>
                            <CardDescription>保留 Vue 版常用入口逻辑，展示收藏路由。</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {favoriteRoutes.length ? (
                                favoriteRoutes.map((shortcut, index) => {
                                    const Icon = shortcut.icon;
                                    return (
                                        <div
                                            key={shortcut.path}
                                            className="group relative flex min-h-28 flex-col justify-between rounded-[24px] border border-border/70 bg-background/70 p-4 text-left transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_16px_40px_rgba(226,107,76,0.14)]"
                                        >
                                            <button
                                                type="button"
                                                className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground opacity-0 transition group-hover:opacity-100"
                                                onClick={() => removeFavorite(shortcut.path)}
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                            <Link to={shortcut.path} className="flex h-full flex-col justify-between">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                                                        <Icon className="h-4 w-4" />
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">0{index + 1}</span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">{shortcut.label}</p>
                                                    <p className="mt-1 text-sm text-muted-foreground">{shortcut.description}</p>
                                                </div>
                                            </Link>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="col-span-full rounded-[24px] border border-dashed border-border/70 px-4 py-10 text-center text-sm text-muted-foreground">
                                    暂无收藏入口，请从侧边栏进入常用页面。
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
            <div className="grid min-w-0 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>日程</CardTitle>
                        <CardDescription>延续旧版月历信息面板。</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-7 gap-2 text-center text-sm">
                        {['一', '二', '三', '四', '五', '六', '日'].map((item) => (
                            <div key={item} className="pb-2 text-xs font-semibold text-muted-foreground">
                                {item}
                            </div>
                        ))}
                        {calendarDays.map((day, index) => (
                            <div
                                key={`${day.dateKey}-${index}`}
                                className={
                                    day.isCurrentMonth
                                        ? day.isToday
                                            ? 'rounded-2xl bg-primary px-2 py-3 font-semibold text-primary-foreground'
                                            : 'rounded-2xl border border-border/70 px-2 py-3'
                                        : 'rounded-2xl border border-dashed border-border/50 px-2 py-3 text-muted-foreground/40'
                                }
                            >
                                {day.day}
                            </div>
                        ))}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex-row items-center justify-between">
                        <div>
                            <CardTitle>系统日志</CardTitle>
                            <CardDescription>显示最近 4 条系统日志。</CardDescription>
                        </div>
                        <Button asChild variant="outline" size="sm">
                            <Link to="/admin/log/index">查看全部</Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        {logs.length ? (
                            logs.map((log) => (
                                <div key={log.id} className="rounded-[22px] border border-border/70 bg-background/75 p-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-10 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                                                <Clock3 className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{log.title}</p>
                                                <p className="text-sm text-muted-foreground">{log.remoteAddr}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-semibold text-muted-foreground">{log.createTime}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-[22px] border border-dashed border-border/70 px-4 py-10 text-center text-sm text-muted-foreground">
                                暂无系统日志。
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

function buildCalendarDays(currentDate: Date) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const weekDay = (firstDay.getDay() + 6) % 7;
    const days: Array<{ day: number; isCurrentMonth: boolean; isToday: boolean; dateKey: string }> = [];

    for (let index = weekDay - 1; index >= 0; index -= 1) {
        const day = prevMonthLastDay - index;
        days.push({ day, isCurrentMonth: false, isToday: false, dateKey: `prev-${day}` });
    }

    for (let day = 1; day <= lastDay.getDate(); day += 1) {
        const isToday =
            day === currentDate.getDate() && month === currentDate.getMonth() && year === currentDate.getFullYear();
        days.push({ day, isCurrentMonth: true, isToday, dateKey: `current-${day}` });
    }

    while (days.length % 7 !== 0) {
        const day = days.length - (weekDay + lastDay.getDate()) + 1;
        days.push({ day, isCurrentMonth: false, isToday: false, dateKey: `next-${day}` });
    }

    return days;
}
