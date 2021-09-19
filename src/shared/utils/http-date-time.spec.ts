import { dateFromHttpFormat, dateToHttpFormat } from './http-date-time';

describe('http-date-time', () => {
  it('dateToHttpFormat', () => {
    expect(dateToHttpFormat(new Date('2001-02-03T04:05:06Z').getTime())).toEqual(
      'Sat, 03 Feb 2001 04:05:06 GMT',
    );
  });

  it('dateFromHttpFormat', () => {
    expect(dateFromHttpFormat('Sat, 03 Feb 2001 04:05:06 GMT')).toEqual(
      new Date('2001-02-03T04:05:06Z').getTime(),
    );
  });
});
