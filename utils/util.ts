import { AES, enc } from 'crypto-js';
import config from '../config/config';
import { format, endOfDay, subSeconds } from 'date-fns';
import { parseFromTimeZone, formatToTimeZone } from 'date-fns-timezone';

type Params<F extends (...args: any[]) => any> = F extends ((...args: infer A) => any) ? A : never;

export const curry = <T>(f: T) => {
	if (typeof f !== 'function') {
		throw new Error('[curry] argument must be a function!');
	}

	const g = (...args1: any[]) => {
		if (args1.length >= f.length) {
			return f(...args1);
		} else {
			return (...args2: any[]) => g(...args1, ...args2);
		}
	};
	return g;
};

export const compose = (...fns: any[]) => {
	return fns.reverse().reduce(function reducer(fn1, fn2) {
		if (typeof fn2 !== 'function') {
			throw new Error('[compose] all arguments must be functions!');
		}
		return function composed(...args: any[]) {
			return fn2(fn1(...args));
		};
	});
};

export const throttle = (fn: any, threshold = 1000 / 60 /* 60FPS */) => {
	let last: number;
	let timerId: any;

	return (...args: any[]) => {
		const now = Date.now();
		if (last && now < last + threshold) {
			clearTimeout(timerId);
			timerId = setTimeout(() => {
				last = now;
				fn(...args);
			}, threshold);
		} else {
			last = now;
			fn(...args);
		}
	};
};

export const runSerial = (tasks: any[]) => {
	let result = Promise.resolve();
	tasks.forEach(task => {
		result = result.then(() => task());
	});
	return result;
};

export const encryptJSON = (obj: any) => {
	try {
		return !obj ? '' : AES.encrypt(JSON.stringify(obj), config.secretKey).toString();
	} catch (e) {
		console.log('encryptJSON failed.', e);
		return '';
	}
};

export const decryptJSON = (obj: any) => {
	try {
		return !obj ? '' : JSON.parse(AES.decrypt(obj, config.secretKey).toString(enc.Utf8));
	} catch (e) {
		console.log('decryptJSON failed.', e);
		return '';
	}
};

export const getTargetString = (member: { memberId?: number; type?: string; username?: string }) => {
	if (!member) {
		return '';
	}
	return encryptJSON(member);
};

// 轉換成昨天晚上11:59:59的UTC -4時區
export const getYesterdayStartTime = () => {
	return getYesterdayOfTargetDay(Date.now()).getTime();
};

export const getYesterdayOfTargetDay = (timestamp: number) => {
	const UTCPOSTIVE4TIMEZONE = 'America/Anguilla';
	// 取得-4時區的今天日期
	const todayUTCPostive4String = formatToTimeZone(new Date(timestamp).toString(), 'YYYY/MM/DD', {
		timeZone: UTCPOSTIVE4TIMEZONE,
	});

	// 今天-4時區日期的前一秒，即為-4時區的昨天23:59:59
	const endOfYesterdayUTCPostive4 = subSeconds(
		parseFromTimeZone(todayUTCPostive4String, { timeZone: UTCPOSTIVE4TIMEZONE }),
		1,
	);

	return endOfYesterdayUTCPostive4;
};

export const getUTCNegative4Time = (timestamp: number) => {
	const hourByMileSecond = 60 * 60 * 1000;
	return timestamp + 4 * hourByMileSecond;
};

// 讓jest再跑的時候視同server side，因為client會有些動作延後執行，加快第一屏出來的時間
export const isClient = (global as any).document && !process.env.JEST_WORKER_ID ? true : false;
export const isPerf = isClient ? location.href.indexOf('perf=') > 0 : false;
export const isMobile = isClient && window.innerWidth < 768 ? true : false;

export const getCalculatedPT = (num: number, isOut: boolean) => {
	const TOTAL_PT = 0.7;
	let calculatedPT;
	if (isOut) {
		calculatedPT = num < 0 ? num : ~~(num / TOTAL_PT);
	} else {
		calculatedPT = num < 0 ? num : ~~(num * TOTAL_PT);
	}
	return calculatedPT;
};

// America/Anguilla

export const numAdd = (num1: number | string = 0, num2: number | string = 0): number => {
	let numNum1 = Number(num1);
	let numNum2 = Number(num2);
	let baseNum: number;
	let baseNum1: number;
	let baseNum2: number;

	if (isNaN(numNum1)) {
		console.warn(`[util.numAdd]: num1 must be a number or a number string, but the value of num1 is`, num1);
		numNum1 = 0;
	}

	if (isNaN(numNum2)) {
		console.warn(`[util.numAdd]: num2 must be a number or a number string, but the value of num2 is`, num2);
		numNum2 = 0;
	}

	try {
		baseNum1 = num1.toString().split('.')[1].length;
	} catch (e) {
		baseNum1 = 0;
	}
	try {
		baseNum2 = num2.toString().split('.')[1].length;
	} catch (e) {
		baseNum2 = 0;
	}
	baseNum = Math.pow(10, Math.max(baseNum1, baseNum2));
	return Math.round((numNum1 + numNum2) * baseNum) / baseNum;
};

export const numMultiply = (num1: number, num2: number): number => {
	let baseNum: number;
	let baseNum1: number;
	let baseNum2: number;
	try {
		baseNum1 = num1.toString().split('.')[1].length;
	} catch (e) {
		baseNum1 = 0;
	}
	try {
		baseNum2 = num2.toString().split('.')[1].length;
	} catch (e) {
		baseNum2 = 0;
	}
	baseNum = Math.pow(10, Math.max(baseNum1, baseNum2));
	const newNum1 = Math.round(num1 * baseNum);
	const newNum2 = Math.round(num2 * baseNum);
	return (newNum1 * newNum2) / baseNum / baseNum;
};

export const floorDecimal = (num: number, idx: number) => {
	const numStr = num.toString();
	const pointIndex = numStr.indexOf('.');
	const result = numStr.substr(0, pointIndex + idx + 1);
	return pointIndex > 0 ? Number(result) : num;
};
