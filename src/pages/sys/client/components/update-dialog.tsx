import { ChevronRight, LoaderCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { DictOption } from '@/pages/sys/dict/types';
import type { ClientFormState } from '../types';

type Props = {
	open: boolean;
	form: ClientFormState;
	errors: Record<string, string>;
	submitting: boolean;
	grantTypes: DictOption[];
	commonStatus: DictOption[];
	onOpenChange: (open: boolean) => void;
	onChange: (updater: (prev: ClientFormState) => ClientFormState) => void;
	onSubmit: () => void;
};

export const ClientFormDialog = ({ open, form, errors, submitting, grantTypes, commonStatus, onOpenChange, onChange, onSubmit }: Props) => {
	const hasAuthCode = form.authorizedGrantTypes.includes('authorization_code');

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-3xl">
				<DialogHeader>
					<DialogTitle>{form.id ? '编辑客户端' : '新增客户端'}</DialogTitle>
					<DialogDescription>编辑客户端授权、令牌时效和回调配置。</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 md:grid-cols-2">
					<FormField label="clientId" error={errors.clientId}>
						<Input value={form.clientId} onChange={(event) => onChange((prev) => ({ ...prev, clientId: event.target.value }))} />
					</FormField>
					<FormField label="clientSecret" error={errors.clientSecret}>
						<Input value={form.clientSecret} onChange={(event) => onChange((prev) => ({ ...prev, clientSecret: event.target.value }))} />
					</FormField>
					<FormField label="scope" error={errors.scope}>
						<Input value={form.scope} onChange={(event) => onChange((prev) => ({ ...prev, scope: event.target.value }))} />
					</FormField>
					<FormField label="accessTokenValidity" error={errors.accessTokenValidity}>
						<Input type="number" value={String(form.accessTokenValidity)} onChange={(event) => onChange((prev) => ({ ...prev, accessTokenValidity: Number(event.target.value || 0) }))} />
					</FormField>
					<FormField label="refreshTokenValidity" error={errors.refreshTokenValidity}>
						<Input type="number" value={String(form.refreshTokenValidity)} onChange={(event) => onChange((prev) => ({ ...prev, refreshTokenValidity: Number(event.target.value || 0) }))} />
					</FormField>
					<FormField label="授权模式" error={errors.authorizedGrantTypes}>
						<div className="flex flex-wrap gap-2 rounded-[24px] border border-border/70 bg-secondary/35 p-3">
							{grantTypes.map((item) => {
								const active = form.authorizedGrantTypes.includes(item.value);
								return (
									<button
										key={item.value}
										type="button"
										className={cn(
											'rounded-full border px-3 py-1.5 text-sm transition',
											active ? 'border-primary bg-primary text-primary-foreground' : 'border-border/70 bg-background text-muted-foreground hover:text-foreground'
										)}
										onClick={() =>
											onChange((prev) => ({
												...prev,
												authorizedGrantTypes: active ? prev.authorizedGrantTypes.filter((value) => value !== item.value) : [...prev.authorizedGrantTypes, item.value],
											}))
										}
									>
										{item.label}
									</button>
								);
							})}
						</div>
					</FormField>
				</div>
				{hasAuthCode ? (
					<div className="grid gap-4 md:grid-cols-2">
						<FormField label="自动放行">
							<div className="flex flex-wrap gap-2">
								{commonStatus.map((item) => (
									<button
										key={item.value}
										type="button"
										className={cn(
											'rounded-full border px-3 py-1.5 text-sm transition',
											form.autoapprove === item.value ? 'border-primary bg-primary text-primary-foreground' : 'border-border/70 bg-background text-muted-foreground hover:text-foreground'
										)}
										onClick={() => onChange((prev) => ({ ...prev, autoapprove: item.value }))}
									>
										{item.label}
									</button>
								))}
							</div>
						</FormField>
						<FormField label="authorities">
							<Input value={form.authorities} onChange={(event) => onChange((prev) => ({ ...prev, authorities: event.target.value }))} />
						</FormField>
						<FormField label="回调地址" error={errors.webServerRedirectUri}>
							<Input value={form.webServerRedirectUri} onChange={(event) => onChange((prev) => ({ ...prev, webServerRedirectUri: event.target.value }))} />
						</FormField>
					</div>
				) : null}
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
