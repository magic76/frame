import { useState, useEffect } from 'react';

// Hooks
import useFetch from '~/hooks/useFetch';

const useMock = () => {
	const [state] = useFetch('/api/mock');
	return state;
};

export default useMock;
