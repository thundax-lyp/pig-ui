import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, LoaderCircle, Play, ScrollText, Search, Square, Trash2 } from 'lucide-react';
import type { DictOption } from '@/pages/sys/dict/types';
import { fetchDictOptions } from '@/pages/sys/dict/service';
import {
	createJob,
	deleteJob,
	deleteJobLogs,
	fetchJobDetail,
	fetchJobLogPage,
	fetchJobPage,
	runJob,
	shutdownJob,
	startJob,
	updateJob,
} from './service';
import type { JobItem, JobLogItem } from './types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { JobFormDialog } from './components/update-dialog';
import { cn } from '@/lib/utils';

type JobFormState = {
	jobId: string;
	jobName: string;
	jobGroup: string;
	jobType: string;
	executePath: string;
	className: string;
	methodName: string;
	methodParamsValue: string;
	cronExpression: string;
	misfirePolicy: string;
	remark: string;
};

const emptyForm: JobFormState = {
	jobId: '',
	jobName: '',
	jobGroup: '',
	jobType: '',
	executePath: '',
	className: '',
	methodName: '',
	methodParamsValue: '',
	cronExpression: '',
	misfirePolicy: '',
	remark: '',
};

export const JobManagePage = () => {
	const [jobs, setJobs] = useState<JobItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [filters, setFilters] = useState({ jobName: '', jobStatus: '', jobExecuteStatus: '' });
	const [query, setQuery] = useState(filters);
	const [page, setPage] = useState(1);
	const [pageSize] = useState(10);
	const [total, setTotal] = useState(0);
	const [selectedRows, setSelectedRows] = useState<JobItem[]>([]);
	const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [form, setForm] = useState<JobFormState>(emptyForm);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [jobStatusOptions, setJobStatusOptions] = useState<DictOption[]>([]);
	const [jobExecuteStatusOptions, setJobExecuteStatusOptions] = useState<DictOption[]>([]);
	const [misfirePolicyOptions, setMisfirePolicyOptions] = useState<DictOption[]>([]);
	const [jobTypeOptions, setJobTypeOptions] = useState<DictOption[]>([]);
	const [logDialogOpen, setLogDialogOpen] = useState(false);
	const [activeJob, setActiveJob] = useState<JobItem | null>(null);
	const [jobLogs, setJobLogs] = useState<JobLogItem[]>([]);
	const [jobLogPage, setJobLogPage] = useState(1);
	const [jobLogTotal, setJobLogTotal] = useState(0);
	const [selectedLogIds, setSelectedLogIds] = useState<string[]>([]);

	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const jobLogPages = Math.max(1, Math.ceil(jobLogTotal / 10));
	const jobStatusMap = useMemo(() => new Map(jobStatusOptions.map((item) => [item.value, item.label])), [jobStatusOptions]);
	const jobExecuteStatusMap = useMemo(() => new Map(jobExecuteStatusOptions.map((item) => [item.value, item.label])), [jobExecuteStatusOptions]);
	const jobTypeMap = useMemo(() => new Map(jobTypeOptions.map((item) => [item.value, item.label])), [jobTypeOptions]);
	const misfirePolicyMap = useMemo(() => new Map(misfirePolicyOptions.map((item) => [item.value, item.label])), [misfirePolicyOptions]);
	const isPathJob = ['3', '4'].includes(form.jobType);
	const isBeanJob = ['1', '2'].includes(form.jobType);

	useEffect(() => {
		void Promise.all([loadJobs(1, query), loadDictionaries()]);
	}, []);

	async function loadDictionaries() {
		try {
			const [statusRes, executeRes, misfireRes, typeRes] = await Promise.all([
				fetchDictOptions('job_status'),
				fetchDictOptions('job_execute_status'),
				fetchDictOptions('misfire_policy'),
				fetchDictOptions('job_type'),
			]);
			setJobStatusOptions(statusRes.data ?? []);
			setJobExecuteStatusOptions(executeRes.data ?? []);
			setMisfirePolicyOptions(misfireRes.data ?? []);
			setJobTypeOptions(typeRes.data ?? []);
		} catch {
			setJobStatusOptions([]);
			setJobExecuteStatusOptions([]);
			setMisfirePolicyOptions([]);
			setJobTypeOptions([]);
		}
	}

	async function loadJobs(nextPage = page, nextQuery = query) {
		try {
			setLoading(true);
			const response = await fetchJobPage({
				current: nextPage,
				size: pageSize,
				jobName: nextQuery.jobName || undefined,
				jobStatus: nextQuery.jobStatus || undefined,
				jobExecuteStatus: nextQuery.jobExecuteStatus || undefined,
			});
			setJobs(response.data.records ?? []);
			setTotal(response.data.total ?? 0);
			setPage(nextPage);
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '任务列表加载失败。' });
		} finally {
			setLoading(false);
		}
	}

	function handleSearch() {
		setQuery(filters);
		void loadJobs(1, filters);
	}

	function handleReset() {
		const next = { jobName: '', jobStatus: '', jobExecuteStatus: '' };
		setFilters(next);
		setQuery(next);
		void loadJobs(1, next);
	}

	function openCreateDialog() {
		setForm(emptyForm);
		setErrors({});
		setDialogOpen(true);
	}

	async function openEditDialog(job: JobItem) {
		if (!['1', '3'].includes(job.jobStatus)) {
			setFeedback({ type: 'error', message: '运行中的任务不可修改，请先暂停。' });
			return;
		}
		try {
			setSubmitting(true);
			const response = await fetchJobDetail(job.jobId);
			setForm({
				jobId: response.data.jobId,
				jobName: response.data.jobName ?? '',
				jobGroup: response.data.jobGroup ?? '',
				jobType: response.data.jobType ?? '',
				executePath: response.data.executePath ?? '',
				className: response.data.className ?? '',
				methodName: response.data.methodName ?? '',
				methodParamsValue: response.data.methodParamsValue ?? '',
				cronExpression: response.data.cronExpression ?? '',
				misfirePolicy: response.data.misfirePolicy ?? '',
				remark: response.data.remark ?? '',
			});
			setErrors({});
			setDialogOpen(true);
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '任务详情加载失败。' });
		} finally {
			setSubmitting(false);
		}
	}

	function validateForm(state: JobFormState) {
		const nextErrors: Record<string, string> = {};
		if (!state.jobName.trim()) nextErrors.jobName = '任务名称不能为空。';
		if (!state.jobGroup.trim()) nextErrors.jobGroup = '任务组名不能为空。';
		if (!state.jobType) nextErrors.jobType = '任务类型不能为空。';
		if (!state.cronExpression.trim()) nextErrors.cronExpression = 'Cron 表达式不能为空。';
		if (!state.misfirePolicy) nextErrors.misfirePolicy = '失火策略不能为空。';
		if (['3', '4'].includes(state.jobType) && !state.executePath.trim()) nextErrors.executePath = '执行路径不能为空。';
		if (['1', '2'].includes(state.jobType) && !state.className.trim()) nextErrors.className = '类名不能为空。';
		if (['1', '2'].includes(state.jobType) && !state.methodName.trim()) nextErrors.methodName = '方法名不能为空。';
		return nextErrors;
	}

	async function handleSubmit() {
		const nextErrors = validateForm(form);
		setErrors(nextErrors);
		if (Object.keys(nextErrors).length) return;
		try {
			setSubmitting(true);
			if (form.jobId) {
				await updateJob(form);
				setFeedback({ type: 'success', message: '任务已更新。' });
			} else {
				await createJob(form);
				setFeedback({ type: 'success', message: '任务已创建。' });
			}
			setDialogOpen(false);
			await loadJobs(form.jobId ? page : 1, query);
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '任务保存失败。' });
		} finally {
			setSubmitting(false);
		}
	}

	async function handleDelete(row?: JobItem) {
		if (!row) {
			for (const item of selectedRows) {
				// eslint-disable-next-line no-await-in-loop
				await handleDelete(item);
			}
			return;
		}
		if (!window.confirm(`确认删除任务 ${row.jobName} 吗？`)) return;
		try {
			setSubmitting(true);
			await deleteJob(row.jobId);
			setFeedback({ type: 'success', message: '任务已删除。' });
			await loadJobs(page, query);
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '任务删除失败。' });
		} finally {
			setSubmitting(false);
		}
	}

	async function handleStart(row: JobItem) {
		if (!['1', '3'].includes(row.jobStatus)) {
			setFeedback({ type: 'error', message: '任务已在运行。' });
			return;
		}
		if (!window.confirm(`即将启动任务 ${row.jobName}，是否继续？`)) return;
		try {
			setSubmitting(true);
			await startJob(row.jobId);
			setFeedback({ type: 'success', message: '任务已启动。' });
			await loadJobs(page, query);
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '任务启动失败。' });
		} finally {
			setSubmitting(false);
		}
	}

	async function handleShutdown(row: JobItem) {
		if (row.jobStatus !== '2') {
			setFeedback({ type: 'error', message: '任务已暂停，请勿重复操作。' });
			return;
		}
		if (!window.confirm(`即将暂停任务 ${row.jobName}，是否继续？`)) return;
		try {
			setSubmitting(true);
			await shutdownJob(row.jobId);
			setFeedback({ type: 'success', message: '任务已暂停。' });
			await loadJobs(page, query);
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '任务暂停失败。' });
		} finally {
			setSubmitting(false);
		}
	}

	async function handleRun(row: JobItem) {
		if (!window.confirm(`立刻执行一次任务 ${row.jobName}，是否继续？`)) return;
		try {
			setSubmitting(true);
			await runJob(row.jobId);
			setFeedback({ type: 'success', message: '任务已触发执行。' });
			await loadJobs(page, query);
		} catch {
			setFeedback({ type: 'error', message: '任务执行失败。' });
		} finally {
			setSubmitting(false);
		}
	}

	async function openLogs(row: JobItem) {
		setActiveJob(row);
		setSelectedLogIds([]);
		setLogDialogOpen(true);
		await loadJobLogs(row.jobId, 1);
	}

	async function loadJobLogs(jobId: string, nextPage = jobLogPage) {
		try {
			setSubmitting(true);
			const response = await fetchJobLogPage({ current: nextPage, size: 10, jobId });
			setJobLogs(response.data.records ?? []);
			setJobLogTotal(response.data.total ?? 0);
			setJobLogPage(nextPage);
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '运行日志加载失败。' });
		} finally {
			setSubmitting(false);
		}
	}

	async function handleDeleteLogs(ids: string[]) {
		if (!ids.length) return;
		if (!window.confirm(`确认删除这 ${ids.length} 条运行日志吗？`)) return;
		try {
			setSubmitting(true);
			await deleteJobLogs(ids);
			setSelectedLogIds([]);
			if (activeJob) {
				await loadJobLogs(activeJob.jobId, jobLogPage);
			}
			setFeedback({ type: 'success', message: '运行日志已删除。' });
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '运行日志删除失败。' });
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader className="flex-row flex-wrap items-start justify-between gap-4">
					<div>
						<CardTitle className="text-2xl">任务管理</CardTitle>
						<CardDescription>支持任务筛选、启停、立即执行、编辑和运行日志查看。</CardDescription>
					</div>
					<div className="flex flex-wrap gap-3">
						<Button variant="outline" disabled={!selectedRows.length || submitting} onClick={() => void handleDelete()}>
							<Trash2 data-icon="inline-start" />
							批量删除
						</Button>
						<Button onClick={openCreateDialog}>
							<ChevronRight data-icon="inline-start" />
							新增任务
						</Button>
					</div>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					{feedback ? (
						<div className={cn('rounded-2xl border px-4 py-3 text-sm', feedback.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700')}>
							{feedback.message}
						</div>
					) : null}
					<div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_220px_auto_auto]">
						<div className="relative">
							<Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input className="pl-10" value={filters.jobName} onChange={(event) => setFilters((prev) => ({ ...prev, jobName: event.target.value }))} placeholder="按任务名称搜索" />
						</div>
						<select className="h-12 rounded-2xl border border-border/70 bg-background px-4 text-sm" value={filters.jobStatus} onChange={(event) => setFilters((prev) => ({ ...prev, jobStatus: event.target.value }))}>
							<option value="">全部任务状态</option>
							{jobStatusOptions.map((item) => (
								<option key={item.value} value={item.value}>
									{item.label}
								</option>
							))}
						</select>
						<select className="h-12 rounded-2xl border border-border/70 bg-background px-4 text-sm" value={filters.jobExecuteStatus} onChange={(event) => setFilters((prev) => ({ ...prev, jobExecuteStatus: event.target.value }))}>
							<option value="">全部执行状态</option>
							{jobExecuteStatusOptions.map((item) => (
								<option key={item.value} value={item.value}>
									{item.label}
								</option>
							))}
						</select>
						<Button variant="outline" onClick={handleReset}>
							重置
						</Button>
						<Button onClick={handleSearch}>查询</Button>
					</div>
					<div className="overflow-hidden rounded-[28px] border border-border/70">
						<div className="overflow-x-auto">
							<table className="min-w-full bg-card/70 text-sm">
								<thead className="bg-secondary/70 text-left text-muted-foreground">
									<tr>
										<th className="px-4 py-3">
											<input type="checkbox" checked={jobs.length > 0 && selectedRows.length === jobs.length} onChange={(event) => setSelectedRows(event.target.checked ? jobs : [])} />
										</th>
										<th className="px-4 py-3">任务名称</th>
										<th className="px-4 py-3">任务组</th>
										<th className="px-4 py-3">任务状态</th>
										<th className="px-4 py-3">执行状态</th>
										<th className="px-4 py-3">下次执行</th>
										<th className="px-4 py-3">任务类型</th>
										<th className="px-4 py-3">Cron</th>
										<th className="px-4 py-3">策略</th>
										<th className="px-4 py-3 text-right">操作</th>
									</tr>
								</thead>
								<tbody>
									{loading ? (
										<tr>
											<td colSpan={10} className="px-4 py-16 text-center text-muted-foreground">
												<span className="inline-flex items-center gap-2">
													<LoaderCircle className="h-4 w-4 animate-spin" />
													加载中
												</span>
											</td>
										</tr>
									) : jobs.length === 0 ? (
										<tr>
											<td colSpan={10} className="px-4 py-16 text-center text-muted-foreground">
												没有符合条件的任务。
											</td>
										</tr>
									) : (
										jobs.map((row) => (
											<tr key={row.jobId} className="border-t border-border/60 bg-background/70">
												<td className="px-4 py-4 align-top">
													<input type="checkbox" checked={selectedRows.some((item) => item.jobId === row.jobId)} onChange={(event) => setSelectedRows((prev) => (event.target.checked ? [...prev, row] : prev.filter((item) => item.jobId !== row.jobId)))} />
												</td>
												<td className="px-4 py-4 align-top font-medium">{row.jobName}</td>
												<td className="px-4 py-4 align-top">{row.jobGroup}</td>
												<td className="px-4 py-4 align-top">
													<Badge variant="outline">{jobStatusMap.get(row.jobStatus) ?? row.jobStatus}</Badge>
												</td>
												<td className="px-4 py-4 align-top">
													<Badge variant="outline">{jobExecuteStatusMap.get(row.jobExecuteStatus) ?? row.jobExecuteStatus}</Badge>
												</td>
												<td className="px-4 py-4 align-top text-muted-foreground">{row.nextTime || '-'}</td>
												<td className="px-4 py-4 align-top">{jobTypeMap.get(row.jobType) ?? row.jobType}</td>
												<td className="px-4 py-4 align-top text-muted-foreground">{row.cronExpression}</td>
												<td className="px-4 py-4 align-top text-muted-foreground">{misfirePolicyMap.get(row.misfirePolicy) ?? row.misfirePolicy}</td>
												<td className="px-4 py-4 align-top">
													<div className="flex justify-end gap-2">
														<Button variant="ghost" size="sm" onClick={() => void openLogs(row)}>
															<ScrollText data-icon="inline-start" />
															日志
														</Button>
														{row.jobStatus !== '2' ? (
															<Button variant="ghost" size="sm" onClick={() => void handleStart(row)}>
																<Play data-icon="inline-start" />
																启动
															</Button>
														) : (
															<Button variant="ghost" size="sm" onClick={() => void handleShutdown(row)}>
																<Square data-icon="inline-start" />
																暂停
															</Button>
														)}
														<Button variant="ghost" size="sm" onClick={() => void openEditDialog(row)}>
															编辑
														</Button>
														<Button variant="ghost" size="sm" onClick={() => void handleRun(row)}>
															执行
														</Button>
														<Button variant="ghost" size="sm" onClick={() => void handleDelete(row)}>
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
							<Button variant="outline" onClick={() => void loadJobs(page - 1, query)} disabled={page <= 1 || loading}>
								上一页
							</Button>
							<Button variant="outline" onClick={() => void loadJobs(page + 1, query)} disabled={page >= totalPages || loading}>
								下一页
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			<JobFormDialog open={dialogOpen} form={form} errors={errors} submitting={submitting} jobTypeOptions={jobTypeOptions} misfirePolicyOptions={misfirePolicyOptions} onOpenChange={setDialogOpen} onChange={(updater) => setForm(updater)} onSubmit={() => void handleSubmit()} />

			<Dialog open={logDialogOpen} onOpenChange={setLogDialogOpen}>
				<DialogContent className="max-w-6xl">
					<DialogHeader>
						<DialogTitle>运行日志</DialogTitle>
						<DialogDescription>{activeJob ? `任务：${activeJob.jobName}` : '查看任务运行日志。'}</DialogDescription>
					</DialogHeader>
					<div className="flex items-center justify-between gap-3">
						<div className="flex flex-wrap gap-2">
							{activeJob ? <Badge variant="secondary">{activeJob.jobName}</Badge> : null}
							{selectedLogIds.length ? <Badge>{`已选 ${selectedLogIds.length} 项`}</Badge> : null}
						</div>
						<Button variant="outline" disabled={!selectedLogIds.length || submitting} onClick={() => void handleDeleteLogs(selectedLogIds)}>
							<Trash2 data-icon="inline-start" />
							删除日志
						</Button>
					</div>
					<div className="overflow-hidden rounded-[28px] border border-border/70">
						<div className="overflow-x-auto">
							<table className="min-w-full bg-card/70 text-sm">
								<thead className="bg-secondary/70 text-left text-muted-foreground">
									<tr>
										<th className="px-4 py-3">
											<input type="checkbox" checked={jobLogs.length > 0 && selectedLogIds.length === jobLogs.length} onChange={(event) => setSelectedLogIds(event.target.checked ? jobLogs.map((item) => item.jobLogId) : [])} />
										</th>
										<th className="px-4 py-3">任务名称</th>
										<th className="px-4 py-3">执行信息</th>
										<th className="px-4 py-3">执行状态</th>
										<th className="px-4 py-3">执行耗时</th>
										<th className="px-4 py-3">异常信息</th>
										<th className="px-4 py-3">创建时间</th>
										<th className="px-4 py-3 text-right">操作</th>
									</tr>
								</thead>
								<tbody>
									{!activeJob ? (
										<tr>
											<td colSpan={8} className="px-4 py-16 text-center text-muted-foreground">
												请选择任务。
											</td>
										</tr>
									) : jobLogs.length === 0 ? (
										<tr>
											<td colSpan={8} className="px-4 py-16 text-center text-muted-foreground">
												当前任务暂无运行日志。
											</td>
										</tr>
									) : (
										jobLogs.map((row) => (
											<tr key={row.jobLogId} className="border-t border-border/60 bg-background/70">
												<td className="px-4 py-4 align-top">
													<input type="checkbox" checked={selectedLogIds.includes(row.jobLogId)} onChange={(event) => setSelectedLogIds((prev) => (event.target.checked ? [...prev, row.jobLogId] : prev.filter((id) => id !== row.jobLogId)))} />
												</td>
												<td className="px-4 py-4 align-top font-medium">{row.jobName}</td>
												<td className="px-4 py-4 align-top">{row.jobMessage || '-'}</td>
												<td className="px-4 py-4 align-top">
													<Badge variant="outline">{jobExecuteStatusMap.get(row.jobLogStatus) ?? row.jobLogStatus}</Badge>
												</td>
												<td className="px-4 py-4 align-top">{row.executeTime || '-'}</td>
												<td className="px-4 py-4 align-top text-muted-foreground">{row.exceptionInfo || '-'}</td>
												<td className="px-4 py-4 align-top text-muted-foreground">{row.createTime || '-'}</td>
												<td className="px-4 py-4 align-top">
													<div className="flex justify-end gap-2">
														<Button variant="ghost" size="sm" onClick={() => void handleDeleteLogs([row.jobLogId])}>
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
						<p className="text-sm text-muted-foreground">{`第 ${jobLogPage} / ${jobLogPages} 页`}</p>
						<div className="flex gap-3">
							<Button variant="outline" onClick={() => activeJob && loadJobLogs(activeJob.jobId, jobLogPage - 1)} disabled={jobLogPage <= 1 || !activeJob || submitting}>
								上一页
							</Button>
							<Button variant="outline" onClick={() => activeJob && loadJobLogs(activeJob.jobId, jobLogPage + 1)} disabled={jobLogPage >= jobLogPages || !activeJob || submitting}>
								下一页
							</Button>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setLogDialogOpen(false)}>
							关闭
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};
