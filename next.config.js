const { ENV_STAGE, SERVICE_NAME } = process.env;
const serviceName = ENV_STAGE && SERVICE_NAME.toLowerCase().replace('-web', '');
module.exports = {
	publicRuntimeConfig: {
		ENV_STAGE: ENV_STAGE === 'preprod' ? 'pre' : ENV_STAGE,
		SERVICE_NAME,
	},
};
