import { ArrowRight, LoaderCircle, Smartphone, UserRound, UserRoundPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    buildVerifyCodeUrl,
    fetchCurrentUserInfo,
    generateRandomStr,
    loginByMobile,
    loginByPassword,
    registerUser,
    sendMobileCode,
} from './service';
import type { MobileLoginPayload, PasswordLoginPayload, RegisterPayload } from './types';
import { clearAuthSession, setRefreshToken, setSessionValue, setToken } from '@/lib/session';

type LoginTab = 'account' | 'mobile' | 'register';

export const LoginPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [tab, setTab] = useState<LoginTab>('account');
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
    const [passwordForm, setPasswordForm] = useState<PasswordLoginPayload>({
        username: 'admin',
        password: '123456',
        code: '',
        randomStr: generateRandomStr(),
    });
    const [mobileForm, setMobileForm] = useState<MobileLoginPayload>({ mobile: '', code: '' });
    const [registerForm, setRegisterForm] = useState<RegisterPayload>({ username: '', password: '', phone: '' });
    const [mobileCountdown, setMobileCountdown] = useState(0);
    const [verifyVersion, setVerifyVersion] = useState(0);
    const verifyEnable = String(import.meta.env.VITE_VERIFY_ENABLE).trim() === 'true';
    const registerEnable = String(import.meta.env.VITE_REGISTER_ENABLE).trim() === 'true';
    const redirectTo = useMemo(() => {
        const redirect = searchParams.get('redirect');
        if (!redirect || !redirect.startsWith('/') || redirect.startsWith('//')) return '/home';
        if (redirect.startsWith('/login')) return '/home';
        return redirect;
    }, [searchParams]);
    const verifyCodeUrl = useMemo(() => {
        const baseUrl = buildVerifyCodeUrl(passwordForm.randomStr || '');
        return `${baseUrl}&t=${verifyVersion}`;
    }, [passwordForm.randomStr, verifyVersion]);

    async function handleLoginSuccess(accessToken: string, refreshToken: string) {
        setToken(accessToken);
        setRefreshToken(refreshToken);
        const currentUser = await fetchCurrentUserInfo();
        setSessionValue('currentUser', currentUser.data);
        navigate(redirectTo, { replace: true });
    }

    function refreshVerifyCode() {
        setVerifyVersion(Date.now());
        setPasswordForm((prev) => ({ ...prev, code: '', randomStr: generateRandomStr() }));
    }

    async function handlePasswordLogin() {
        if (!passwordForm.username?.trim() || !passwordForm.password?.trim()) {
            setFeedback({ type: 'error', message: '请输入用户名和密码。' });
            return;
        }
        if (verifyEnable && !passwordForm.code?.trim()) {
            setFeedback({ type: 'error', message: '请输入图形验证码。' });
            return;
        }

        try {
            setLoading(true);
            setFeedback(null);
            const token = await loginByPassword(passwordForm);
            await handleLoginSuccess(token.access_token, token.refresh_token);
        } catch (error: any) {
            refreshVerifyCode();
            clearAuthSession();
            setFeedback({ type: 'error', message: error?.msg ?? error?.error_description ?? '登录失败，请检查账号信息。' });
        } finally {
            setLoading(false);
        }
    }

    async function handleMobileLogin() {
        if (!mobileForm.mobile.trim() || !mobileForm.code.trim()) {
            setFeedback({ type: 'error', message: '请输入手机号和验证码。' });
            return;
        }

        try {
            setLoading(true);
            setFeedback(null);
            const token = await loginByMobile(mobileForm);
            await handleLoginSuccess(token.access_token, token.refresh_token);
        } catch (error: any) {
            clearAuthSession();
            setFeedback({ type: 'error', message: error?.msg ?? error?.error_description ?? '手机登录失败，请稍后再试。' });
        } finally {
            setLoading(false);
        }
    }

    async function handleSendMobileCode() {
        if (!/^1\d{10}$/.test(mobileForm.mobile.trim())) {
            setFeedback({ type: 'error', message: '请输入正确的手机号。' });
            return;
        }

        try {
            setFeedback(null);
            const response = await sendMobileCode(mobileForm.mobile.trim());
            if (!response.data) {
                setFeedback({ type: 'error', message: response.msg ?? '验证码发送失败。' });
                return;
            }

            setMobileCountdown(60);
            const timer = window.setInterval(() => {
                setMobileCountdown((prev) => {
                    if (prev <= 1) {
                        window.clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '验证码发送失败。' });
        }
    }

    async function handleRegister() {
        if (registerForm.username.trim().length < 5) {
            setFeedback({ type: 'error', message: '用户名至少 5 位。' });
            return;
        }
        if (registerForm.password.trim().length < 6) {
            setFeedback({ type: 'error', message: '密码至少 6 位。' });
            return;
        }
        if (!/^1\d{10}$/.test(registerForm.phone.trim())) {
            setFeedback({ type: 'error', message: '请输入正确的手机号。' });
            return;
        }

        try {
            setLoading(true);
            setFeedback(null);
            await registerUser(registerForm);
            setFeedback({ type: 'success', message: '注册成功，请返回账号登录。' });
            setTab('account');
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '注册失败，请稍后重试。' });
        } finally {
            setLoading(false);
        }
    }

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
                    <div className="flex gap-2">
                        <TabButton active={tab === 'account'} onClick={() => setTab('account')} icon={UserRound} label="账号登录" />
                        <TabButton active={tab === 'mobile'} onClick={() => setTab('mobile')} icon={Smartphone} label="手机登录" />
                        {registerEnable ? (
                            <TabButton active={tab === 'register'} onClick={() => setTab('register')} icon={UserRoundPlus} label="注册" />
                        ) : null}
                    </div>
                    <CardTitle className="mt-4 text-3xl">欢迎回来</CardTitle>
                    <CardDescription>
                        {tab === 'account' ? '请输入账号和密码登录系统。' : tab === 'mobile' ? '请输入手机号和短信验证码。' : '创建一个新的控制台账号。'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    {feedback ? (
                        <div
                            className={
                                feedback.type === 'error'
                                    ? 'rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700'
                                    : 'rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700'
                            }
                        >
                            {feedback.message}
                        </div>
                    ) : null}
                    {tab === 'account' ? (
                        <>
                            <Input
                                placeholder="用户名 / 邮箱"
                                value={passwordForm.username}
                                onChange={(event) => setPasswordForm((prev) => ({ ...prev, username: event.target.value }))}
                            />
                            <Input
                                type="password"
                                placeholder="密码"
                                value={passwordForm.password}
                                onChange={(event) => setPasswordForm((prev) => ({ ...prev, password: event.target.value }))}
                            />
                            {verifyEnable ? (
                                <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-3">
                                    <Input
                                        placeholder="图形验证码"
                                        maxLength={4}
                                        value={passwordForm.code}
                                        onChange={(event) => setPasswordForm((prev) => ({ ...prev, code: event.target.value }))}
                                    />
                                    <button
                                        type="button"
                                        className="overflow-hidden rounded-[18px] border border-border/70 bg-card"
                                        onClick={refreshVerifyCode}
                                    >
                                        <img src={verifyCodeUrl} alt="验证码" className="h-12 w-full object-cover" />
                                    </button>
                                </div>
                            ) : null}
                            <Button size="lg" disabled={loading} onClick={() => void handlePasswordLogin()}>
                                {loading ? <LoaderCircle className="h-4 w-4 animate-spin" data-icon="inline-start" /> : null}
                                登录控制台
                                <ArrowRight data-icon="inline-end" />
                            </Button>
                        </>
                    ) : null}
                    {tab === 'mobile' ? (
                        <>
                            <Input
                                placeholder="手机号"
                                value={mobileForm.mobile}
                                onChange={(event) => setMobileForm((prev) => ({ ...prev, mobile: event.target.value }))}
                            />
                            <div className="grid grid-cols-[minmax(0,1fr)_132px] gap-3">
                                <Input
                                    placeholder="短信验证码"
                                    value={mobileForm.code}
                                    onChange={(event) => setMobileForm((prev) => ({ ...prev, code: event.target.value }))}
                                />
                                <Button variant="outline" disabled={mobileCountdown > 0} onClick={() => void handleSendMobileCode()}>
                                    {mobileCountdown > 0 ? `${mobileCountdown}s后重发` : '发送验证码'}
                                </Button>
                            </div>
                            <Button size="lg" disabled={loading} onClick={() => void handleMobileLogin()}>
                                {loading ? <LoaderCircle className="h-4 w-4 animate-spin" data-icon="inline-start" /> : null}
                                登录控制台
                                <ArrowRight data-icon="inline-end" />
                            </Button>
                        </>
                    ) : null}
                    {tab === 'register' ? (
                        <>
                            <Input
                                placeholder="用户名"
                                value={registerForm.username}
                                onChange={(event) => setRegisterForm((prev) => ({ ...prev, username: event.target.value }))}
                            />
                            <Input
                                type="password"
                                placeholder="密码"
                                value={registerForm.password}
                                onChange={(event) => setRegisterForm((prev) => ({ ...prev, password: event.target.value }))}
                            />
                            <Input
                                placeholder="手机号"
                                value={registerForm.phone}
                                onChange={(event) => setRegisterForm((prev) => ({ ...prev, phone: event.target.value }))}
                            />
                            <Button size="lg" disabled={loading} onClick={() => void handleRegister()}>
                                {loading ? <LoaderCircle className="h-4 w-4 animate-spin" data-icon="inline-start" /> : null}
                                创建账号
                                <ArrowRight data-icon="inline-end" />
                            </Button>
                        </>
                    ) : null}
                </CardContent>
            </Card>
        </div>
    );
};

const TabButton = ({
    active,
    icon: Icon,
    label,
    onClick,
}: {
    active: boolean;
    icon: typeof UserRound;
    label: string;
    onClick: () => void;
}) => (
    <button
        type="button"
        className={
            active
                ? 'inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground'
                : 'inline-flex items-center gap-2 rounded-full border border-border/70 px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground'
        }
        onClick={onClick}
    >
        <Icon className="h-4 w-4" />
        {label}
    </button>
);
