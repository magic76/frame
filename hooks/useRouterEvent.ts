import React, { useEffect } from 'react';
import Router, { useRouter as useNextRouter } from 'next/router';
import useUserInfo from '~/hooks/context/useUserInfoContext';

type EventType =
	| 'routeChangeStart'
	| 'routeChangeComplete'
	| 'routeChangeError'
	| 'beforeHistoryChange'
	| 'hashChangeStart'
	| 'hashChangeComplete';
type Handler = (...evts: any[]) => void;

const useRouterEvent = (eventType: EventType, handler: Handler) => {
	useEffect(() => {
		Router.events.on(eventType, handler);
		return () => {
			Router.events.off(eventType, handler);
		};
	}, []);
};

export const useRouter = () => {
	const router = useNextRouter();
	const { userInfo } = useUserInfo();
	const push = (url: string, as: any) => {
		const targetPath =
			window.location === window.parent.location
				? url
				: `${url}${url.indexOf('?') > 0 ? '&' : '?'}p=${userInfo.token}`;
		router.push(targetPath, as);
	};
	return { ...router, push };
};

export default useRouterEvent;
