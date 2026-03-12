import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { GeneratedCodeFile } from '@/pages/gen/table/types';

type Props = {
    open: boolean;
    files: GeneratedCodeFile[];
    activePath: string;
    onOpenChange: (open: boolean) => void;
    onSelect: (path: string) => void;
};

export const PreviewDialog = ({ open, files, activePath, onOpenChange, onSelect }: Props) => {
    const current = files.find((item) => item.codePath === activePath) ?? files[0];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl">
                <DialogHeader>
                    <DialogTitle>代码预览</DialogTitle>
                    <DialogDescription>预览当前生成配置对应的代码文件。</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
                    <div className="max-h-[70vh] overflow-y-auto rounded-[24px] border border-border/70 bg-secondary/25 p-3">
                        <div className="flex flex-col gap-2">
                            {files.map((item) => (
                                <button
                                    key={item.codePath}
                                    type="button"
                                    className={`rounded-2xl px-3 py-2 text-left text-sm transition ${current?.codePath === item.codePath ? 'bg-primary text-primary-foreground' : 'bg-background/70 hover:bg-accent'}`}
                                    onClick={() => onSelect(item.codePath)}
                                >
                                    {item.codePath}
                                </button>
                            ))}
                        </div>
                    </div>
                    <pre className="max-h-[70vh] overflow-auto rounded-[24px] border border-border/70 bg-zinc-950 p-4 text-xs text-zinc-100">
                        {current?.code || '暂无代码预览。'}
                    </pre>
                </div>
            </DialogContent>
        </Dialog>
    );
};
