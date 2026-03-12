export type LogItem = {
	id: string;
	logType: string;
	title: string;
	remoteAddr: string;
	method: string;
	time?: number;
	createTime: string;
	createBy: string;
	requestUri?: string;
	userAgent?: string;
	serviceId?: string;
	params?: string;
	exception?: string;
};
