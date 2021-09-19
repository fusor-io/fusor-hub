import moment from 'moment';

/**
 * @return string in HTTP format, ex. Wed, 21 Oct 2015 07:28:00 GMT
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Last-Modified
 */
export function dateToHttpFormat(date: number): string {
  return moment(date)
    .utc()
    .format('ddd, DD MMM YYYY HH:mm:ss [GMT]');
}

export function dateFromHttpFormat(date: string): number {
  return moment(date).valueOf();
}
