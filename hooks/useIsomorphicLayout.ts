import { useLayoutEffect as useReactLayoutEffect, useEffect } from 'react';

export const useLayoutEffect = (global as any).document ? useReactLayoutEffect : useEffect;
