import { NextPageContext, NextComponentType } from 'next';
import React from 'react';
import App, { Container } from 'next/app';
import Head from 'next/head';
import { ParsedUrlQuery } from 'querystring';

// Related components
import GlobalStyle from '~/components/common/GlobalStyle';
import PageLayout from '~/components/common/layout/PageLayout';
import withApollo from '~/components/withApollo';
import withUserInfo from '~/components/withUserInfo';
import NotificationCenter from '~/components/common/Notication';

// Context
import { IntlProvider } from '~/components/context/IntlContext';

// Utils
import cookieUtil from '~/utils/cookieUtil';
import { ECookieName } from '~/utils/enum';
import config from '~/config/config';

interface IAppProps {
	Component: NextComponentType;
	ctx: NextPageContext;
}

interface IMyAppProps {
	query: ParsedUrlQuery;
	pathname: string;
	lang: string;
}

const checkLangValid = (lang: string) => {
	return config.langs.indexOf(lang) > -1;
};

class MyApp extends App<IMyAppProps, IAppProps> {
	static async getInitialProps({ Component, ctx }: IAppProps) {
		let initProps = {};
		if (Component.getInitialProps) {
			initProps = await Component.getInitialProps(ctx);
		}
		const pageProps = {};
		// 從 query string 或 cookie 取得 lang，以 query string 為主
		const { lang: queryLang }: any = ctx.query;
		let cookieLang = cookieUtil.get(ECookieName.LANG, ctx);
		cookieLang = checkLangValid(cookieLang) ? cookieLang : '';
		const lang = queryLang || cookieLang || 'zh-cn';
		cookieUtil.set(ECookieName.LANG, lang, undefined, ctx);
		return {
			...initProps,
			pageProps,
			query: ctx.query,
			pathname: ctx.pathname,
			lang,
		};
	}

	render() {
		const { Component, pageProps, query, lang = 'zh-cn' } = this.props;

		// FIXME: turned off SSR for now
		return (global as any).document ? (
			<IntlProvider lang={lang}>
				<Container>
					<Head>
						<meta
							name="viewport"
							content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover"
						/>
						<link
							rel="stylesheet"
							href="https://unpkg.com/react-datetime@2.16.3/css/react-datetime.css"
							type="text/css"
						/>
						<link rel="icon" href="/static/favicon.ico" type="image/x-icon" />
						<title>TitanX Agent</title>
					</Head>
					<GlobalStyle />
					<PageLayout>
						<Component {...pageProps} query={query} lang={lang} />
					</PageLayout>
				</Container>
				<NotificationCenter
					alignment={{
						horizontal: 'right',
						vertical: 'bottom',
						// vertical: this.state.isMobileWidth ? 'bottom' : 'bottom',   如果以後有需要區分通知跳的位置
					}}
					isMobile={false}
				/>
			</IntlProvider>
		) : (
			<></>
		);
	}
}

export default withApollo(withUserInfo(MyApp));
