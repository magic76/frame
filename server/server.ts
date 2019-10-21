const Koa = require('koa');
const Router = require('koa-router');
const bodyParser: any = require('koa-bodyparser');
const next = require('next');
const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;
const app = next({ dev });
const handle = app.getRequestHandler();
const xrayName = `${process.env.ENV_STAGE || 'dev'}:${process.env.SERVICE_NAME || 'web'}`;
app.prepare()
	.then(() => {
		const server = new Koa();
		const router = new Router();
		server.use(async (ctx: any, next: any) => {
			ctx.res.statusCode = 200;
			ctx.res.cookie = ctx.cookies;

			// Create res.redirect method
			ctx.res.redirect = (url: string, status: number, message: string): void => {
				if (status) {
					ctx.status = status;
				}
				ctx.redirect(url);
				if (message) {
					ctx.body = message;
				}
				ctx.respond = false;
				ctx.res.end();
			};
			await next();
		});
		router.get('/ping', async (ctx: any) => {
			ctx.body = { result: 'ok' };
		});
		const awsXray = require('./middleware/awsXray');
		router.post(
			'/api/log',
			bodyParser(),
			awsXray.openSegment(xrayName),
			async (ctx: any): Promise<any> => {
				const body: any = ctx.request.body || {};
				if (body.serviceName) {
					const subSegment = ctx.req.segment.addNewSubsegment(`${process.env.ENV_STAGE}:${body.serviceName}`);
					subSegment.namespace = 'remote';
					Object.keys(body).map(key => {
						const annotationContent = body[key] instanceof Object ? JSON.stringify(body[key]) : body[key];
						subSegment.addAnnotation(key, annotationContent);
					});

					body.error && subSegment.addError(body.error);
					body.warn && subSegment.addErrorFlag();
					ctx.status = 200;
					subSegment.close();
				}
			},
		);

		mockApiSetAndGet(router);

		router.get('*', awsXray.openSegment(xrayName), async (ctx: any) => {
			await setXRayPageSegment(ctx, 'deviceType', async () => {
				await handle(ctx.req, ctx.res);
			});
			ctx.respond = false;
		});

		server.use(router.routes());

		server.listen(port, (err: any) => {
			if (err) {
				throw err;
			}
			console.log(`> WEB Ready on http://localhost:${port}`);
		});
	})
	.catch((a: any, b: any) => console.log(a, b));

// 設定Xray頁面分段資料
const setXRayPageSegment: any = async (ctx: any, deviceType: number, callback: any): Promise<void> => {
	const url: string = ctx.url;
	// xray segment名字不支援問號，要濾掉
	const subsegment: any = ctx.req.segment.addNewSubsegment(url.indexOf('?') > -1 ? url.split('?')[0] : url);
	subsegment.addAnnotation('type', 'page');
	subsegment.addAnnotation('computerName', process.env.COMPUTERNAME || '');
	subsegment.addAnnotation('domain', ctx.req.headers.host);
	subsegment.addAnnotation('requestPath', url);
	subsegment.addAnnotation('deviceType', deviceType);
	subsegment.addAnnotation('username', `ctx.res.cookie.get('ECookieName.COOKIE_USERNAME')` || 'guest');
	subsegment.addAnnotation('referer', ctx.req.headers.referer || '');
	subsegment.addAnnotation('cookie', ctx.req.headers.cookie || '');

	await callback();
	subsegment.close();
};

// 開發用，做假資料的儲存
const mockApiSetAndGet = (router: any) => {
	router.post(
		'/mockApi',
		bodyParser(),
		async (ctx: any): Promise<any> => {
			const fs = require('fs');
			const body: any = ctx.request.body || {};
			const { operationName, variables } = body;

			try {
				let filedata: any;
				const fileDataKey = JSON.stringify(variables);
				filedata = fs.readFileSync(`./graphqlData/${operationName}.json`);
				filedata = JSON.parse(filedata);
				ctx.body = { data: filedata[operationName === 'memberLogin' ? 'default' : fileDataKey] };
			} catch (e) {}
		},
	);
	router.post(
		'/api/mock',
		bodyParser(),
		async (ctx: any, next: any): Promise<any> => {
			const fs = require('fs');
			const body: any = ctx.request.body || {};
			const logParam = body.logParam || {};
			// 開發時方便把檔案存到json檔內做運用
			if (logParam && !process.env.ENV_STAGE) {
				const gqlData = JSON.parse(logParam.response);
				const result: any = {};
				Object.keys(gqlData).map(name => {
					const payload = gqlData[name];
					if (payload && payload.constructor === Array) {
						payload.length > 0 && (result[name] = payload);
					} else if (payload) {
						result[name] = payload;
					}
				});
				let logData: any = {};
				try {
					logData = fs.readFileSync(`./graphqlData/${logParam.operationName}.json`);
					logData = logData && JSON.parse(logData);
				} catch (e) {
					console.log('catch fs exception.');
				}
				logData[logParam.variables] = result;
				fs.writeFileSync(
					`./graphqlData/${logParam.operationName}.json`,
					JSON.stringify(logData, null, '\t') + '\n',
				);
			}
		},
	);
};
module.exports = undefined;
