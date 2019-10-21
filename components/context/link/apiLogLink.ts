import { ApolloLink } from 'apollo-link';
import idx from 'idx';

import config from '~/config/config';
import * as util from '~/utils/util';

/**
 * graphql 每一個請求加上log紀錄
 * @param params
 */
export default ({ username }: { username: string | undefined }) =>
	new ApolloLink((operation, forward: any): any => {
		operation.setContext({ start: Date.now() });
		return forward(operation).map((data: any) => {
			const graphqlContext: any = operation.getContext();
			const { operationName, variables } = operation;
			if (config.isStartRecordMockData) {
				// mock data link
				const apiParam = {
					serviceName: 'GQL',
					logParam: {
						operationName,
						responseMilliSecond: Date.now() - graphqlContext.start,
						username: username || 'guest',
						cookie: util.isClient ? idx(global, (_: any) => _.document.cookie) : '',
						variables: variables ? JSON.stringify(variables) : '',
						request: operation.toKey(),
						response: JSON.stringify(data.data || data.errors || {}),
						source: util.isClient ? 'client' : 'server',
					},
				};
				setTimeout(() => {
					try {
						const serverHost: string = config.apiLocalHost;
						const clientHost = util.isClient
							? `${idx(global, (_: any) => _.location.origin)}/api/mock`
							: '';
						fetch(util.isClient ? clientHost : serverHost, {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json; charset=UTF-8',
							},
							body: JSON.stringify(apiParam),
						});
					} catch (e) {
						console.log(e);
					}
				}, 0);
			}
			return data;
		});
	});
