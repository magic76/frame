module.exports = {
	client: {
		service: {
			name: 'x-gql',
			localSchemaFile: './graphql/__codegen__/schema.json',
		},
		includes: ['./graphql/*.ts'],
	},
};
