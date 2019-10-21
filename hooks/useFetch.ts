import { useState, useReducer, useEffect, Reducer, Dispatch, SetStateAction } from 'react';

type State =
	| { loading: true; error: null; data?: any }
	| { loading: false; error: null; data: any }
	| { loading: false; error: Error; data?: any };

type Action = { type: 'LOADING' } | { type: 'SUCCESS'; payload: any } | { type: 'FAILURE'; payload: Error };

const reducer: Reducer<State, Action> = (prevState, action) => {
	switch (action.type) {
		case 'LOADING':
			return {
				...prevState,
				loading: true,
				error: null,
			};
		case 'SUCCESS':
			return {
				...prevState,
				loading: false,
				error: null,
				// 只有成功時會更新 data
				data: action.payload,
			};
		case 'FAILURE':
			return {
				...prevState,
				loading: false,
				error: action.payload,
			};
		default:
			throw new Error(`[useFetch] error when fetching data`);
	}
};

const useFetch = (
	initialUrl: string,
	fetchOptions?: RequestInit,
	initialData?: any,
): [State, Dispatch<SetStateAction<string>>] => {
	const [url, setURL] = useState(initialUrl);

	const [state, dispatch] = useReducer(reducer, {
		loading: false,
		error: null,
		data: initialData,
	});

	useEffect(() => {
		let isCanceled = false;

		const fetchData = async () => {
			dispatch({ type: 'LOADING' });

			try {
				const response = await fetch(url, fetchOptions);
				// just returns a string, parse JSON manually if needed
				const data = await response.text();
				if (!isCanceled) {
					dispatch({ type: 'SUCCESS', payload: data });
				}
			} catch (err) {
				if (!isCanceled) {
					dispatch({ type: 'FAILURE', payload: err });
				}
			}
		};
		fetchData();

		// 當 url 更新時，dispatch 'SUCCESS' 與 dispatch 'FAILURE' 都不會執行
		return () => {
			isCanceled = true;
		};
	}, [url]);

	return [state, setURL];
};

export default useFetch;
