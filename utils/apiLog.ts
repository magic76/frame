import config from '~/config/config';
import * as util from '~/utils/util';
import idx from 'idx';
/**
 * 用xray紀錄訊息，可用做debug或是某些服務中斷
 *
 * @static
 * @param {*} serviceName 服務名稱
 * @param {*} description 描述
 * @param {*} error 錯誤訊息，使用這個xray會顯示紅圈
 * @returns {*}
 */
export default ({
	serviceName,
	description,
	error,
	warn,
	option,
}: {
	serviceName: string;
	description: string;
	error?: string;
	warn?: string;
	option?: any;
}) => {
	setTimeout(() => {
		try {
			const serverHost: string = config.apiLocalHost;
			const clientHost = util.isClient ? `${idx(global, (_: any) => _.location.origin)}/api/log` : '';
			let apiParams = option || {};
			apiParams = {
				...apiParams,
				serviceName,
				description,
				error,
				warn,
			};
			fetch(util.isClient ? clientHost : serverHost, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json; charset=UTF-8',
				},
				body: JSON.stringify(apiParams),
			});
		} catch (e) {
			console.log(e);
		}
	}, 0);
};
