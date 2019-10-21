import React, { createContext, useState } from 'react';
import { format, addHours } from 'date-fns';
// TODO: use dynamic import
import zh_cn from 'date-fns/locale/zh_cn';
import en_us from 'date-fns/locale/en';
import cookieUtil from '~/utils/cookieUtil';
import { ECookieName } from '~/utils/enum';

// TODO: add number formatters
interface IIntlStore {
	// dictionary
	dict: typeof enUS;
	// format from date-fns with predefined locale
	formatDate: (date: Date | string | number, formatString?: string) => string;
	setTimeZone: (timezone: number) => void;
}

const initStore: IIntlStore = {
	dict: {} as any,
	formatDate() {
		console.error('[formatDate] did not connect to the context');
		return '';
	},
	setTimeZone() {
		console.error('[setTimeZone] did not connect to the context');
		return '';
	},
};

export const IntlContext = createContext<IIntlStore>(initStore);

const { Provider, Consumer } = IntlContext;

// Mocks
import { enUS, zhCN } from '~/mocks/lang';

interface IIntlProviderProps {
	lang: string;
}

const defaultTimeZone = (new Date().getTimezoneOffset() / 60) * -1;
export const IntlProvider: React.FC<IIntlProviderProps> = props => {
	const { lang } = props;
	const [timezone, setTimeZone] = useState(defaultTimeZone);
	let dict: typeof enUS;
	let locale = zh_cn;
	switch (lang) {
		case 'en-us':
			dict = enUS;
			locale = en_us;
			break;
		case 'zh-cn':
			dict = zhCN;
			locale = zh_cn;
			break;
		default:
			console.warn('[IntlProvider]: did not get expected lang code. Use "zh-cn" by default.');
			dict = zhCN;
			locale = zh_cn;
	}

	const formatDate = (date: Date | string | number, formatString?: string) => {
		const browserTimezone = new Date().getTimezoneOffset() / 60;
		const timeOffset = timezone + browserTimezone;
		return format(addHours(date, timeOffset), formatString, { locale });
	};

	const store = {
		dict,
		formatDate,
		setTimeZone,
	};

	return <Provider value={store}>{props.children}</Provider>;
};

export const IntlConsumer = Consumer;
