import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export const LoginPage = () => {
	return (
		<div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-10">
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(226,107,76,0.20),transparent_25%),radial-gradient(circle_at_80%_10%,rgba(15,23,42,0.14),transparent_32%),linear-gradient(135deg,#f7f3ee,#f3efe8_40%,#fbfaf8)]" />
			<div className="absolute inset-y-0 left-0 hidden w-[42%] border-r border-white/60 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(30,41,59,0.86))] p-10 text-white lg:block">
				<div className="flex h-full flex-col justify-between">
					<div>
						<p className="text-xs uppercase tracking-[0.28em] text-white/60">PIG CLOUD</p>
						<h1 className="mt-6 max-w-md font-display text-5xl leading-[1.02] tracking-tight">Service operations control center.</h1>
					</div>
					<div className="max-w-sm rounded-[32px] border border-white/10 bg-white/6 p-6 backdrop-blur">
						<p className="text-sm text-white/72">统一的系统入口与账号登录界面。</p>
					</div>
				</div>
			</div>
			<Card className="relative z-10 w-full max-w-[480px] lg:ml-[38%]">
				<CardHeader>
					<div className="flex size-14 items-center justify-center rounded-[24px] bg-primary/12 text-primary">
						<ShieldCheck className="h-7 w-7" />
					</div>
					<CardTitle className="mt-4 text-3xl">欢迎回来</CardTitle>
					<CardDescription>请输入账号和密码登录系统。</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<Input placeholder="用户名 / 邮箱" />
					<Input type="password" placeholder="密码" />
					<Button size="lg">
						登录控制台
						<ArrowRight data-icon="inline-end" />
					</Button>
				</CardContent>
			</Card>
		</div>
	);
};
