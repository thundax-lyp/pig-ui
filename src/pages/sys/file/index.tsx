import { useEffect, useRef, useState } from 'react';
import { Download, LoaderCircle, Plus, Search, Trash2, Upload } from 'lucide-react';
import { deleteFiles, fetchFilePage, uploadFile } from './service';
import type { FileItem } from './types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export const AdminFilePage = () => {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [uploadOpen, setUploadOpen] = useState(false);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    useEffect(() => {
        void loadFiles(1, '');
    }, []);

    async function loadFiles(nextPage = page, nextQuery = query) {
        try {
            setLoading(true);
            const response = await fetchFilePage({
                current: nextPage,
                size: pageSize,
                original: nextQuery || undefined,
            });
            setFiles(response.data.records ?? []);
            setTotal(response.data.total ?? 0);
            setPage(nextPage);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '文件列表加载失败。' });
        } finally {
            setLoading(false);
        }
    }

    function handleSearch() {
        setQuery(search);
        void loadFiles(1, search);
    }

    function handleReset() {
        setSearch('');
        setQuery('');
        void loadFiles(1, '');
    }

    async function handleDelete(ids: string[]) {
        if (!ids.length) return;
        if (!window.confirm(`确认删除这 ${ids.length} 个文件吗？`)) return;
        try {
            setSubmitting(true);
            await deleteFiles(ids);
            setSelectedIds([]);
            setFeedback({ type: 'success', message: '文件已删除。' });
            await loadFiles(page, query);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '文件删除失败。' });
        } finally {
            setSubmitting(false);
        }
    }

    async function handleUpload() {
        if (!pendingFiles.length) return;
        try {
            setSubmitting(true);
            for (const file of pendingFiles) {
                await uploadFile(file);
            }
            setPendingFiles([]);
            setUploadOpen(false);
            setFeedback({ type: 'success', message: '文件上传完成。' });
            await loadFiles(1, query);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '文件上传失败。' });
        } finally {
            setSubmitting(false);
        }
    }

    function handleDownload(file: FileItem) {
        window.open(`${import.meta.env.VITE_API_URL}/admin/sys-file/${file.bucketName}/${file.fileName}`, '_blank', 'noopener,noreferrer');
    }

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="flex-row flex-wrap items-start justify-between gap-4">
                    <div>
                        <CardTitle className="text-2xl">文件管理</CardTitle>
                        <CardDescription>支持搜索、批量删除、下载和上传。</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Button variant="outline" disabled={!selectedIds.length || submitting} onClick={() => void handleDelete(selectedIds)}>
                            <Trash2 data-icon="inline-start" />
                            批量删除
                        </Button>
                        <Button onClick={() => setUploadOpen(true)}>
                            <Plus data-icon="inline-start" />
                            上传文件
                        </Button>
                    </div>
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
                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                className="pl-10"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="按原文件名搜索"
                            />
                        </div>
                        <Button variant="outline" onClick={handleReset}>
                            重置
                        </Button>
                        <Button onClick={handleSearch}>查询</Button>
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
                                                checked={files.length > 0 && selectedIds.length === files.length}
                                                onChange={(event) => setSelectedIds(event.target.checked ? files.map((item) => item.id) : [])}
                                            />
                                        </th>
                                        <th className="px-4 py-3">文件名</th>
                                        <th className="px-4 py-3">存储桶</th>
                                        <th className="px-4 py-3">原文件名</th>
                                        <th className="px-4 py-3">类型</th>
                                        <th className="px-4 py-3">大小</th>
                                        <th className="px-4 py-3">创建时间</th>
                                        <th className="px-4 py-3 text-right">操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-16 text-center text-muted-foreground">
                                                <span className="inline-flex items-center gap-2">
                                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                                    加载中
                                                </span>
                                            </td>
                                        </tr>
                                    ) : files.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-16 text-center text-muted-foreground">
                                                没有符合条件的文件。
                                            </td>
                                        </tr>
                                    ) : (
                                        files.map((item) => (
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
                                                <td className="px-4 py-4 align-top font-medium">{item.fileName}</td>
                                                <td className="px-4 py-4 align-top">{item.bucketName}</td>
                                                <td className="px-4 py-4 align-top">{item.original}</td>
                                                <td className="px-4 py-4 align-top">{item.type}</td>
                                                <td className="px-4 py-4 align-top">{item.fileSize}</td>
                                                <td className="px-4 py-4 align-top text-muted-foreground">{item.createTime}</td>
                                                <td className="px-4 py-4 align-top">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" onClick={() => handleDownload(item)}>
                                                            <Download data-icon="inline-start" />
                                                            下载
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
                            <Button variant="outline" onClick={() => void loadFiles(page - 1, query)} disabled={page <= 1 || loading}>
                                上一页
                            </Button>
                            <Button variant="outline" onClick={() => void loadFiles(page + 1, query)} disabled={page >= totalPages || loading}>
                                下一页
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>上传文件</DialogTitle>
                        <DialogDescription>使用原系统的 `/admin/sys-file/upload` 接口上传文件。</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            className="hidden"
                            onChange={(event) => setPendingFiles(Array.from(event.target.files ?? []))}
                        />
                        <button
                            type="button"
                            className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-[28px] border border-dashed border-border/70 bg-secondary/35 p-6 text-center transition hover:bg-accent"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <div>
                                <p className="font-medium">点击选择文件</p>
                                <p className="text-sm text-muted-foreground">支持多文件上传</p>
                            </div>
                        </button>
                        <div className="flex flex-col gap-2">
                            {pendingFiles.length === 0 ? (
                                <p className="text-sm text-muted-foreground">尚未选择文件。</p>
                            ) : (
                                pendingFiles.map((file) => (
                                    <div
                                        key={`${file.name}-${file.size}`}
                                        className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm"
                                    >
                                        <p className="font-medium">{file.name}</p>
                                        <p className="text-muted-foreground">{Math.round(file.size / 1024)} KB</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setUploadOpen(false)}>
                            取消
                        </Button>
                        <Button onClick={() => void handleUpload()} disabled={!pendingFiles.length || submitting}>
                            {submitting ? (
                                <LoaderCircle className="h-4 w-4 animate-spin" data-icon="inline-start" />
                            ) : (
                                <Upload data-icon="inline-start" />
                            )}
                            开始上传
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
