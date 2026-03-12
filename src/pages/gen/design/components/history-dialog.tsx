import { LoaderCircle, RotateCcw, Trash2 } from 'lucide-react';
import type { FormHistoryItem } from '@/pages/gen/table/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Props = {
	open: boolean;
	loading: boolean;
	rows: FormHistoryItem[];
	page: number;
	totalPages: number;
	onOpenChange: (open: boolean) => void;
	onRollback: (id: string) => void;
	onDelete: (id: string) => void;
	onPrevPage: () => void;
	onNextPage: () => void;
};

export const HistoryDialog = ({ open, loading, rows, page, totalPages, onOpenChange, onRollback, onDelete, onPrevPage, onNextPage }: Props) => {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-3xl">
				<DialogHeader>
					<DialogTitle>设计历史</DialogTitle>
					<DialogDescription>查看当前表单设计的保存历史并支持回滚。</DialogDescription>
				</DialogHeader>
				<div className="overflow-hidden rounded-[24px] border border-border/70">
					<table className="min-w-full bg-card/70 text-sm">
						<thead className="bg-secondary/70 text-left text-muted-foreground">
							<tr>
								<th className="px-4 py-3">序号</th>
								<th className="px-4 py-3">设计时间</th>
								<th className="px-4 py-3 text-right">操作</th>
							</tr>
						</thead>
						<tbody>
							{loading ? (
								<tr><td colSpan={3} className="px-4 py-16 text-center text-muted-foreground"><span className="inline-flex items-center gap-2"><LoaderCircle className="h-4 w-4 animate-spin" />加载中</span></td></tr>
							) : rows.length === 0 ? (
								<tr><td colSpan={3} className="px-4 py-16 text-center text-muted-foreground">暂无历史记录。</td></tr>
							) : rows.map((row, index) => (
								<tr key={row.id} className="border-t border-border/60 bg-background/70">
									<td className="px-4 py-4">{index + 1}</td>
									<td className="px-4 py-4">{row.createTime || '-'}</td>
									<td className="px-4 py-4">
										<div className="flex justify-end gap-2">
											<Button size="sm" variant="ghost" onClick={() => onRollback(row.id)}><RotateCcw data-icon="inline-start" />回滚</Button>
											<Button size="sm" variant="ghost" onClick={() => onDelete(row.id)}><Trash2 data-icon="inline-start" />删除</Button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<div className="flex items-center justify-between">
					<p className="text-sm text-muted-foreground">{`第 ${page} / ${totalPages} 页`}</p>
					<div className="flex gap-3">
						<Button variant="outline" onClick={onPrevPage} disabled={page <= 1 || loading}>上一页</Button>
						<Button variant="outline" onClick={onNextPage} disabled={page >= totalPages || loading}>下一页</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
