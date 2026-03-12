import { ChevronRight, LoaderCircle } from 'lucide-react';
import type { DatasourceFormState } from '../types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Props = {
	open: boolean;
	form: DatasourceFormState;
	errors: Record<string, string>;
	submitting: boolean;
	onOpenChange: (open: boolean) => void;
	onChange: (updater: (prev: DatasourceFormState) => DatasourceFormState) => void;
	onSubmit: () => void;
};

const dsTypeOptions = [
	{ label: 'MySQL', value: 'mysql' },
	{ label: 'PostgreSQL', value: 'postgresql' },
	{ label: 'Oracle', value: 'oracle' },
	{ label: 'SQL Server', value: 'mssql' },
];

export const UpdateDialog = ({ open, form, errors, submitting, onOpenChange, onChange, onSubmit }: Props) => {
	const useUrl = form.confType === 1;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl">
				<DialogHeader>
					<DialogTitle>{form.id ? '编辑数据源' : '新增数据源'}</DialogTitle>
					<DialogDescription>支持按连接参数或 JDBC URL 两种方式维护数据源。</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 md:grid-cols-2">
					<FormField label="数据库类型" error={errors.dsType}>
						<select className="h-12 rounded-2xl border border-border/70 bg-background px-4 text-sm" value={form.dsType} onChange={(event) => onChange((prev) => ({ ...prev, dsType: event.target.value }))}>
							{dsTypeOptions.map((item) => (
								<option key={item.value} value={item.value}>
									{item.label}
								</option>
							))}
						</select>
					</FormField>
					<FormField label="别名" error={errors.name}>
						<Input value={form.name} onChange={(event) => onChange((prev) => ({ ...prev, name: event.target.value }))} />
					</FormField>
					<FormField label="用户名" error={errors.username}>
						<Input value={form.username} onChange={(event) => onChange((prev) => ({ ...prev, username: event.target.value }))} />
					</FormField>
					<FormField label="密码" error={errors.password}>
						<Input type="password" value={form.password} onChange={(event) => onChange((prev) => ({ ...prev, password: event.target.value }))} />
					</FormField>
				</div>
				<FormField label="配置方式" error={errors.confType}>
					<div className="flex flex-wrap gap-2">
						{[
							{ label: '连接参数', value: 0 },
							{ label: 'JDBC URL', value: 1 },
						].map((item) => (
							<button
								key={item.value}
								type="button"
								className={cn(
									'rounded-full border px-4 py-2 text-sm transition',
									form.confType === item.value ? 'border-primary bg-primary text-primary-foreground' : 'border-border/70 bg-background text-muted-foreground hover:text-foreground'
								)}
								onClick={() => onChange((prev) => ({ ...prev, confType: item.value }))}
							>
								{item.label}
							</button>
						))}
					</div>
				</FormField>
				{useUrl ? (
					<FormField label="JDBC URL" error={errors.url}>
						<textarea
							className="min-h-32 rounded-[24px] border border-border/70 bg-background px-4 py-3 text-sm outline-none ring-ring transition focus-visible:ring-2"
							value={form.url}
							onChange={(event) => onChange((prev) => ({ ...prev, url: event.target.value }))}
						/>
					</FormField>
				) : (
					<div className="grid gap-4 md:grid-cols-2">
						<FormField label="主机" error={errors.host}>
							<Input value={form.host} onChange={(event) => onChange((prev) => ({ ...prev, host: event.target.value }))} />
						</FormField>
						<FormField label="端口" error={errors.port}>
							<Input type="number" value={String(form.port)} onChange={(event) => onChange((prev) => ({ ...prev, port: Number(event.target.value || 0) }))} />
						</FormField>
						<FormField label="数据库名" error={errors.dsName}>
							<Input value={form.dsName} onChange={(event) => onChange((prev) => ({ ...prev, dsName: event.target.value }))} />
						</FormField>
						{form.dsType === 'mssql' ? (
							<FormField label="实例名" error={errors.instance}>
								<Input value={form.instance} onChange={(event) => onChange((prev) => ({ ...prev, instance: event.target.value }))} />
							</FormField>
						) : null}
					</div>
				)}
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						取消
					</Button>
					<Button onClick={onSubmit} disabled={submitting}>
						{submitting ? <LoaderCircle className="h-4 w-4 animate-spin" data-icon="inline-start" /> : <ChevronRight data-icon="inline-start" />}
						保存
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
