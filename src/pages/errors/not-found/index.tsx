import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const NotFoundPage = () => {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
            <p className="font-display text-7xl tracking-tight text-primary">404</p>
            <div className="space-y-2">
                <h1 className="font-display text-3xl tracking-tight">页面不存在</h1>
                <p className="text-muted-foreground">未找到对应页面。</p>
            </div>
            <Button asChild>
                <Link to="/home">返回工作台</Link>
            </Button>
        </div>
    );
};
