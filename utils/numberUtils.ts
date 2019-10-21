export const validateNumber = (value: any): value is number | string => !isNaN(Number(value));

export const amountFormat = (maximumFractionDigits: number = 2, minimumFractionDigits: number = 2) => {
	return Intl.NumberFormat('en-us', {
		// 顯示 xxx,xx
		maximumFractionDigits,
		minimumFractionDigits,
	});
};

export const currencyFormat = Intl.NumberFormat('en-us', {
	// 顯示 xxx,xxx.xx
	maximumFractionDigits: 2,
	minimumFractionDigits: 2,
});
