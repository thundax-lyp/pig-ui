import { Bell, Command, Menu, Search, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import logoUrl from '@/assets/pigx-app.png';
import { appRoutes, findRouteMetaByPath, routeGroups } from '@/config/routes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export function AppShell() {
	const [collapsed, setCollapsed] = useState(false);
	const location = useLocation();
	const activeMeta = findRouteMetaByPath(location.pathname) ?? findRouteMetaByPath('/home');
	const groupedRoutes = useMemo(
		() =>
			routeGroups.map((group) => ({
				group,
				routes: appRoutes.filter((route) => route.group === group),
			})),
		[]
	);

	return (
		<div className="min-h-screen bg-background text-foreground">
			<div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(226,107,76,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.12),_transparent_32%)]" />
			<div className="relative flex min-h-screen">
				<aside
					className={cn(
						'border-r border-white/60 bg-sidebar/90 px-4 py-6 backdrop-blur-xl transition-all duration-300',
						collapsed ? 'w-[104px]' : 'w-[300px]'
					)}
				>
					<div className="flex items-center justify-between gap-3 px-3">
						<Link to="/home" className="flex items-center gap-3">
							<div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-[rgba(226,107,76,0.28)]">
								<Sparkles className="h-5 w-5" />
							</div>
							{!collapsed ? (
								<div>
									<p className="font-display text-lg tracking-tight">Pig React Console</p>
									<p className="text-xs text-muted-foreground">Shadcn migration workspace</p>
								</div>
							) : null}
						</Link>
						<Button variant="ghost" size="icon" onClick={() => setCollapsed((value) => !value)}>
							<Menu />
						</Button>
					</div>
					<Separator className="my-5" />
					<nav className="flex flex-col gap-6">
						{groupedRoutes.map(({ group, routes }) => (
							<div key={group} className="flex flex-col gap-2">
								{!collapsed ? <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground/80">{group}</p> : null}
								<div className="flex flex-col gap-1">
									{routes.map((route) => {
										const Icon = route.icon;
										return (
											<NavLink
												key={route.path}
												to={route.path}
												className={({ isActive }) =>
													cn(
														'group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-all duration-200',
														isActive ? 'bg-foreground text-background shadow-[0_14px_40px_rgba(15,23,42,0.18)]' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
													)
												}
											>
												<Icon className="h-4 w-4 shrink-0" />
												{!collapsed ? <span className="truncate">{route.label}</span> : null}
											</NavLink>
										);
									})}
								</div>
							</div>
						))}
					</nav>
				</aside>
				<div className="flex min-h-screen min-w-0 flex-1 flex-col">
					<header className="sticky top-0 z-20 border-b border-white/60 bg-background/78 px-5 py-4 backdrop-blur-xl md:px-8">
						<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
							<div className="flex items-center gap-4">
								<div className="hidden rounded-full border border-border/70 bg-card/80 px-4 py-3 text-sm text-muted-foreground shadow-sm md:flex md:min-w-[320px] md:items-center md:gap-3">
									<Search className="h-4 w-4" />
									<span>搜索路由、用户、日志或生成任务</span>
								</div>
								<div>
									<p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Current View</p>
									<h1 className="font-display text-2xl tracking-tight">{activeMeta?.label ?? '控制台'}</h1>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<Badge variant="secondary">React + shadcn</Badge>
								<Button variant="outline">
									<Command data-icon="inline-start" />
									Command
								</Button>
								<Button variant="outline" size="icon">
									<Bell />
								</Button>
								<div className="flex items-center gap-3 rounded-full border border-border/70 bg-card/80 px-2 py-1.5">
									<Avatar>
										<AvatarImage src={logoUrl} alt="admin" />
										<AvatarFallback>PX</AvatarFallback>
									</Avatar>
									<div className="hidden pr-3 md:block">
										<p className="text-sm font-semibold">Admin</p>
										<p className="text-xs text-muted-foreground">super administrator</p>
									</div>
								</div>
							</div>
						</div>
					</header>
					<main className="flex-1 px-5 py-6 md:px-8">
						<Outlet />
					</main>
				</div>
			</div>
		</div>
	);
}
