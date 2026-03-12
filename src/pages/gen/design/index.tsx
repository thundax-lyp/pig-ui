import { useEffect, useState } from 'react';
import { Download, History, LoaderCircle, Save } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { HistoryDialog } from './components/history-dialog';
import { deleteFormById, fetchFormById, fetchFormHistoryPage, fetchGeneratorForm, saveFormConfig } from '@/pages/gen/table/service';
import type { FormHistoryItem } from '@/pages/gen/table/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { downloadBlob } from '@/lib/download';
import { cn } from '@/lib/utils';

export const GenDesignPage = () => {
    const [searchParams] = useSearchParams();
    const tableName = searchParams.get('tableName') ?? '';
    const dsName = searchParams.get('dsName') ?? '';
    const [formJson, setFormJson] = useState('{}');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [historyRows, setHistoryRows] = useState<FormHistoryItem[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    useEffect(() => {
        if (!tableName || !dsName) {
            setLoading(false);
            setFeedback({ type: 'error', message: '缺少 tableName 或 dsName，无法进入设计页面。' });
            return;
        }
        void loadForm();
    }, [tableName, dsName]);

    const loadForm = async () => {
        try {
            setLoading(true);
            const response = await fetchGeneratorForm(dsName, tableName);
            setFormJson(JSON.stringify(response, null, 2));
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '表单设计配置加载失败。' });
        } finally {
            setLoading(false);
        }
    };

    const loadHistory = async (nextPage = page) => {
        try {
            setHistoryLoading(true);
            const response = await fetchFormHistoryPage({ current: nextPage, size: pageSize, dsName, tableName });
            setHistoryRows(response.data.records ?? []);
            setTotal(response.data.total ?? 0);
            setPage(nextPage);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '历史记录加载失败。' });
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSubmitting(true);
            JSON.parse(formJson);
            await saveFormConfig({ dsName, tableName, formInfo: formJson });
            setFeedback({ type: 'success', message: '设计已保存。' });
        } catch (error: any) {
            if (error instanceof SyntaxError) {
                setFeedback({ type: 'error', message: 'JSON 格式不正确，请先修正。' });
            } else {
                setFeedback({ type: 'error', message: error?.msg ?? '设计保存失败。' });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await saveFormConfig({ dsName, tableName, formInfo: formJson });
            const blob = new Blob([formJson], { type: 'application/json;charset=utf-8' });
            downloadBlob(blob, `${response.data.id || tableName}-form.json`);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '设计导出失败。' });
        }
    };

    const handleOpenHistory = async () => {
        setHistoryOpen(true);
        await loadHistory(1);
    };

    const handleRollback = async (id: string) => {
        try {
            const response = await fetchFormById(id);
            setFormJson(JSON.stringify(JSON.parse(response.data.formInfo), null, 2));
            setHistoryOpen(false);
            setFeedback({ type: 'success', message: '已回滚到选中的历史版本。' });
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '历史回滚失败。' });
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('确认删除这条设计历史吗？')) return;
        try {
            await deleteFormById(id);
            await loadHistory(page);
            setFeedback({ type: 'success', message: '历史记录已删除。' });
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '历史记录删除失败。' });
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="flex-row flex-wrap items-start justify-between gap-4">
                    <div>
                        <CardTitle className="text-2xl">在线设计</CardTitle>
                        <CardDescription>当前版本以 JSON 形式维护表单结构，并保留历史回滚能力。</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Button variant="outline" onClick={() => void handleOpenHistory()}>
                            <History data-icon="inline-start" />
                            历史
                        </Button>
                        <Button variant="outline" onClick={() => void handleExport()}>
                            <Download data-icon="inline-start" />
                            导出
                        </Button>
                        <Button onClick={() => void handleSave()} disabled={submitting}>
                            {submitting ? (
                                <LoaderCircle className="h-4 w-4 animate-spin" data-icon="inline-start" />
                            ) : (
                                <Save data-icon="inline-start" />
                            )}
                            保存
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
                    {loading ? (
                        <div className="flex items-center justify-center py-24 text-muted-foreground">
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            加载中
                        </div>
                    ) : (
                        <textarea
                            className="min-h-[70vh] rounded-[28px] border border-border/70 bg-zinc-950 px-5 py-4 font-mono text-sm text-zinc-100 outline-none ring-ring transition focus-visible:ring-2"
                            value={formJson}
                            onChange={(event) => setFormJson(event.target.value)}
                        />
                    )}
                </CardContent>
            </Card>

            <HistoryDialog
                open={historyOpen}
                loading={historyLoading}
                rows={historyRows}
                page={page}
                totalPages={totalPages}
                onOpenChange={setHistoryOpen}
                onRollback={(id) => void handleRollback(id)}
                onDelete={(id) => void handleDelete(id)}
                onPrevPage={() => void loadHistory(page - 1)}
                onNextPage={() => void loadHistory(page + 1)}
            />
        </div>
    );
};
