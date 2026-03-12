import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig, loadEnv, ConfigEnv } from 'vite';
import topLevelAwait from 'vite-plugin-top-level-await';
import viteCompression from 'vite-plugin-compression';

const pathResolve = (dir: string) => {
	return resolve(__dirname, '.', dir);
};

const alias: Record<string, string> = {
	'@': pathResolve('./src/'),
};

const viteConfig = defineConfig((mode: ConfigEnv) => {
	const env = loadEnv(mode.mode, process.cwd());
	// 判断是否开发环境
	const isDev = env.ENV === 'development'
	return {
		plugins: [
			react(),
			topLevelAwait({
				promiseExportName: '__tla', // TLA Promise 变量名
				promiseImportName: (i) => `__tla_${i}`, // TLA Promise 导入名
			}),
			viteCompression({
				deleteOriginFile: false, // 压缩后删除原来的文件
			})
		],
		root: process.cwd(), // 项目根目录
		resolve: { alias }, // 路径别名配置
		base: mode.command === 'serve' ? './' : env.VITE_PUBLIC_PATH,
		server: {
			host: '0.0.0.0', // 服务器地址
			port: env.VITE_PORT as unknown as number, // 服务器端口号
			open: env.VITE_OPEN === 'true', // 是否自动打开浏览器
			hmr: true, // 启用热更新
			proxy: {
				'/api': {
					target: env.VITE_ADMIN_PROXY_PATH, // 目标服务器地址
					ws: true, // 是否启用 WebSocket
					changeOrigin: true, // 是否修改请求头中的 Origin 字段
					rewrite: (path) => path.replace(/^\/api/, ''),
				},
				'^/ws/info/.*': {
					target: env.VITE_ADMIN_PROXY_PATH, // 目标服务器地址
					ws: true, // 是否启用 WebSocket
					changeOrigin: true,
				},
			},
		},
		build: {
			outDir: 'dist', // 打包输出目录
			chunkSizeWarningLimit: 1500, // 代码分包阈值
			// 开发使用 esbuild 更快，生产环境打包使用 terser 可以删除更多注释
			minify: isDev ?  'esbuild' : 'terser',
			terserOptions: {
				compress: {
					drop_console: true, // 删除 console
					drop_debugger: true, // 删除 debugger
				},
				format: {
					comments: false // 删除所有注释
				}
			},
			rollupOptions: {
				output: {
					entryFileNames: `assets/[name].[hash].js`,
					chunkFileNames: `assets/[name].[hash].js`,
					assetFileNames: `assets/[name].[hash].[ext]`,
					compact: true,
					manualChunks: {
						react: ['react', 'react-dom', 'react-router-dom'],
					},
				},
			},
		},
		css: { preprocessorOptions: { css: { charset: false } } },
		define: {
			__VERSION__: JSON.stringify(process.env.npm_package_version),
			__NEXT_NAME__: JSON.stringify(process.env.npm_package_name),
		},
	};
});

export default viteConfig;
