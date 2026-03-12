import { useEffect, useState } from 'react';
import { Download, FolderOpen, LoaderCircle, RefreshCw, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { exportTables, fetchDatasourceOptions, fetchTableDetail, fetchTablePage, syncTable } from './service';
import type { TableDatasource, TableRow } from './types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { downloadBlob } from '@/lib/download';
import { cn } from '@/lib/utils';

export const GenTablePage = () => {
	const navigate = useNavigate();
	const [rows, setRows] = useState<TableRow[]>([]);
	const [datasources, setDatasources] = useState<TableDatasource[]>([]);
	const [loading, setLoading] = useState(true);
	const [syncingKey, setSyncingKey] = useState('');
	const [selectedDsName, setSelectedDsName] = useState('master');
	const [search, setSearch] = useState('');
	const [query, setQuery] = useState('');
	const [page, setPage] = useState(1);
	const [pageSize] = useState(10);
	const [total, setTotal] = useState(0);
	const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

	const totalPages = Math.max(1, Math.ceil(total / pageSize));

	useEffect(() => {
		void loadDatasources();
	}, []);

	const loadDatasources = async () => {
		try {
			const response = await fetchDatasourceOptions();
			const next = response.data ?? [];
			setDatasources(next);
			const preferred = next[0]?.name ?? 'master';
			setSelectedDsName(preferred);
			await loadRows(1, '', preferred);
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '数据源列表加载失败。' });
			await loadRows(1, '', 'master');
		}
	};

	const loadRows = async (nextPage = page, nextQuery = query, dsName = selectedDsName) => {
		try {
			setLoading(true);
			const response = await fetchTablePage({
				current: nextPage,
				size: pageSize,
				dsName,
				tableName: nextQuery || undefined,
			});
			setRows(response.data.records ?? []);
			setTotal(response.data.total ?? 0);
			setPage(nextPage);
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '数据表列表加载失败。' });
		} finally {
			setLoading(false);
		}
	};

	const handleExport = async () => {
		try {
			const blob = await exportTables({ dsName: selectedDsName, tableName: query || undefined });
			downloadBlob(blob, 'table.xlsx');
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '表结构导出失败。' });
		}
	};

	const handleSync = async (row: TableRow) => {
		const key = `${selectedDsName}:${row.name}`;
		try {
			setSyncingKey(key);
			await syncTable(selectedDsName, row.name);
			setFeedback({ type: 'success', message: `${row.name} 已同步。` });
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '表同步失败。' });
		} finally {
			setSyncingKey('');
		}
	};

	const handleOpenGenerator = async (row: TableRow) => {
		try {
			const response = await fetchTableDetail(selectedDsName, row.name);
			if (!response.data.fieldList?.length) {
				await syncTable(selectedDsName, row.name);
			}
			navigate(`/gen/gener/index?tableName=${encodeURIComponent(row.name)}&dsName=${encodeURIComponent(selectedDsName)}`);
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '生成页面打开失败。' });
		}
	};

	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader className="flex-row flex-wrap items-start justify-between gap-4">
					<div>
						<CardTitle className="text-2xl">表管理</CardTitle>
						<CardDescription>从数据源读取表结构，并进入生成配置流程。</CardDescription>
					</div>
					<div className="flex flex-wrap gap-3">
						<Button variant="outline" onClick={() => void handleExport()}>
							<Download data-icon="inline-start" />
							导出
						</Button>
					</div>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					{feedback ? <div className={cn('rounded-2xl border px-4 py-3 text-sm', feedback.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700')}>{feedback.message}</div> : null}
					<div className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)_auto_auto]">
						<select className="h-12 rounded-2xl border border-border/70 bg-background px-4 text-sm" value={selectedDsName} onChange={(event) => {
							const next = event.target.value;
							setSelectedDsName(next);
							void loadRows(1, query, next);
						}}>
							<option value="master">默认数据源</option>
							{datasources.map((item) => (
								<option key={item.id} value={item.name}>
									{item.name}
								</option>
							))}
						</select>
						<div className="relative">
							<Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input className="pl-10" placeholder="按表名搜索" value={search} onChange={(event) => setSearch(event.target.value)} />
						</div>
						<Button variant="outline" onClick={() => {
							setSearch('');
							setQuery('');
							void loadRows(1, '', selectedDsName);
						}}>重置</Button>
						<Button onClick={() => {
							setQuery(search);
							void loadRows(1, search, selectedDsName);
						}}>查询</Button>
					</div>
					<div className="flex flex-wrap gap-2">
						<Badge variant="secondary">总数 {total}</Badge>
						<Badge>{selectedDsName}</Badge>
					</div>
					<div className="overflow-hidden rounded-[28px] border border-border/70">
						<div className="overflow-x-auto">
							<table className="min-w-full bg-card/70 text-sm">
								<thead className="bg-secondary/70 text-left text-muted-foreground">
									<tr>
										<th className="px-4 py-3">表名</th>
										<th className="px-4 py-3">表注释</th>
										<th className="px-4 py-3">创建时间</th>
										<th className="px-4 py-3 text-right">操作</th>
									</tr>
								</thead>
								<tbody>
									{loading ? (
										<tr><td colSpan={4} className="px-4 py-16 text-center text-muted-foreground"><span className="inline-flex items-center gap-2"><LoaderCircle className="h-4 w-4 animate-spin" />加载中</span></td></tr>
									) : rows.length === 0 ? (
										<tr><td colSpan={4} className="px-4 py-16 text-center text-muted-foreground">没有符合条件的数据表。</td></tr>
									) : rows.map((row) => {
										const syncing = syncingKey === `${selectedDsName}:${row.name}`;
										return (
											<tr key={row.name} className="border-t border-border/60 bg-background/70">
												<td className="px-4 py-4 align-top font-medium">{row.name}</td>
												<td className="px-4 py-4 align-top">{row.comment || '-'}</td>
												<td className="px-4 py-4 align-top text-muted-foreground">{row.createTime || '-'}</td>
												<td className="px-4 py-4 align-top">
													<div className="flex justify-end gap-2">
														<Button size="sm" variant="ghost" onClick={() => void handleSync(row)} disabled={syncing}>
															<RefreshCw className={cn(syncing && 'animate-spin')} data-icon="inline-start" />
															同步
														</Button>
														<Button size="sm" variant="ghost" onClick={() => void handleOpenGenerator(row)}>
															<FolderOpen data-icon="inline-start" />
															生成
														</Button>
													</div>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					</div>
					<div className="flex flex-wrap items-center justify-between gap-3">
						<p className="text-sm text-muted-foreground">{`第 ${page} / ${totalPages} 页`}</p>
						<div className="flex gap-3">
							<Button variant="outline" onClick={() => void loadRows(page - 1, query, selectedDsName)} disabled={page <= 1 || loading}>上一页</Button>
							<Button variant="outline" onClick={() => void loadRows(page + 1, query, selectedDsName)} disabled={page >= totalPages || loading}>下一页</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
