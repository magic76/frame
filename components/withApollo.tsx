import Head from 'next/head';
import React from 'react';
import { ApolloXProvider, initApolloClient } from '~/components/context/ApolloContext';
import { renderToString } from 'react-dom/server';
import { getMarkupFromTree } from 'react-apollo-hooks';

export default (App: any) => {
	return class Apollo extends React.Component {
		static displayName = 'withApollo(App)';
		apolloClient: any;
		constructor(props: any) {
			super(props);
			const { lang, userInfo }: any = this.props;
			this.apolloClient = initApolloClient(
				{
					lang,
					memberId: userInfo.memberId,
					username: userInfo.username,
					token: userInfo.token,
				},
				props.apolloState,
			);
		}
		static async getInitialProps(ctx: any): Promise<any> {
			const { Component, router }: any = ctx;
			const { AppTree } = ctx;
			let appProps: any;
			if (App.getInitialProps) {
				appProps = await App.getInitialProps(ctx);
			}

			// Run all GraphQL queries in the component tree
			// and extract the resulting data
			const { lang, userInfo } = appProps;
			const apollo = initApolloClient({
				lang,
				memberId: userInfo.memberId,
				username: userInfo.username,
				token: userInfo.token,
			});
			if (!(global as any).document) {
				try {
					// Run all GraphQL queries
					await getMarkupFromTree({
						renderFunction: renderToString,
						tree: getApolloHoc(AppTree, { ...appProps, ...ctx }, apollo, userInfo),
					});
				} catch (error) {
					// Prevent Apollo Client GraphQL errors from crashing SSR.
					// Handle them in components via the data.error prop:
					// https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-error
					console.error('Error while running `getDataFromTree`', error);
				}

				// getDataFromTree does not call componentWillUnmount
				// head side effect therefore need to be cleared manually
				Head.rewind();
			}

			// Extract query data from the Apollo store
			const apolloState = apollo.cache.extract();

			return {
				...appProps,
				apolloState,
			};
		}

		render(): JSX.Element {
			const { lang, userInfo, apolloState }: any = this.props;
			return getApolloHoc(App, this.props, this.apolloClient, userInfo);
		}
	};
};

const getApolloHoc = (App: any, props: any, client: any, apolloParam: any) => (
	<ApolloXProvider
		lang={apolloParam.lang}
		memberId={apolloParam.memberId}
		username={apolloParam.username}
		token={apolloParam.token}
		client={client}
	>
		<App {...props} />
	</ApolloXProvider>
);
