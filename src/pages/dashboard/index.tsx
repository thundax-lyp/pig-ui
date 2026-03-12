import { ArrowUpRight, CalendarDays, Clock3, Cpu, ShieldCheck, Star, Zap } from 'lucide-react';
import logoUrl from '@/assets/pigx-app.png';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const shortcuts = ['用户管理', '角色授权', '表结构生成', '缓存监控', '客户端管理', '任务调度'];

const logs = [
	{ time: '09:42', title: '刷新令牌策略已变更', host: '10.10.2.18' },
	{ time: '10:15', title: '生成任务完成并归档', host: '10.10.3.07' },
	{ time: '11:03', title: '角色菜单权限重新发布', host: '10.10.1.21' },
	{ time: '11:36', title: '缓存实例命中率回升', host: '10.10.8.03' },
];

const schedule = [
	{ day: 'Mon', value: 3 },
	{ day: 'Tue', value: 5 },
	{ day: 'Wed', value: 2 },
	{ day: 'Thu', value: 6 },
	{ day: 'Fri', value: 4 },
	{ day: 'Sat', value: 1 },
	{ day: 'Sun', value: 2 },
];

export const DashboardPage = () => {
	return (
		<div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
			<div className="grid min-w-0 gap-6">
				<div className="grid gap-6 lg:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.1fr)]">
					<Card className="overflow-hidden">
						<div className="h-24 bg-[linear-gradient(135deg,rgba(226,107,76,0.92),rgba(245,173,94,0.88))]" />
						<CardContent className="-mt-10 flex flex-col gap-5">
							<Avatar className="size-20 rounded-[26px] border-4 border-background shadow-xl">
								<AvatarImage src={logoUrl} alt="Pig" />
								<AvatarFallback>PX</AvatarFallback>
							</Avatar>
							<div className="flex items-start justify-between gap-4">
								<div className="space-y-2">
									<h2 className="font-display text-2xl tracking-tight">管理员控制台</h2>
									<div className="flex flex-wrap gap-2">
										<Badge>研发平台</Badge>
										<Badge variant="secondary">超级管理员</Badge>
									</div>
								</div>
								<div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-right">
									<p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Current Time</p>
									<p className="mt-1 font-display text-lg">{new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date())}</p>
								</div>
							</div>
							<div className="grid gap-3 sm:grid-cols-3">
								<MetricCard icon={ShieldCheck} label="在线租户" value="18" detail="权限策略稳定" />
								<MetricCard icon={Cpu} label="活跃任务" value="42" detail="调度健康度 98%" />
								<MetricCard icon={Zap} label="生成请求" value="126" detail="今日成功率 99.2%" />
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex-row items-end justify-between">
							<div>
								<CardTitle>快捷入口</CardTitle>
								<CardDescription>常用入口和快捷操作。</CardDescription>
							</div>
							<Button variant="ghost">
								更多
								<ArrowUpRight data-icon="inline-end" />
							</Button>
						</CardHeader>
						<CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
							{shortcuts.map((shortcut, index) => (
								<button
									key={shortcut}
									className="group flex min-h-28 flex-col justify-between rounded-[24px] border border-border/70 bg-background/70 p-4 text-left transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_16px_40px_rgba(226,107,76,0.14)]"
								>
									<div className="flex items-center justify-between">
										<div className="flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
											<Star className="h-4 w-4" />
										</div>
										<span className="text-xs text-muted-foreground">0{index + 1}</span>
									</div>
									<div>
										<p className="font-medium text-foreground">{shortcut}</p>
										<p className="mt-1 text-sm text-muted-foreground">进入对应管理页并继续处理日常操作。</p>
									</div>
								</button>
							))}
						</CardContent>
					</Card>
				</div>
			</div>
			<div className="grid min-w-0 gap-6">
				<Card>
					<CardHeader>
						<CardTitle>日程热力</CardTitle>
						<CardDescription>今日概览和日程信息。</CardDescription>
					</CardHeader>
					<CardContent className="flex items-end gap-3">
						{schedule.map((item) => (
							<div key={item.day} className="flex flex-1 flex-col items-center gap-3">
								<div className="flex min-h-40 w-full items-end rounded-full bg-secondary/80 p-2">
									<div className="w-full rounded-full bg-primary" style={{ height: `${Math.max(item.value * 18, 24)}px` }} />
								</div>
								<span className="text-xs font-medium text-muted-foreground">{item.day}</span>
							</div>
						))}
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex-row items-center justify-between">
						<div>
							<CardTitle>系统日志</CardTitle>
							<CardDescription>保留右侧事件时间线结构，改成更紧凑的通知流。</CardDescription>
						</div>
						<Button variant="outline" size="sm">
							查看全部
						</Button>
					</CardHeader>
					<CardContent className="flex flex-col gap-4">
						{logs.map((log) => (
							<div key={`${log.time}-${log.title}`} className="rounded-[22px] border border-border/70 bg-background/75 p-4">
								<div className="flex items-center justify-between gap-4">
									<div className="flex items-center gap-3">
										<div className="flex size-10 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
											<Clock3 className="h-4 w-4" />
										</div>
										<div>
											<p className="font-medium">{log.title}</p>
											<p className="text-sm text-muted-foreground">{log.host}</p>
										</div>
									</div>
									<span className="text-xs font-semibold text-muted-foreground">{log.time}</span>
								</div>
							</div>
						))}
					</CardContent>
				</Card>
				<Card className="bg-foreground text-background">
					<CardContent className="flex items-center justify-between gap-4 p-6">
						<div>
							<p className="text-xs uppercase tracking-[0.22em] text-background/60">Migration Status</p>
							<h3 className="mt-2 font-display text-2xl">系统运行平稳。</h3>
						</div>
						<div className="flex size-16 items-center justify-center rounded-[24px] bg-white/10">
							<CalendarDays className="h-8 w-8" />
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

const MetricCard = ({ icon: Icon, label, value, detail }: { icon: typeof ShieldCheck; label: string; value: string; detail: string }) => {
	return (
		<div className="rounded-[22px] border border-border/70 bg-background/75 p-4">
			<div className="flex items-start justify-between gap-4">
				<div>
					<p className="text-sm text-muted-foreground">{label}</p>
					<p className="mt-2 font-display text-3xl tracking-tight">{value}</p>
				</div>
				<div className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
					<Icon className="h-5 w-5" />
				</div>
			</div>
			<p className="mt-4 text-sm text-muted-foreground">{detail}</p>
		</div>
	);
};
