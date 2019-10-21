import React from 'react';
import idx from 'idx';

import config from '~/config/config';
import cookieUtil from '~/utils/cookieUtil';
import { query } from '~/utils/gqlUtil';
import { isClient } from '~/utils/util';
import { ECookieName } from '~/utils/enum';
import { UserInfo } from '~/components/context/UserInfoContext';

const getUserInfo = async (ctx: any, token: string) => {
	const { query: urlQuery = {}, lang } = ctx;
	const queryToken = urlQuery.p || token;
	const payload = {};

	const result = {};
	return { ...result, token: queryToken, returnUrl: urlQuery.returnUrl, lang };
};
const redirectPage = (context: any, path: string) => {
	return isClient ? (location.href = path) : context.res.redirect(path);
};

let __info__: any;
const withUserInfo: (Child: any) => React.ReactNode = (Child: any) =>
	class WithUserInfo extends React.Component<any, any> {
		constructor(props: any) {
			super(props);

			// SSR的時候，要將server side的資料暫放，切頁的時候就不用再打api取得userinfo
			isClient && props && (__info__ = props.payload);
		}
		static async getInitialProps(ctx: any = {}): Promise<any> {
			const childProps = Child.getInitialProps ? await Child.getInitialProps(ctx) : {};
			const context = ctx.ctx;
			const { query } = context;
			const token = query.p ? query.p : cookieUtil.get(ECookieName.TOKEN, ctx.ctx);
			let payload;
			if (isClient && __info__) {
				payload = __info__;
			} else {
				payload = await getUserInfo({ ...context, lang: childProps.lang }, token);
				payload.memberId && isClient && (__info__ = payload);
			}

			context.pathname !== config.invalidPage &&
				!idx(payload, _ => _.memberId) &&
				redirectPage(context, config.invalidPage);
			return { ...childProps, userInfo: payload, token };
		}

		render(): JSX.Element {
			const { query: urlQuery = {}, userInfo, token } = this.props;

			return (
				<UserInfo info={userInfo}>
					<Child {...this.props} {...this.state} />
				</UserInfo>
			);
		}
	};

export default withUserInfo;
