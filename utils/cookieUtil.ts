import jscookie from 'js-cookie';
import { isClient } from './util';
import { ECookieName } from './enum';

/**
 * cookie專用
 *
 * @export
 * @class cookieUtil
 */
export default class cookieUtil {
	/**
	 * 設定cookie
	 *
	 * @static
	 * @param {string} key key
	 * @param {string} value value
	 * @param {number} [expireDay=30] 過期日（等於0代表session cookie，瀏覽器關閉即消失）
	 * @param {string} [domain=''] 域名
	 */
	public static set(key: ECookieName, value: string, expireDay: number = 30, serverContext?: any): void {
		const newValue = value;
		if (isClient) {
			const cookieOption: any = {};
			expireDay !== 0 && (cookieOption.expires = expireDay);
			jscookie.set(key, newValue, cookieOption);
		} else if (serverContext) {
			serverContext.res.cookie.set(key, newValue, {
				maxAge: 60 * 60 * 24 * 1000 * expireDay,
				encode: String,
				httpOnly: false,
				overwrite: true,
			});
		}
	}

	/**
	 * 取得cookie
	 *
	 * @static
	 * @param {string} key key
	 * @param {*} serverContext SSR務必帶入
	 * @returns {string}
	 */
	public static get(key: ECookieName, serverContext?: any): string {
		let value = '';

		if (isClient) {
			value = jscookie.get(key) || '';
		} else if (serverContext) {
			value = serverContext.res.cookie.get(key);
		}
		return value;
	}

	/**
	 * 刪除cookie
	 *
	 * @static
	 * @param {string} key key
	 * @param {*} serverContext SSR務必帶入
	 * @returns {string}
	 */
	public static remove(key: string, serverContext?: any): void {
		if (isClient) {
			jscookie.remove(key);
		} else if (serverContext) {
			serverContext.res.cookie.set(key, null);
		}
	}
}
