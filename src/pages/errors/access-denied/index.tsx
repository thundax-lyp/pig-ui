import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const AccessDeniedPage = () => {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
            <p className="font-display text-7xl tracking-tight text-primary">401</p>
            <div className="space-y-2">
                <h1 className="font-display text-3xl tracking-tight">无访问权限</h1>
                <p className="text-muted-foreground">当前账号没有访问这个模块的权限。</p>
            </div>
            <Button asChild variant="outline">
                <Link to="/home">回到首页</Link>
            </Button>
        </div>
    );
};
