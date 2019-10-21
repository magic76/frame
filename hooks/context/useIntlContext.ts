import { useContext } from 'react';
import { IntlContext } from '~/components/context/IntlContext';

const useIntlContext = () => {
	return useContext(IntlContext);
};

export default useIntlContext;
