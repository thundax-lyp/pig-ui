export type DepartmentNode = {
	id: string;
	deptId?: string;
	parentId?: string;
	name: string;
	weight?: number;
	sortOrder?: number;
	createTime?: string;
	children?: DepartmentNode[];
};

export type DepartmentDetail = {
	deptId: string;
	parentId: string;
	name: string;
	sortOrder: number;
};
