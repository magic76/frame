const param = require('jquery-param');
import fetch from 'isomorphic-fetch';

import config from '~/config/config';

/**
 * promise專用
 *
 * @export
 * @class fetchUtil
 */

export default class apiUtil {
	/**
	 * 送出請求
	 *
	 * @static
	 * @param {*} promise promise
	 * @param {number} [timeout=3000] timout時間
	 * @returns {Promise<any>}
	 */
	public static fetchGQL({
		action,
		data,
		isBlob,
		token,
		lang,
	}: {
		action: string;
		data: any;
		token: string;
		lang: string;
		isBlob?: boolean;
	}): Promise<any> {
		const option: any = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
				'x-authentication': token,
				'x-language-code': lang,
			},
			body: param(data),
		};
		return fetch(`${config.gqlHost}${action}`, option).then((d: any) => {
			try {
				if (isBlob) {
					return d.blob();
				}

				return d.json();
			} catch (e) {
				console.log(e);
				return {};
			}
		});
	}

	// /**
	//  * call linebot api
	//  *
	//  */
	// public static async callLineBot(message: string) {
	// 	const env = process.env.ENV_STAGE || 'dev';
	// 	const post_data = { message: `${env}: ${message}` };

	// 	fetch('https://ehdw7uvaa5.execute-api.eu-west-1.amazonaws.com/prod/message', {
	// 		method: 'POST',
	// 		body: JSON.stringify(post_data),
	// 		'Content-Type': 'application/json',
	// 		Accept: 'application/json',
	// 	});
	// }
}
