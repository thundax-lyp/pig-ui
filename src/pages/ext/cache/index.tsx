import { useEffect, useMemo, useState } from 'react';
import { Database, LoaderCircle, MemoryStick, ServerCog } from 'lucide-react';
import { fetchSystemCache } from './service';
import type { CacheCommandStat, CacheInfo } from './types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const commandColors = [
	'bg-sky-700',
	'bg-sky-600',
	'bg-sky-500',
	'bg-cyan-500',
	'bg-teal-500',
	'bg-emerald-500',
	'bg-lime-500',
	'bg-amber-500',
	'bg-orange-500',
	'bg-rose-500',
];

const StatCard = ({ title, value, icon: Icon }: { title: string; value: string | number; icon: typeof Database }) => {
	return (
		<div className="relative flex items-center gap-4 rounded-[28px] border border-border/70 bg-background/80 p-5 shadow-sm transition hover:-translate-y-0.5">
			<div className="flex size-14 items-center justify-center rounded-[20px] bg-primary/12 text-primary">
				<Icon className="h-6 w-6" />
			</div>
			<div className="min-w-0">
				<p className="text-sm text-muted-foreground">{title}</p>
				<p className="truncate text-2xl font-semibold text-foreground">{value || '-'}</p>
			</div>
		</div>
	);
};

export const ExtCachePage = () => {
	const [info, setInfo] = useState<CacheInfo>({});
	const [dbSize, setDbSize] = useState(0);
	const [commandStats, setCommandStats] = useState<CacheCommandStat[]>([]);
	const [loading, setLoading] = useState(true);
	const [feedback, setFeedback] = useState<string>('');

	useEffect(() => {
		void loadData();
	}, []);

	const loadData = async () => {
		try {
			setLoading(true);
			const response = await fetchSystemCache();
			setInfo(response.data.info ?? {});
			setDbSize(Number(response.data.dbSize ?? 0));
			setCommandStats(response.data.commandStats ?? []);
		} catch (error: any) {
			setFeedback(error?.msg ?? '缓存监控数据加载失败。');
		} finally {
			setLoading(false);
		}
	};

	const memoryUsedMb = useMemo(() => {
		const value = Number(info.used_memory ?? 0);
		return value > 0 ? Number((value / 1024 / 1024).toFixed(2)) : 0;
	}, [info.used_memory]);

	const totalCommandValue = useMemo(() => commandStats.reduce((sum, item) => sum + Number(item.value || 0), 0), [commandStats]);

	const topCommands = useMemo(
		() =>
			commandStats
				.slice()
				.sort((left, right) => Number(right.value || 0) - Number(left.value || 0))
				.slice(0, 10),
		[commandStats]
	);

	const statCards = [
		{ title: 'Redis版本', value: info.redis_version ?? '-', icon: ServerCog },
		{ title: '客户端数', value: info.connected_clients ?? '-', icon: Database },
		{ title: '运行时间(天)', value: info.uptime_in_days ?? '-', icon: ServerCog },
		{ title: '使用内存', value: info.used_memory_human ?? '-', icon: MemoryStick },
		{ title: 'AOF是否开启', value: String(info.aof_enabled) === '0' ? '开启' : '关闭', icon: Database },
		{ title: 'RDB是否成功', value: info.rdb_last_bgsave_status === 'ok' ? '成功' : '失败', icon: ServerCog },
	];

	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader>
					<div className="flex flex-wrap items-center gap-3">
						<CardTitle className="text-2xl">缓存监控</CardTitle>
						<Badge variant="secondary">Redis</Badge>
						<Badge>{`DB Size ${dbSize}`}</Badge>
					</div>
					<CardDescription>查看 Redis 基础信息、命令调用分布和内存使用情况。</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-6">
					{feedback ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{feedback}</div> : null}
					{loading ? (
						<div className="flex items-center justify-center py-24 text-muted-foreground">
							<LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
							加载中
						</div>
					) : (
						<>
							<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
								{statCards.map((item) => (
									<StatCard key={item.title} title={item.title} value={item.value} icon={item.icon} />
								))}
							</div>

							<div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_420px]">
								<Card className="border-border/70">
									<CardHeader>
										<CardTitle className="text-lg">命令统计</CardTitle>
										<CardDescription>按调用次数展示热点 Redis 命令。</CardDescription>
									</CardHeader>
									<CardContent className="flex flex-col gap-4">
										{topCommands.length === 0 ? (
											<p className="text-sm text-muted-foreground">暂无命令统计数据。</p>
										) : (
											topCommands.map((item, index) => {
												const value = Number(item.value || 0);
												const percent = totalCommandValue > 0 ? (value / totalCommandValue) * 100 : 0;
												return (
													<div key={`${item.name}-${index}`} className="flex flex-col gap-2">
														<div className="flex items-center justify-between gap-4 text-sm">
															<div className="flex items-center gap-3">
																<span className={cn('block size-3 rounded-full', commandColors[index % commandColors.length])} />
																<span className="font-medium text-foreground">{item.name}</span>
															</div>
															<div className="text-right text-muted-foreground">
																<span>{value}</span>
																<span className="ml-2">{percent.toFixed(1)}%</span>
															</div>
														</div>
														<div className="h-3 overflow-hidden rounded-full bg-secondary/60">
															<div className={cn('h-full rounded-full', commandColors[index % commandColors.length])} style={{ width: `${Math.max(percent, 2)}%` }} />
														</div>
													</div>
												);
											})
										)}
									</CardContent>
								</Card>

								<Card className="border-border/70">
									<CardHeader>
										<CardTitle className="text-lg">内存信息</CardTitle>
										<CardDescription>按当前 Redis 使用内存展示消耗情况。</CardDescription>
									</CardHeader>
									<CardContent className="flex flex-col items-center gap-6 pt-4">
										<div className="relative flex size-64 items-center justify-center rounded-full bg-[conic-gradient(var(--tw-gradient-stops))] from-primary via-primary/65 to-secondary">
											<div className="flex size-48 flex-col items-center justify-center rounded-full bg-background text-center shadow-inner">
												<p className="text-sm text-muted-foreground">内存消耗</p>
												<p className="mt-2 text-4xl font-semibold text-foreground">{memoryUsedMb}</p>
												<p className="mt-1 text-sm text-muted-foreground">MB</p>
											</div>
										</div>
										<div className="grid w-full gap-3 rounded-[24px] border border-border/70 bg-secondary/25 p-4 text-sm">
											<div className="flex items-center justify-between gap-4">
												<span className="text-muted-foreground">已用内存</span>
												<span className="font-medium">{info.used_memory_human ?? '-'}</span>
											</div>
											<div className="flex items-center justify-between gap-4">
												<span className="text-muted-foreground">原始字节</span>
												<span className="font-medium">{info.used_memory ?? '-'}</span>
											</div>
											<div className="flex items-center justify-between gap-4">
												<span className="text-muted-foreground">命令总量</span>
												<span className="font-medium">{totalCommandValue}</span>
											</div>
										</div>
									</CardContent>
								</Card>
							</div>
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
};
