import { useEffect, useMemo, useState } from 'react';
import { Eye, LoaderCircle, Search, Trash2 } from 'lucide-react';
import type { DictOption } from '@/pages/sys/dict/types';
import { fetchDictOptions } from '@/pages/sys/dict/service';
import { deleteLogs, fetchLogPage } from './service';
import type { LogItem } from './types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export const AdminLogPage = () => {
    const [logs, setLogs] = useState<LogItem[]>([]);
    const [logTypes, setLogTypes] = useState<DictOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [detail, setDetail] = useState<LogItem | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [filters, setFilters] = useState({
        logType: '',
        start: '',
        end: '',
    });
    const [query, setQuery] = useState(filters);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const logTypeMap = useMemo(() => new Map(logTypes.map((item) => [item.value, item.label])), [logTypes]);

    useEffect(() => {
        void Promise.all([loadLogs(1, query), loadLogTypes()]);
    }, []);

    async function loadLogTypes() {
        try {
            const response = await fetchDictOptions('log_type');
            setLogTypes(response.data ?? []);
        } catch {
            setLogTypes([
                { label: '正常', value: '0' },
                { label: '异常', value: '1' },
            ]);
        }
    }

    async function loadLogs(nextPage = page, nextQuery = query) {
        try {
            setLoading(true);
            const response = await fetchLogPage({
                current: nextPage,
                size: pageSize,
                logType: nextQuery.logType || undefined,
                createTime: nextQuery.start && nextQuery.end ? [toDateTimeString(nextQuery.start), toDateTimeString(nextQuery.end)] : undefined,
                descs: 'create_time',
            });
            setLogs(response.data.records ?? []);
            setTotal(response.data.total ?? 0);
            setPage(nextPage);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '日志列表加载失败。' });
        } finally {
            setLoading(false);
        }
    }

    function handleSearch() {
        setQuery(filters);
        void loadLogs(1, filters);
    }

    function handleReset() {
        const next = { logType: '', start: '', end: '' };
        setFilters(next);
        setQuery(next);
        void loadLogs(1, next);
    }

    async function handleDelete(ids: string[]) {
        if (!ids.length) return;
        if (!window.confirm(`确认删除这 ${ids.length} 条日志吗？`)) return;
        try {
            setSubmitting(true);
            await deleteLogs(ids);
            setSelectedIds([]);
            setFeedback({ type: 'success', message: '日志已删除。' });
            await loadLogs(page, query);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '日志删除失败。' });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="flex-row flex-wrap items-start justify-between gap-4">
                    <div>
                        <CardTitle className="text-2xl">日志管理</CardTitle>
                        <CardDescription>支持日志类型筛选、时间范围查询、删除和详情查看。</CardDescription>
                    </div>
                    <Button variant="outline" disabled={!selectedIds.length || submitting} onClick={() => void handleDelete(selectedIds)}>
                        <Trash2 data-icon="inline-start" />
                        批量删除
                    </Button>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    {feedback ? (
                        <div
                            className={cn(
                                'rounded-2xl border px-4 py-3 text-sm',
                                feedback.type === 'success'
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                    : 'border-rose-200 bg-rose-50 text-rose-700'
                            )}
                        >
                            {feedback.message}
                        </div>
                    ) : null}
                    <div className="grid gap-3 md:grid-cols-[220px_minmax(0,1fr)_minmax(0,1fr)_auto_auto]">
                        <select
                            className="h-12 rounded-2xl border border-border/70 bg-background px-4 text-sm"
                            value={filters.logType}
                            onChange={(event) => setFilters((prev) => ({ ...prev, logType: event.target.value }))}
                        >
                            <option value="">全部日志类型</option>
                            {logTypes.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                        <Input
                            type="datetime-local"
                            value={filters.start}
                            onChange={(event) => setFilters((prev) => ({ ...prev, start: event.target.value }))}
                        />
                        <Input
                            type="datetime-local"
                            value={filters.end}
                            onChange={(event) => setFilters((prev) => ({ ...prev, end: event.target.value }))}
                        />
                        <Button variant="outline" onClick={handleReset}>
                            重置
                        </Button>
                        <Button onClick={handleSearch}>
                            <Search data-icon="inline-start" />
                            查询
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">总数 {total}</Badge>
                        {selectedIds.length ? <Badge>{`已选 ${selectedIds.length} 项`}</Badge> : null}
                    </div>
                    <div className="overflow-hidden rounded-[28px] border border-border/70">
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-card/70 text-sm">
                                <thead className="bg-secondary/70 text-left text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={logs.length > 0 && selectedIds.length === logs.length}
                                                onChange={(event) => setSelectedIds(event.target.checked ? logs.map((item) => item.id) : [])}
                                            />
                                        </th>
                                        <th className="px-4 py-3">类型</th>
                                        <th className="px-4 py-3">标题</th>
                                        <th className="px-4 py-3">来源地址</th>
                                        <th className="px-4 py-3">请求方法</th>
                                        <th className="px-4 py-3">耗时</th>
                                        <th className="px-4 py-3">创建时间</th>
                                        <th className="px-4 py-3">操作人</th>
                                        <th className="px-4 py-3 text-right">操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={9} className="px-4 py-16 text-center text-muted-foreground">
                                                <span className="inline-flex items-center gap-2">
                                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                                    加载中
                                                </span>
                                            </td>
                                        </tr>
                                    ) : logs.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="px-4 py-16 text-center text-muted-foreground">
                                                没有符合条件的日志。
                                            </td>
                                        </tr>
                                    ) : (
                                        logs.map((item) => (
                                            <tr key={item.id} className="border-t border-border/60 bg-background/70">
                                                <td className="px-4 py-4 align-top">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(item.id)}
                                                        onChange={(event) =>
                                                            setSelectedIds((prev) =>
                                                                event.target.checked ? [...prev, item.id] : prev.filter((id) => id !== item.id)
                                                            )
                                                        }
                                                    />
                                                </td>
                                                <td className="px-4 py-4 align-top">
                                                    <Badge variant="outline">{logTypeMap.get(item.logType) ?? item.logType}</Badge>
                                                </td>
                                                <td className="px-4 py-4 align-top font-medium">{item.title}</td>
                                                <td className="px-4 py-4 align-top">{item.remoteAddr}</td>
                                                <td className="px-4 py-4 align-top">{item.method}</td>
                                                <td className="px-4 py-4 align-top">{item.time ? `${item.time}/ms` : '-'}</td>
                                                <td className="px-4 py-4 align-top text-muted-foreground">{item.createTime}</td>
                                                <td className="px-4 py-4 align-top">{item.createBy}</td>
                                                <td className="px-4 py-4 align-top">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setDetail(item);
                                                                setDetailOpen(true);
                                                            }}
                                                        >
                                                            <Eye data-icon="inline-start" />
                                                            详情
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => void handleDelete([item.id])}>
                                                            <Trash2 data-icon="inline-start" />
                                                            删除
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-muted-foreground">{`第 ${page} / ${totalPages} 页`}</p>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => void loadLogs(page - 1, query)} disabled={page <= 1 || loading}>
                                上一页
                            </Button>
                            <Button variant="outline" onClick={() => void loadLogs(page + 1, query)} disabled={page >= totalPages || loading}>
                                下一页
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>日志详情</DialogTitle>
                        <DialogDescription>查看请求上下文、参数和异常信息。</DialogDescription>
                    </DialogHeader>
                    {detail ? (
                        <div className="grid gap-4">
                            <DetailRow label="创建时间" value={detail.createTime} />
                            <DetailRow label="操作人" value={detail.createBy} />
                            <DetailRow label="请求地址" value={detail.requestUri || '-'} />
                            <DetailRow label="标题" value={detail.title} />
                            <DetailRow label="来源地址" value={detail.remoteAddr} />
                            <DetailRow label="请求方法" value={detail.method} />
                            <DetailRow label="User Agent" value={detail.userAgent || '-'} />
                            <DetailRow label="服务标识" value={detail.serviceId || '-'} />
                            <DetailRow label="耗时" value={detail.time ? `${detail.time}/ms` : '-'} />
                            {detail.params ? <CodeBlock label="请求参数" value={detail.params} /> : null}
                            {detail.exception ? <CodeBlock label="异常信息" value={detail.exception} /> : null}
                        </div>
                    ) : null}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDetailOpen(false)}>
                            关闭
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => {
    return (
        <div className="grid gap-2 rounded-[24px] border border-border/70 bg-background/70 p-4 md:grid-cols-[140px_minmax(0,1fr)]">
            <p className="text-sm font-medium text-foreground">{label}</p>
            <p className="break-all text-sm text-muted-foreground">{value}</p>
        </div>
    );
};

const CodeBlock = ({ label, value }: { label: string; value: string }) => {
    return (
        <div className="grid gap-2 rounded-[24px] border border-border/70 bg-background/70 p-4">
            <p className="text-sm font-medium text-foreground">{label}</p>
            <pre className="overflow-auto rounded-[20px] bg-slate-950 p-4 text-xs text-slate-100">
                <code>{value}</code>
            </pre>
        </div>
    );
};

function toDateTimeString(value: string) {
    return value.replace('T', ' ');
}
