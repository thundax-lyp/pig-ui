import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/app-shell';
import { appRoutes, findRouteMetaByPath } from '@/config/routes';
import { LoginPage } from '@/pages/auth/login';
import { JobManagePage } from '@/pages/daemon/job-manage';
import { DashboardPage } from '@/pages/dashboard';
import { AccessDeniedPage } from '@/pages/errors/access-denied';
import { NotFoundPage } from '@/pages/errors/not-found';
import { ExtCachePage } from '@/pages/ext/cache';
import { GenDatasourcePage } from '@/pages/gen/datasource';
import { GenDesignPage } from '@/pages/gen/design';
import { GenFieldTypePage } from '@/pages/gen/field-type';
import { GenGenerPage } from '@/pages/gen/gener';
import { GenGroupPage } from '@/pages/gen/group';
import { GenTablePage } from '@/pages/gen/table';
import { GenTemplatePage } from '@/pages/gen/template';
import { ResourcePage } from '@/pages/resource';
import { AdminClientPage } from '@/pages/sys/client';
import { AdminDeptPage } from '@/pages/sys/dept';
import { AdminDictPage } from '@/pages/sys/dict';
import { AdminFilePage } from '@/pages/sys/file';
import { AdminLogPage } from '@/pages/sys/log';
import { AdminMenuPage } from '@/pages/sys/menu';
import { AdminParamPage } from '@/pages/sys/param';
import { AdminPostPage } from '@/pages/sys/post';
import { AdminRolePage } from '@/pages/sys/role';
import { AdminTokenPage } from '@/pages/sys/token';
import { AdminUserPage } from '@/pages/sys/user';

export default function App() {
	return (
		<Routes>
			<Route path="/login" element={<LoginPage />} />
			<Route path="/401" element={<AccessDeniedPage />} />
			<Route path="/" element={<AppShell />}>
				<Route index element={<Navigate to="/home" replace />} />
				<Route path="home" element={<DashboardPage />} />
				<Route path="admin/user/index" element={<AdminUserPage />} />
				<Route path="admin/role/index" element={<AdminRolePage />} />
				<Route path="admin/menu/index" element={<AdminMenuPage />} />
				<Route path="admin/dept/index" element={<AdminDeptPage />} />
				<Route path="admin/post/index" element={<AdminPostPage />} />
				<Route path="admin/dict/index" element={<AdminDictPage />} />
				<Route path="admin/client/index" element={<AdminClientPage />} />
				<Route path="admin/param/index" element={<AdminParamPage />} />
				<Route path="admin/token/index" element={<AdminTokenPage />} />
				<Route path="admin/log/index" element={<AdminLogPage />} />
				<Route path="admin/file/index" element={<AdminFilePage />} />
				<Route path="gen/datasource/index" element={<GenDatasourcePage />} />
				<Route path="gen/field-type/index" element={<GenFieldTypePage />} />
				<Route path="gen/group/index" element={<GenGroupPage />} />
				<Route path="gen/table/index" element={<GenTablePage />} />
				<Route path="gen/template/index" element={<GenTemplatePage />} />
				<Route path="gen/design/index" element={<GenDesignPage />} />
				<Route path="gen/gener/index" element={<GenGenerPage />} />
				<Route path="ext/cache" element={<ExtCachePage />} />
				<Route path="daemon/job-manage/index" element={<JobManagePage />} />
				{appRoutes
					.filter((route) => !['/home', '/admin/user/index', '/admin/role/index', '/admin/menu/index', '/admin/dept/index', '/admin/post/index', '/admin/dict/index', '/admin/client/index', '/admin/param/index', '/admin/token/index', '/admin/log/index', '/admin/file/index', '/gen/datasource/index', '/gen/field-type/index', '/gen/group/index', '/gen/table/index', '/gen/template/index', '/gen/design/index', '/gen/gener/index', '/ext/cache', '/daemon/job-manage/index'].includes(route.path))
					.map((route) => (
						<Route
							key={route.path}
							path={route.path.slice(1)}
							element={<ResourcePage meta={findRouteMetaByPath(route.path)!} />}
						/>
					))}
			</Route>
			<Route path="*" element={<NotFoundPage />} />
		</Routes>
	);
}
