import React, { useEffect, useRef } from 'react';

const useOnClickOutside = <T extends HTMLElement | null>(
	// wrapped in `useCallback` to prevent cleanup and improve performance
	handler: (e: Event) => void,
	shouldTriggerHandler: boolean = true,
) => {
	const ref = useRef<T>(null);
	useEffect(() => {
		const listener = (e: Event) => {
			if (ref.current && !ref.current.contains(e.target as Node) && shouldTriggerHandler) {
				handler(e);
			}
		};

		document.addEventListener('click', listener);
		document.addEventListener('touchend', listener);

		return () => {
			document.removeEventListener('click', listener);
			document.removeEventListener('touchend', listener);
		};
	}, [ref.current, handler]);
	return ref;
};

export default useOnClickOutside;
