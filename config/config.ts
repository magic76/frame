import getNextConfig from 'next/config';

const YCB = require('ycb');
const envStage: string = process.env.ENV_STAGE === 'preprod' ? 'pre' : process.env.ENV_STAGE || 'dev';

let publicRuntimeConfig: any = {};
try {
	publicRuntimeConfig = getNextConfig().publicRuntimeConfig || {};
} catch (e) {}
const getParam = (name: string): string => {
	return publicRuntimeConfig[name] || process.env[name] || '';
};

const subDomain = (global as any).document ? (global as any).location.host.split('.')[0] : '';
const masterConfig = {
	settings: ['master'],
	env: getParam('ENV_STAGE'),
	isUseMockData: false,
	isStartRecordMockData: false,
	apiLocalHost: 'http://localhost:3000/api/log',
	invalidPage: '/login',
	isAuthCheck: true,
	langs: ['zh-cn', 'en-us'],
};

const configArray = [
	{
		dimensions: [
			{
				environment: {
					prod: null,
					pre: null,
					qa: null,
					alpha: null,
					dev: null,
				},
			},
			{
				locate: {
					server: null,
					client: null,
				},
			},
		],
	},
	masterConfig,
	{
		settings: ['environment:alpha,qa,pre,prod'],
	},
	{
		settings: ['environment:alpha,qa,pre,prod', 'locate:server'],
	},
	{
		settings: ['locate:server'],
		apiTimeout: 2000,
	},
	{
		settings: ['environment:dev'],
		env: 'dev',
		isUseMockData: false,
		isStartRecordMockData: false,
		apiLocalHost: 'http://localhost:3000/api/log',
		isAuthCheck: false,
	},
];

const ycbObj = new YCB.Ycb(configArray);

const config: typeof masterConfig = ycbObj.read({
	environment: getParam('ENV_STAGE') === 'preprod' ? 'pre' : getParam('ENV_STAGE') || 'dev',
	locate: (global as any).document ? 'client' : 'server',
});
export default config;
