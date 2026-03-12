import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, LoaderCircle, Save, WandSparkles } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { BasicSettings } from './components/basic-settings';
import { FieldSettings } from './components/field-settings';
import { PreviewDialog } from './components/preview-dialog';
import { fetchFieldTypeList } from '@/pages/gen/field-type/service';
import { fetchGroupList } from '@/pages/gen/group/service';
import { fetchDictList, fetchGeneratorPreview, fetchTableDetail, generateCode, updateTableBase, updateTableFields, downloadCodeZip } from '@/pages/gen/table/service';
import type { DictOption, GeneratedCodeFile, GeneratorBaseForm, GroupOption, TableField } from '@/pages/gen/table/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { downloadBlob } from '@/lib/download';
import { cn } from '@/lib/utils';

const propToType: Record<string, string> = {
	tinyint: 'number',
	smallint: 'number',
	mediumint: 'number',
	int: 'number',
	integer: 'number',
	bigint: 'number',
	float: 'number',
	datetime: 'datetime',
	LocalDateTime: 'datetime',
	date: 'date',
	LocalDate: 'date',
	Long: 'number',
	Float: 'number',
	Double: 'number',
	BigDecimal: 'number',
	text: 'textarea',
	String: 'text',
	longtext: 'editor',
	bit: 'radio',
	Boolean: 'radio',
	char: 'radio',
	varchar: 'text',
};

const emptyBaseForm: GeneratorBaseForm = {
	id: '',
	generatorType: '0',
	formLayout: 1,
	backendPath: '',
	frontendPath: '',
	packageName: '',
	author: '',
	moduleName: '',
	functionName: '',
	className: '',
	tableComment: '',
	tableName: '',
	dsName: '',
	style: '',
	childTableName: '',
};

export const GenGenerPage = () => {
	const [searchParams] = useSearchParams();
	const [step, setStep] = useState<0 | 1>(0);
	const [baseForm, setBaseForm] = useState<GeneratorBaseForm>(emptyBaseForm);
	const [fields, setFields] = useState<TableField[]>([]);
	const [groupOptions, setGroupOptions] = useState<GroupOption[]>([]);
	const [dictOptions, setDictOptions] = useState<DictOption[]>([]);
	const [attrTypeOptions, setAttrTypeOptions] = useState<string[]>(['String', 'Object']);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [previewOpen, setPreviewOpen] = useState(false);
	const [previewFiles, setPreviewFiles] = useState<GeneratedCodeFile[]>([]);
	const [activePreviewPath, setActivePreviewPath] = useState('');
	const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

	const tableName = searchParams.get('tableName') ?? '';
	const dsName = searchParams.get('dsName') ?? '';

	useEffect(() => {
		if (!tableName || !dsName) {
			setLoading(false);
			setFeedback({ type: 'error', message: '缺少 tableName 或 dsName，无法进入生成流程。' });
			return;
		}
		void loadInitialData();
	}, [tableName, dsName]);

	const loadInitialData = async () => {
		try {
			setLoading(true);
			const [tableResponse, groupResponse, fieldTypeResponse, dictResponse] = await Promise.all([
				fetchTableDetail(dsName, tableName),
				fetchGroupList(),
				fetchFieldTypeList(),
				fetchDictList(),
			]);
			const detail = tableResponse.data;
			const groups = groupResponse.data ?? [];
			setGroupOptions(groups.map((item) => ({ id: item.id, groupName: item.groupName })));
			setDictOptions(dictResponse.data ?? []);
			setAttrTypeOptions(['String', ...Array.from(new Set((fieldTypeResponse.data ?? []).map((item) => item.attrType))), 'Object'].filter((value, index, array) => array.indexOf(value) === index));
			setBaseForm({
				id: detail.id,
				generatorType: detail.generatorType ?? '0',
				formLayout: Number(detail.formLayout ?? 1),
				backendPath: localStorage.getItem('backendPath') ?? detail.backendPath ?? '',
				frontendPath: localStorage.getItem('frontendPath') ?? detail.frontendPath ?? '',
				packageName: detail.packageName ?? '',
				author: detail.author ?? '',
				moduleName: detail.moduleName ?? '',
				functionName: detail.functionName ?? '',
				className: detail.className ?? '',
				tableComment: detail.tableComment ?? '',
				tableName: detail.tableName ?? tableName,
				dsName: detail.dsName ?? dsName,
				style: detail.style ?? groups[0]?.id ?? '',
				childTableName: detail.childTableName ?? '',
			});
			setFields(
				(detail.fieldList ?? []).map((item) => ({
					...item,
					queryFormType: item.queryFormType || propToType[item.attrType || item.fieldType] || 'text',
					formType: item.formType || propToType[item.attrType || item.fieldType] || 'text',
				}))
			);
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '生成配置加载失败。' });
		} finally {
			setLoading(false);
		}
	};

	const validateBaseForm = useMemo(
		() => () => {
			if (!baseForm.tableComment.trim()) return '表注释不能为空。';
			if (!baseForm.className.trim()) return '类名不能为空。';
			if (!baseForm.packageName.trim()) return '项目包名不能为空。';
			if (!baseForm.author.trim()) return '作者不能为空。';
			if (!baseForm.moduleName.trim()) return '模块名不能为空。';
			if (!baseForm.functionName.trim()) return '功能名不能为空。';
			if (!baseForm.style.trim()) return '代码风格不能为空。';
			if (baseForm.generatorType === '1' && (!baseForm.backendPath.trim() || !baseForm.frontendPath.trim())) return '自定义路径生成时，前后端路径不能为空。';
			return '';
		},
		[baseForm]
	);

	const handleNext = async () => {
		const errorText = validateBaseForm();
		if (errorText) {
			setFeedback({ type: 'error', message: errorText });
			return;
		}
		try {
			setSubmitting(true);
			await updateTableBase(baseForm);
			if (baseForm.generatorType === '1') {
				localStorage.setItem('backendPath', baseForm.backendPath);
				localStorage.setItem('frontendPath', baseForm.frontendPath);
			}
			setStep(1);
			setFeedback(null);
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '基础配置保存失败。' });
		} finally {
			setSubmitting(false);
		}
	};

	const saveFields = async () => {
		await updateTableFields(dsName, tableName, fields);
	};

	const handlePreview = async () => {
		try {
			setSubmitting(true);
			await saveFields();
			const files = await fetchGeneratorPreview(baseForm.id);
			setPreviewFiles(files);
			setActivePreviewPath(files[0]?.codePath ?? '');
			setPreviewOpen(true);
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '代码预览加载失败。' });
		} finally {
			setSubmitting(false);
		}
	};

	const handleGenerate = async () => {
		try {
			setSubmitting(true);
			await saveFields();
			if (baseForm.generatorType === '0') {
				const blob = await downloadCodeZip(baseForm.id, tableName);
				downloadBlob(blob, `${tableName}.zip`);
			} else {
				await generateCode(baseForm.id);
			}
			setFeedback({ type: 'success', message: '代码生成完成。' });
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '代码生成失败。' });
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">代码生成</CardTitle>
					<CardDescription>分两步完成基础信息配置和字段规则调整。</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<div className="grid gap-3 md:grid-cols-2">
						{['基础信息', '数据修改'].map((label, index) => (
							<button
								key={label}
								type="button"
								className={cn(
									'rounded-[24px] border px-4 py-3 text-left text-sm transition',
									step === index ? 'border-primary bg-primary text-primary-foreground' : 'border-border/70 bg-background hover:bg-accent'
								)}
								onClick={() => {
									if (index === 0) setStep(0);
								}}
							>
								{label}
							</button>
						))}
					</div>
					{feedback ? <div className={cn('rounded-2xl border px-4 py-3 text-sm', feedback.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700')}>{feedback.message}</div> : null}
					{loading ? (
						<div className="flex items-center justify-center py-24 text-muted-foreground">
							<LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
							加载中
						</div>
					) : step === 0 ? (
						<BasicSettings form={baseForm} groupOptions={groupOptions} onChange={(updater) => setBaseForm((prev) => updater(prev))} />
					) : (
						<FieldSettings fields={fields} dictOptions={dictOptions} attrTypeOptions={attrTypeOptions} onChange={setFields} />
					)}
					<div className="flex flex-wrap justify-center gap-3">
						{step === 0 ? (
							<Button onClick={() => void handleNext()} disabled={submitting || loading}>
								{submitting ? <LoaderCircle className="h-4 w-4 animate-spin" data-icon="inline-start" /> : <ArrowRight data-icon="inline-start" />}
								下一步
							</Button>
						) : (
							<>
								<Button variant="outline" onClick={() => setStep(0)} disabled={submitting}>
									<ArrowLeft data-icon="inline-start" />
									上一步
								</Button>
								<Button variant="outline" onClick={() => void handlePreview()} disabled={submitting || !baseForm.id}>
									<Eye data-icon="inline-start" />
									保存并预览
								</Button>
								<Button onClick={() => void handleGenerate()} disabled={submitting || !baseForm.id}>
									{submitting ? <LoaderCircle className="h-4 w-4 animate-spin" data-icon="inline-start" /> : <WandSparkles data-icon="inline-start" />}
									保存并生成
								</Button>
								<Button variant="outline" onClick={() => window.open(`/gen/design/index?tableName=${encodeURIComponent(tableName)}&dsName=${encodeURIComponent(dsName)}`, '_self')}>
									<Save data-icon="inline-start" />
									在线设计
								</Button>
							</>
						)}
					</div>
				</CardContent>
			</Card>

			<PreviewDialog open={previewOpen} files={previewFiles} activePath={activePreviewPath} onOpenChange={setPreviewOpen} onSelect={setActivePreviewPath} />
		</div>
	);
};
