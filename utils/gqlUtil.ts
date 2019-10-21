import { SelectionInfo, FancyInfo } from '~/graphql/__codegen__/schema';
import { initApolloClient } from '~/components/context/ApolloContext';

export const isSelectionInfo = (selection: any): selection is SelectionInfo => {
	return selection && selection.__typename === 'SelectionInfo';
};

export const isFancyInfo = (selection: any): selection is FancyInfo => {
	return selection && selection.__typename === 'FancyInfo';
};

/**
 * apollo 隨處call用（一定要帶上語系 e.q. en-us）
 * 若是要在server打且需判斷裝置，記得將ctx傳入，否則會判斷不到裝置
 *
 * @static
 * @param {*} gql
 * @param {any} ctx
 * @param {*} [args]
 * @returns {Promise<any>}
 * @memberof graphqlApiUtil
 */
export const query = async (gql: any, ctx: any, args?: any) => {
	try {
		const client: any = initApolloClient({
			memberId: ctx.memberId,
			lang: ctx.lang,
			username: ctx.username,
			token: '',
		});

		const mapObj = {
			query: 'query',
			mutation: 'mutate',
		};
		const queryParam: any = {
			query: gql,
			fetchPolicy: 'no-cache',
			errorPolicy: 'all',
		};
		const operation = gql.definitions[0].operation;
		queryParam[operation] = gql;

		if (args) {
			queryParam.variables = args;
		}
		const payload: any = await client[(mapObj as any)[operation]](queryParam);
		return payload;
	} catch (error) {
		console.log('[ERROR][graphqlApiUtil] ', error);
		return {};
	}
};
