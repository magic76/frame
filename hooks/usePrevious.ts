import { useRef, useEffect } from 'react';

const usePrevious = <T>(value: T) => {
	const ref = useRef<T>();

	// runs after the render phase
	useEffect(() => {
		ref.current = value;
	}, [value]);

	return ref.current;
};

export default usePrevious;
