import { css, InterpolationValue, FlattenInterpolation } from 'styled-components';

/*
    Mobile-first, use `min-width`
*/

export type Size = 'xxl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs';
export type Breakpoints = Record<Size, number>;
export type MQL = Record<Size, MediaQueryList>;
export type Media = Record<Size, string>;

export let breakpoints: Breakpoints = {
	xxl: 1600,
	xl: 1200,
	lg: 992,
	md: 768,
	sm: 576,
	xs: 320,
};

// MediaQueryLists
export const mql = (Object.entries(breakpoints) as [Size, number][]).reduce(
	(pv, [size, breakpoint]) => {
		pv[size] = (global as any).document
			? window.matchMedia(`screen and (max-width: ${breakpoint}px)`)
			: ({} as any);
		return pv;
	},
	{} as MQL,
);

const mediaQuery = (Object.entries(breakpoints) as [Size, number][]).reduce(
	(pv, [size, breakpoint]) => {
		pv[size] = `screen and (max-width: ${breakpoint}px)`;
		return pv;
	},
	{} as Media,
);

export default mediaQuery;
