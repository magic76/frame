import React from 'react';
import fetch from 'isomorphic-fetch';
import ApolloClient from 'apollo-client';
import { InMemoryCache, IntrospectionFragmentMatcher, defaultDataIdFromObject } from 'apollo-cache-inmemory';
import { ApolloLink, from, Observable, split } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { ApolloProvider } from '@apollo/react-hooks';
import { onError } from 'apollo-link-error';

import apiLogLink from '~/components/context/link/apiLogLink';

// Related
import result from '~/graphql/__codegen__/introspection-result';

import config from '~/config/config';
import { isClient } from '~/utils/util';
import cookieUtil from '~/utils/cookieUtil';
import { ECookieName } from '~/utils/enum';
const logout = () => {
	cookieUtil.remove(ECookieName.LANG);
	cookieUtil.remove(ECookieName.TOKEN);
	location.href = config.invalidPage;
};
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
	if (graphQLErrors) {
		graphQLErrors.map(({ message }: any) => {
			console.error(
				`${Date.now()} [GraphQL error]: operationName: ${operation.operationName}, Message: ${message}`,
			);
		});
	}
	if (networkError) {
		console.error(`${Date.now()} [Network error]: operationName: ${operation.operationName}, ${networkError}`);
		if ([401, 406].indexOf((networkError as any).statusCode) > -1 && config.isAuthCheck) {
			logout();
		}
	}
});

const customFetch = (uri: RequestInfo, options?: RequestInit) => {
	const { operationName } = options && typeof options.body === 'string' ? JSON.parse(options.body) : '';
	return fetch(`${uri}?${operationName}=1`, options);
};

const fragmentMatcher = new IntrospectionFragmentMatcher({
	introspectionQueryResultData: result,
});

interface IApolloClientParams {
	lang: string;
	memberId: number;
	username: string;
	token: string;
	client?: any;
}
let client: any = undefined;

export const initApolloClient = (params: IApolloClientParams, initialState?: any) => {
	const { lang, memberId, username, token } = params;

	// 覆用client
	if (client) {
		return client;
	}
	const httpLink = createHttpLink({
		uri: config.isUseMockData ? 'http://localhost:3000/mockApi' : config.gqlHost,
		fetch: customFetch,
		headers: {
			'x-language-code': lang,
			'x-authentication': token || '',
		},
	});
	const wsLink =
		isClient && memberId
			? new WebSocketLink({
					uri: config.wsHost,
					options: {
						reconnect: true,
						timeout: 5000,
						lazy: true,
						inactivityTimeout: 3000,
						connectionParams: {
							memberId,
						},
					},
			  })
			: new ApolloLink(() => {
					// server side斷開ws link
					return new Observable(observer => {
						observer.complete();
					});
			  });

	const splitLink = split(
		operation => {
			const definition = getMainDefinition(operation.query);
			return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
		},
		wsLink,
		from([errorLink, apiLogLink({ username }), httpLink]),
	);

	client = new ApolloClient({
		cache: new InMemoryCache({
			fragmentMatcher,
			freezeResults: true,
			dataIdFromObject: obj => {
				switch (obj.__typename) {
					case 'EventInfo':
						return `EVENT_${(obj as any).eventId}_${(obj as any).eventName}`;
					case 'MarketInfo':
						return `MARKET_${(obj as any).marketId}_${(obj as any).marketName}`;
					default:
						return defaultDataIdFromObject(obj);
				}
			},
		}).restore(initialState || {}),
		ssrMode: !isClient,
		link: splitLink,
		assumeImmutableResults: true,
		connectToDevTools: true,
	});
	return client;
};

interface IApolloXProviderProps extends IApolloClientParams {}

export const ApolloXProvider: React.FC<IApolloXProviderProps> = props => {
	const { lang, memberId, username, client: newClient, token } = props;
	const client = newClient || initApolloClient({ lang, memberId, username, token });
	return <ApolloProvider client={client}>{props.children}</ApolloProvider>;
};
