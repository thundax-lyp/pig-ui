export type JobItem = {
    jobId: string;
    jobName: string;
    jobGroup: string;
    jobStatus: string;
    jobExecuteStatus: string;
    startTime?: string;
    previousTime?: string;
    nextTime?: string;
    jobType: string;
    executePath?: string;
    className?: string;
    methodName?: string;
    methodParamsValue?: string;
    cronExpression: string;
    misfirePolicy: string;
    remark?: string;
};

export type JobLogItem = {
    jobLogId: string;
    jobName: string;
    jobMessage?: string;
    jobLogStatus: string;
    executeTime?: number | string;
    exceptionInfo?: string;
    createTime?: string;
};

export type JobFormState = {
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
