import React, { useState, createContext, useEffect } from 'react';
import { ECookieName } from '~/utils/enum';
import cookieUtil from '~/utils/cookieUtil';

interface IUserInfo {
	memberId: number;
	username: string;
	isSubAccount: boolean;
	orderLimit: {
		eventTypeId: number;
		minOrder: number;
		maxOrder: number;
		maxMarket: number;
	}[];
	exchangeRate: number;
	type: string;
	returnUrl: string;
	lang: string;
	token: string;
	isLogin: boolean;
}
let storeUserInfo: IUserInfo;

export const UserInfoContext = createContext<any>({ userInfo: { lang: 'zh-cn' } });
const { Provider, Consumer } = UserInfoContext;

export const UserInfo: React.FC<{ info: IUserInfo }> = props => {
	const { info } = props;
	const [userInfo, setUserInfo] = useState<IUserInfo>(
		info
			? {
					memberId: info.memberId,
					username: info.username,
					isSubAccount: info.isSubAccount,
					orderLimit: info.orderLimit,
					exchangeRate: info.exchangeRate,
					type: info.type,
					token: info.token,
					returnUrl: info.returnUrl,
					lang: info.lang,
					isLogin: !!info.username,
			  }
			: ({} as IUserInfo),
	);
	useEffect(() => {
		setUserInfo({ ...userInfo, ...info, isLogin: !!info.username });
	}, [info.lang]);
	userInfo && (storeUserInfo = userInfo);
	const store = {
		userInfo: storeUserInfo,
		setUserInfo,
		setCurrentLang: (lang: string) => {
			cookieUtil.set(ECookieName.LANG, lang, undefined);
			setUserInfo({ ...userInfo, lang });
		},
	};
	return <Provider value={store}>{props.children}</Provider>;
};
export const UserInfoConsumer = Consumer;
