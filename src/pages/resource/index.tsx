import { ArrowUpRight, Filter, Plus, Search } from 'lucide-react';
import type { RouteMeta } from '@/config/routes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export const ResourcePage = ({ meta }: { meta: RouteMeta }) => {
    const Icon = meta.icon;
    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="flex-row items-start justify-between gap-5">
                    <div className="flex items-start gap-4">
                        <div className="flex size-14 items-center justify-center rounded-[24px] bg-primary/12 text-primary">
                            <Icon className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-3">
                                <CardTitle className="text-2xl">{meta.label}</CardTitle>
                                <Badge variant="secondary">{meta.group}</Badge>
                            </div>
                            <CardDescription className="mt-2 max-w-2xl">{meta.description}</CardDescription>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Button variant="outline">
                            <Filter data-icon="inline-start" />
                            筛选
                        </Button>
                        <Button>
                            <Plus data-icon="inline-start" />
                            新建
                        </Button>
                    </div>
                </CardHeader>
            </Card>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_360px]">
                <Card>
                    <CardHeader className="flex-row items-center justify-between gap-4">
                        <div>
                            <CardTitle>资源列表</CardTitle>
                            <CardDescription>列表与摘要信息。</CardDescription>
                        </div>
                        <div className="flex min-w-[260px] items-center gap-3">
                            <div className="relative flex-1">
                                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input className="pl-10" placeholder={`搜索${meta.label}`} />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div
                                key={index}
                                className="grid gap-4 rounded-[24px] border border-border/70 bg-background/75 p-4 md:grid-cols-[1.2fr_1fr_140px] md:items-center"
                            >
                                <div>
                                    <p className="font-medium">
                                        {meta.label} 项目 {index + 1}
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">当前页面内容待补充。</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Badge>已同步</Badge>
                                    <Badge variant="outline">待接接口</Badge>
                                </div>
                                <div className="flex justify-start md:justify-end">
                                    <Button variant="ghost">
                                        查看详情
                                        <ArrowUpRight data-icon="inline-end" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>页面说明</CardTitle>
                        <CardDescription>当前页面可继续补充业务内容。</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
                        <p>1. 当前页面为模块入口。</p>
                        <p>2. 可在此补充列表、表单和详情模块。</p>
                        <p>3. 业务接口与校验逻辑可按模块继续接入。</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
