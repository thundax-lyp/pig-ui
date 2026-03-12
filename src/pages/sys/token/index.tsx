import { useEffect, useState } from 'react';
import { LoaderCircle, Search, Trash2 } from 'lucide-react';
import { fetchTokenPage, offlineTokens } from './service';
import type { TokenItem } from './types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getToken } from '@/lib/session';
import { cn } from '@/lib/utils';

export const AdminTokenPage = () => {
	const [tokens, setTokens] = useState<TokenItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [username, setUsername] = useState('');
	const [query, setQuery] = useState('');
	const [page, setPage] = useState(1);
	const [pageSize] = useState(10);
	const [total, setTotal] = useState(0);
	const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
	const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
	const currentToken = getToken();

	const totalPages = Math.max(1, Math.ceil(total / pageSize));

	useEffect(() => {
		void loadTokens(1, '');
	}, []);

	async function loadTokens(nextPage = page, nextUsername = query) {
		try {
			setLoading(true);
			const response = await fetchTokenPage({
				current: nextPage,
				size: pageSize,
				username: nextUsername || undefined,
			});
			setTokens(response.data.records ?? []);
			setTotal(response.data.total ?? 0);
			setPage(nextPage);
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '令牌列表加载失败。' });
		} finally {
			setLoading(false);
		}
	}

	function handleSearch() {
		setQuery(username);
		void loadTokens(1, username);
	}

	function handleReset() {
		setUsername('');
		setQuery('');
		void loadTokens(1, '');
	}

	async function handleOffline(accessTokens: string[]) {
		if (!accessTokens.length) return;
		if (!window.confirm(`确认下线这 ${accessTokens.length} 个令牌吗？`)) return;
		try {
			setSubmitting(true);
			await offlineTokens(accessTokens);
			setSelectedTokens([]);
			setFeedback({ type: 'success', message: '令牌已下线。' });
			await loadTokens(page, query);
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '令牌下线失败。' });
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader className="flex-row flex-wrap items-start justify-between gap-4">
					<div>
						<CardTitle className="text-2xl">令牌管理</CardTitle>
						<CardDescription>支持用户名查询、批量下线和当前令牌高亮。</CardDescription>
					</div>
					<Button variant="outline" disabled={!selectedTokens.length || submitting} onClick={() => void handleOffline(selectedTokens)}>
						<Trash2 data-icon="inline-start" />
						批量下线
					</Button>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					{feedback ? (
						<div className={cn('rounded-2xl border px-4 py-3 text-sm', feedback.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700')}>
							{feedback.message}
						</div>
					) : null}
					<div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]">
						<div className="relative">
							<Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input className="pl-10" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="按用户名搜索" />
						</div>
						<Button variant="outline" onClick={handleReset}>
							重置
						</Button>
						<Button onClick={handleSearch}>查询</Button>
					</div>
					<div className="flex flex-wrap gap-2">
						<Badge variant="secondary">总数 {total}</Badge>
						{selectedTokens.length ? <Badge>{`已选 ${selectedTokens.length} 项`}</Badge> : null}
					</div>
					<div className="overflow-hidden rounded-[28px] border border-border/70">
						<div className="overflow-x-auto">
							<table className="min-w-full bg-card/70 text-sm">
								<thead className="bg-secondary/70 text-left text-muted-foreground">
									<tr>
										<th className="px-4 py-3">
											<input
												type="checkbox"
												checked={tokens.length > 0 && selectedTokens.length === tokens.length}
												onChange={(event) => setSelectedTokens(event.target.checked ? tokens.map((item) => item.accessToken) : [])}
											/>
										</th>
										<th className="px-4 py-3">用户名</th>
										<th className="px-4 py-3">客户端</th>
										<th className="px-4 py-3">访问令牌</th>
										<th className="px-4 py-3">过期时间</th>
										<th className="px-4 py-3 text-right">操作</th>
									</tr>
								</thead>
								<tbody>
									{loading ? (
										<tr>
											<td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
												<span className="inline-flex items-center gap-2">
													<LoaderCircle className="h-4 w-4 animate-spin" />
													加载中
												</span>
											</td>
										</tr>
									) : tokens.length === 0 ? (
										<tr>
											<td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
												没有符合条件的在线令牌。
											</td>
										</tr>
									) : (
										tokens.map((item) => {
											const isCurrent = item.accessToken === currentToken;
											return (
												<tr key={item.accessToken} className="border-t border-border/60 bg-background/70">
													<td className="px-4 py-4 align-top">
														<input
															type="checkbox"
															checked={selectedTokens.includes(item.accessToken)}
															onChange={(event) =>
																setSelectedTokens((prev) => (event.target.checked ? [...prev, item.accessToken] : prev.filter((token) => token !== item.accessToken)))
															}
														/>
													</td>
													<td className="px-4 py-4 align-top font-medium">{item.username}</td>
													<td className="px-4 py-4 align-top">{item.clientId}</td>
													<td className="px-4 py-4 align-top">
														<span className={cn('break-all text-sm', isCurrent ? 'font-medium text-rose-600' : 'text-muted-foreground')}>{item.accessToken}</span>
													</td>
													<td className="px-4 py-4 align-top text-muted-foreground">{item.expiresAt}</td>
													<td className="px-4 py-4 align-top">
														<div className="flex justify-end gap-2">
															<Button variant="ghost" size="sm" onClick={() => void handleOffline([item.accessToken])}>
																<Trash2 data-icon="inline-start" />
																下线
															</Button>
														</div>
													</td>
												</tr>
											);
										})
									)}
								</tbody>
							</table>
						</div>
					</div>
					<div className="flex flex-wrap items-center justify-between gap-3">
						<p className="text-sm text-muted-foreground">{`第 ${page} / ${totalPages} 页`}</p>
						<div className="flex gap-3">
							<Button variant="outline" onClick={() => void loadTokens(page - 1, query)} disabled={page <= 1 || loading}>
								上一页
							</Button>
							<Button variant="outline" onClick={() => void loadTokens(page + 1, query)} disabled={page >= totalPages || loading}>
								下一页
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
