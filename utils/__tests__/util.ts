const util = require('../util');
describe('util ', () => {
	test('getYesterdayOfTargetDay', () => {
		const todayMorning = '2019/10/03 11:00:000Z';
		const todayAfternoon = '2019/10/03 17:00:000Z';
		expect(util.getYesterdayOfTargetDay(new Date(todayMorning).getTime()).toUTCString()).toEqual(
			'Thu, 03 Oct 2019 03:59:59 GMT',
		);
		expect(util.getYesterdayOfTargetDay(new Date(todayAfternoon).getTime()).toUTCString()).toEqual(
			'Thu, 03 Oct 2019 03:59:59 GMT',
		);
	});
});
