import longFormatters from './utils/longFormatters';
import toInteger from './utils/utils';

export const DEFAULT_YEAR_ITEM_NUMBER = 12;
const MILLISECONDS_IN_DAY = 86400000;
const MILLISECONDS_IN_MINUTE = 60000;
const MILLISECONDS_IN_WEEK = 604800000;

// This RegExp catches symbols escaped by quotes, and also
// sequences of symbols P, p, and the combinations like `PPPPPPPppppp`
var longFormattingTokensRegExp = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;

// ** Date Constructors **

export function parseDate(adapter, value, dateFormat, locale, strictParsing) {
    let parsedDate = null;
    let localeObject = getLocaleObject(locale) || getDefaultLocale();
    let strictParsingValueMatch = true;
    if (Array.isArray(dateFormat)) {
        dateFormat.forEach((df) => {
            let tryParseDate = adapter.parse(value, df, new Date(), {
                locale: localeObject,
            });
            if (strictParsing) {
                strictParsingValueMatch =
                    adapter.isValid(tryParseDate) &&
                    value ===
                        adapter.format(tryParseDate, df, {
                            awareOfUnicodeTokens: true,
                        });
            }
            if (adapter.isValid(tryParseDate) && strictParsingValueMatch) {
                parsedDate = tryParseDate;
            }
        });
        return parsedDate;
    }

    parsedDate = adapter.parse(value, dateFormat, new Date(), {
        locale: localeObject,
    });

    if (strictParsing) {
        strictParsingValueMatch =
            adapter.isValid(parsedDate) &&
            value ===
                adapter.format(parsedDate, dateFormat, {
                    awareOfUnicodeTokens: true,
                });
    } else if (!adapter.isValid(parsedDate)) {
        dateFormat = dateFormat
            .match(longFormattingTokensRegExp)
            .map(function (substring) {
                var firstCharacter = substring[0];
                if (firstCharacter === 'p' || firstCharacter === 'P') {
                    var longFormatter = longFormatters[firstCharacter];
                    return localeObject
                        ? longFormatter(substring, localeObject.formatLong)
                        : firstCharacter;
                }
                return substring;
            })
            .join('');

        if (value.length > 0) {
            parsedDate = adapter.parse(
                value,
                dateFormat.slice(0, value.length),
                new Date()
            );
        }

        if (!adapter.isValid(parsedDate)) {
            parsedDate = new Date(value);
        }
    }

    return adapter.isValid(parsedDate) && strictParsingValueMatch
        ? parsedDate
        : null;
}

// ** Date "Reflection" **

export function isValid(adapter, date) {
    return (
        adapter.isValid(date) && isAfter(adapter, date, new Date('1/1/1000'))
    );
}

// ** Date Formatting **

export function formatDate(adapter, date, formatStr, locale) {
    if (locale === 'en') {
        return adapter.formatByString(adapter.date(date), formatStr, {
            awareOfUnicodeTokens: true,
        });
    }
    let localeObj = getLocaleObject(locale);
    if (locale && !localeObj) {
        /* console.warn(
            `A locale object was not found for the provided string ["${locale}"].`
        ); */
    }
    if (
        !localeObj &&
        !!getDefaultLocale() &&
        !!getLocaleObject(getDefaultLocale())
    ) {
        localeObj = getLocaleObject(getDefaultLocale());
    }
    return adapter.formatByString(adapter.date(date), formatStr, {
        locale: localeObj ? localeObj : null,
        awareOfUnicodeTokens: true,
    });
}

export function safeDateFormat(adapter, date, { dateFormat, locale }) {
    return (
        (date &&
            formatDate(
                adapter,
                date,
                Array.isArray(dateFormat) ? dateFormat[0] : dateFormat,
                (locale: locale)
            )) ||
        ''
    );
}

// ** Date Setters **

export function setTime(adapter, date, { hour = 0, minute = 0, second = 0 }) {
    return adapter.setHours(
        adapter.setMinutes(adapter.setSeconds(date, second), minute),
        hour
    );
}

// ** Date Getters **

export function getWeek(adapter, dirtyDate, locale) {
    var date = adapter.date(dirtyDate);
    let localeObj =
        (locale && getLocaleObject(locale)) ||
        (getDefaultLocale() && getLocaleObject(getDefaultLocale()));
    const options = localeObj ? { locale: localeObj } : null;
    var diff =
        getTime(adapter, getStartOfWeek(adapter, date, options)) -
        getTime(adapter, startOfWeekYear(adapter, date, options));

    // Round the number of days to the nearest integer
    // because the number of milliseconds in a week is not constant
    // (e.g. it's different in the week of the daylight saving time clock shift)
    return Math.round(diff / MILLISECONDS_IN_WEEK) + 1;
}

export function getDayOfWeekCode(adapter, day, locale) {
    return formatDate(adapter, day, 'ddd', (locale: locale));
}

// *** Start of ***

export function getStartOfDay(adapter, date) {
    return adapter.startOfDay(adapter.date(date));
}

export function getStartOfWeek(adapter, date, locale) {
    let localeObj = locale
        ? getLocaleObject(locale)
        : getLocaleObject(getDefaultLocale());
    return adapter.startOfWeek(adapter.date(date), { locale: localeObj });
}

export function getStartOfMonth(adapter, date) {
    return adapter.startOfMonth(adapter.date(date));
}

export function getStartOfYear(adapter, dirtyDate) {
    var cleanDate = adapter.date(dirtyDate);
    var date = new Date(0);
    date.setFullYear(adapter.getYear(cleanDate), 0, 1);
    date.setHours(0, 0, 0, 0);
    return date;
}

export function getStartOfQuarter(adapter, date) {
    return startOfQuarter(adapter, date);
}

export function getStartOfToday(adapter) {
    return getStartOfDay(adapter, adapter.date());
}

export function isSameYear(adapter, date1, date2) {
    if (date1 && date2) {
        return (
            adapter.getYear(adapter.date(date1)) ===
            adapter.getYear(adapter.date(date2))
        );
    } else {
        return !date1 && !date2;
    }
}

export function isSameMonth(adapter, date1, date2) {
    if (date1 && date2) {
        return (
            adapter.getMonth(adapter.date(date1)) ===
            adapter.getMonth(adapter.date(date2))
        );
    } else {
        return !date1 && !date2;
    }
}

export function startOfQuarter(adapter, dirtyDate) {
    var date = adapter.date(dirtyDate);
    var currentMonth = date.getMonth();
    var month = currentMonth - (currentMonth % 3);
    date.setMonth(month, 1);
    date.setHours(0, 0, 0, 0);
    return date;
}

export function isSameQuarter(adapter, date1, date2) {
    var dateLeftStartOfQuarter = startOfQuarter(adapter, date1);
    var dateRightStartOfQuarter = startOfQuarter(adapter, date2);

    return (
        getTime(adapter, dateLeftStartOfQuarter) ===
        getTime(adapter, dateRightStartOfQuarter)
    );
}

export function isSameDay(adapter, date1, date2) {
    if (date1 && date2) {
        return adapter.isSameDay(adapter.date(date1), adapter.date(date2));
    } else {
        return !date1 && !date2;
    }
}

export function isEqual(adapter, date1, date2) {
    if (date1 && date2) {
        return adapter.isEqual(adapter.date(date1), adapter.date(date2));
    } else {
        return !date1 && !date2;
    }
}

export function isDayInRange(adapter, day, startDate, endDate) {
    let valid;
    const start = getStartOfDay(adapter, startDate);
    const end = adapter.endOfDay(endDate);

    try {
        valid = adapter.isWithinRange(day, { start, end });
    } catch (err) {
        valid = false;
    }
    return valid;
}

// *** Diffing ***

// use differenceInCalendarDays
export function getDaysDiff(adapter, date1, date2) {
    return differenceInCalendarDays(adapter, date1, date2);
}

// ** Date Localization **

export function registerLocale(localeName, localeData) {
    const scope = typeof window !== 'undefined' ? window : global;

    if (!scope.__localeData__) {
        scope.__localeData__ = {};
    }
    scope.__localeData__[localeName] = localeData;
}

export function setDefaultLocale(localeName) {
    const scope = typeof window !== 'undefined' ? window : global;

    scope.__localeId__ = localeName;
}

export function getDefaultLocale() {
    const scope = typeof window !== 'undefined' ? window : global;

    return scope.__localeId__;
}

export function getLocaleObject(localeSpec) {
    if (typeof localeSpec === 'string') {
        // Treat it as a locale name registered by registerLocale
        const scope = typeof window !== 'undefined' ? window : global;
        return scope.__localeData__ ? scope.__localeData__[localeSpec] : null;
    } else {
        // Treat it as a raw date-fns locale object
        return localeSpec;
    }
}

export function getFormattedWeekdayInLocale(adapter, date, formatFunc, locale) {
    return formatFunc(
        formatDate(adapter, date, adapter.formats.weekday, locale)
    );
}

export function getWeekdayMinInLocale(adapter, date, locale) {
    return formatDate(adapter, date, adapter.formats.weekdayShort, locale);
}

export function getWeekdayShortInLocale(adapter, date, locale) {
    return formatDate(adapter, date, adapter.formats.weekdayShort, locale);
}

export function getMonthInLocale(adapter, month, locale) {
    return formatDate(
        adapter,
        adapter.setMonth(adapter.date(), month),
        'LLLL',
        locale
    );
}

export function getMonthShortInLocale(adapter, month, locale) {
    return formatDate(
        adapter,
        adapter.setMonth(adapter.date(), month),
        'LLL',
        locale
    );
}

export function getQuarterShortInLocale(adapter, quarter, locale) {
    return formatDate(
        adapter,
        setQuarter(adapter, newDate(), quarter),
        'QQQ',
        locale
    );
}

// ** Utils for some components **

export function isDayDisabled(
    adapter,
    day,
    { minDate, maxDate, excludeDates, includeDates, filterDate } = {}
) {
    return (
        isOutOfBounds(adapter, day, { minDate, maxDate }) ||
        (excludeDates &&
            excludeDates.some((excludeDate) =>
                adapter.isSameDay(day, excludeDate)
            )) ||
        (includeDates &&
            !includeDates.some((includeDate) =>
                adapter.isSameDay(day, includeDate)
            )) ||
        (filterDate && !filterDate(adapter.date(day))) ||
        false
    );
}

export function isDayExcluded(adapter, day, { excludeDates } = {}) {
    return (
        (excludeDates &&
            excludeDates.some((excludeDate) =>
                adapter.isSameDay(adapter, day, excludeDate)
            )) ||
        false
    );
}

export function isMonthDisabled(
    adapter,
    month,
    { minDate, maxDate, excludeDates, includeDates, filterDate } = {}
) {
    return (
        isOutOfBounds(adapter, month, { minDate, maxDate }) ||
        (excludeDates &&
            excludeDates.some((excludeDate) =>
                adapter.isSameMonth(month, excludeDate)
            )) ||
        (includeDates &&
            !includeDates.some((includeDate) =>
                adapter.isSameMonth(month, includeDate)
            )) ||
        (filterDate && !filterDate(adapter.date(month))) ||
        false
    );
}

export function isMonthinRange(
    { getYear, getMonth },
    startDate,
    endDate,
    m,
    day
) {
    const startDateYear = getYear(startDate);
    const startDateMonth = getMonth(startDate);
    const endDateYear = getYear(endDate);
    const endDateMonth = getMonth(endDate);
    const dayYear = getYear(day);
    if (startDateYear === endDateYear && startDateYear === dayYear) {
        return startDateMonth <= m && m <= endDateMonth;
    } else if (startDateYear < endDateYear) {
        return (
            (dayYear === startDateYear && startDateMonth <= m) ||
            (dayYear === endDateYear && endDateMonth >= m) ||
            (dayYear < endDateYear && dayYear > startDateYear)
        );
    }
}

export function isQuarterDisabled(
    adapter,
    quarter,
    { minDate, maxDate, excludeDates, includeDates, filterDate } = {}
) {
    return (
        isOutOfBounds(adapter, quarter, { minDate, maxDate }) ||
        (excludeDates &&
            excludeDates.some((excludeDate) =>
                isSameQuarter(adapter, quarter, excludeDate)
            )) ||
        (includeDates &&
            !includeDates.some((includeDate) =>
                isSameQuarter(adapter, quarter, includeDate)
            )) ||
        (filterDate && !filterDate(adapter.date(quarter))) ||
        false
    );
}

export function isYearDisabled(adapter, year, { minDate, maxDate } = {}) {
    const date = new Date(year, 0, 1);
    return isOutOfBounds(adapter, date, { minDate, maxDate }) || false;
}

export function isQuarterInRange(adapter, startDate, endDate, q, day) {
    const startDateYear = adapter.getYear(startDate);
    const startDateQuarter = getQuarter(adapter, startDate);
    const endDateYear = adapter.getYear(endDate);
    const endDateQuarter = getQuarter(adapter, endDate);
    const dayYear = adapter.getYear(day);
    if (startDateYear === endDateYear && startDateYear === dayYear) {
        return startDateQuarter <= q && q <= endDateQuarter;
    } else if (startDateYear < endDateYear) {
        return (
            (dayYear === startDateYear && startDateQuarter <= q) ||
            (dayYear === endDateYear && endDateQuarter >= q) ||
            (dayYear < endDateYear && dayYear > startDateYear)
        );
    }
}

export function isOutOfBounds(adapter, day, { minDate, maxDate } = {}) {
    return (
        (minDate && differenceInCalendarDays(adapter, day, minDate) < 0) ||
        (maxDate && differenceInCalendarDays(adapter, day, maxDate) > 0)
    );
}

export function isTimeDisabled(adapter, time, disabledTimes) {
    const l = disabledTimes.length;
    for (let i = 0; i < l; i++) {
        if (
            getHours(adapter, disabledTimes[i]) === getHours(adapter, time) &&
            adapter.getMinutes(disabledTimes[i]) === adapter.getMinutes(time)
        ) {
            return true;
        }
    }

    return false;
}

export function isTimeInDisabledRange(adapter, time, { minTime, maxTime }) {
    if (!minTime || !maxTime) {
        throw new Error('Both minTime and maxTime props required');
    }
    const base = adapter.date();
    const baseTime = adapter.setHours(
        adapter.setMinutes(base, adapter.getMinutes(time)),
        getHours(adapter, time)
    );
    const min = adapter.setHours(
        adapter.setMinutes(base, adapter.getMinutes(minTime)),
        getHours(adapter, minTime)
    );
    const max = adapter.setHours(
        adapter.setMinutes(base, adapter.getMinutes(maxTime)),
        getHours(adapter, maxTime)
    );

    let valid;
    try {
        valid = !adapter.isWithinRange(baseTime, { start: min, end: max });
    } catch (err) {
        valid = false;
    }
    return valid;
}

export function monthDisabledBefore(
    adapter,
    day,
    { minDate, includeDates } = {}
) {
    const previousMonth = addMonths(adapter, day, -1);
    return (
        (minDate &&
            differenceInCalendarMonths(adapter, minDate, previousMonth) > 0) ||
        (includeDates &&
            includeDates.every(
                (includeDate) =>
                    differenceInCalendarMonths(
                        adapter,
                        includeDate,
                        previousMonth
                    ) > 0
            )) ||
        false
    );
}

export function monthDisabledAfter(
    adapter,
    day,
    { maxDate, includeDates } = {}
) {
    const nextMonth = addMonths(adapter, day, 1);
    return (
        (maxDate &&
            differenceInCalendarMonths(adapter, nextMonth, maxDate) > 0) ||
        (includeDates &&
            includeDates.every(
                (includeDate) =>
                    differenceInCalendarMonths(
                        adapter,
                        nextMonth,
                        includeDate
                    ) > 0
            )) ||
        false
    );
}

export function yearDisabledBefore(
    adapter,
    day,
    { minDate, includeDates } = {}
) {
    const previousYear = addMonths(adapter, day, -12);
    return (
        (minDate &&
            differenceInCalendarYears(adapter, minDate, previousYear) > 0) ||
        (includeDates &&
            includeDates.every(
                (includeDate) =>
                    differenceInCalendarYears(
                        adapter,
                        includeDate,
                        previousYear
                    ) > 0
            )) ||
        false
    );
}

export function yearsDisabledBefore(
    adapter,
    day,
    { minDate, yearItemNumber = DEFAULT_YEAR_ITEM_NUMBER } = {}
) {
    const previousYear = startOfYear(
        adapter,
        addMonths(adapter, day, yearItemNumber * -12)
    );
    const { endPeriod } = getYearsPeriod(adapter, previousYear, yearItemNumber);
    const minDateYear = minDate && adapter.getYear(minDate);
    return (minDateYear && minDateYear > endPeriod) || false;
}

export function yearDisabledAfter(
    adapter,
    day,
    { maxDate, includeDates } = {}
) {
    const nextYear = addMonths(adapter, day, 12);
    return (
        (maxDate &&
            differenceInCalendarYears(adapter, nextYear, maxDate) > 0) ||
        (includeDates &&
            includeDates.every(
                (includeDate) =>
                    differenceInCalendarYears(adapter, nextYear, includeDate) >
                    0
            )) ||
        false
    );
}

export function yearsDisabledAfter(
    adapter,
    day,
    { maxDate, yearItemNumber = DEFAULT_YEAR_ITEM_NUMBER } = {}
) {
    const nextYear = addMonths(adapter, day, yearItemNumber * 12);
    const { startPeriod } = getYearsPeriod(adapter, nextYear, yearItemNumber);
    const maxDateYear = maxDate && adapter.getYear(maxDate);
    return (maxDateYear && maxDateYear < startPeriod) || false;
}

export function getEffectiveMinDate(adapter, { minDate, includeDates }) {
    if (includeDates && minDate) {
        let minDates = includeDates.filter(
            (includeDate) =>
                differenceInCalendarDays(adapter, includeDate, minDate) >= 0
        );
        return min(adapter, minDates);
    } else if (includeDates) {
        return min(adapter, includeDates);
    } else {
        return minDate;
    }
}

export function getEffectiveMaxDate(adapter, { maxDate, includeDates }) {
    if (includeDates && maxDate) {
        let maxDates = includeDates.filter(
            (includeDate) =>
                differenceInCalendarDays(adapter, includeDate, maxDate) <= 0
        );
        return max(adapter, maxDates);
    } else if (includeDates) {
        return max(adapter, includeDates);
    } else {
        return maxDate;
    }
}

export function getHightLightDaysMap(adapter, highlightDates) {
    highlightDates = highlightDates || [];
    const defaultClassName = 'react-datepicker__day--highlighted';
    const dateClasses = new Map();
    for (let i = 0, len = highlightDates.length; i < len; i++) {
        const obj = highlightDates[i];
        if (isDate(adapter, obj)) {
            const key = formatDate(adapter, obj, 'MM.dd.yyyy');
            const classNamesArr = dateClasses.get(key) || [];
            if (!classNamesArr.includes(defaultClassName)) {
                classNamesArr.push(defaultClassName);
                dateClasses.set(key, classNamesArr);
            }
        } else if (typeof obj === 'object') {
            const keys = Object.keys(obj);
            const className = keys[0];
            const arrOfDates = obj[keys[0]];
            if (
                typeof className === 'string' &&
                arrOfDates.constructor === Array
            ) {
                for (let k = 0, len = arrOfDates.length; k < len; k++) {
                    const key = formatDate(
                        adapter,
                        arrOfDates[k],
                        'MM.dd.yyyy'
                    );
                    const classNamesArr = dateClasses.get(key) || [];
                    if (!classNamesArr.includes(className)) {
                        classNamesArr.push(className);
                        dateClasses.set(key, classNamesArr);
                    }
                }
            }
        }
    }

    return dateClasses;
}

export function timesToInjectAfter(
    adapter,
    startOfDay,
    currentTime,
    currentMultiplier,
    intervals,
    injectedTimes
) {
    const l = injectedTimes.length;
    const times = [];
    for (let i = 0; i < l; i++) {
        const injectedTime = adapter.addMinutes(
            adapter.addHours(startOfDay, getHours(adapter, injectedTimes[i])),
            adapter.getMinutes(injectedTimes[i])
        );
        const nextTime = adapter.addMinutes(
            startOfDay,
            (currentMultiplier + 1) * intervals
        );

        if (
            isAfter(adapter, injectedTime, currentTime) &&
            isBefore(adapter, injectedTime, nextTime)
        ) {
            times.push(injectedTimes[i]);
        }
    }

    return times;
}

export function addZero(_, i) {
    return i < 10 ? `0${i}` : `${i}`;
}

export function getYearsPeriod(
    adapter,
    date,
    yearItemNumber = DEFAULT_YEAR_ITEM_NUMBER
) {
    const endPeriod =
        Math.ceil(adapter.getYear(date) / yearItemNumber) * yearItemNumber;
    const startPeriod = endPeriod - (yearItemNumber - 1);
    return { startPeriod, endPeriod };
}

export function max(adapter, datesArray) {
    var result;
    datesArray.forEach(function (dirtyDate) {
        var currentDate = adapter.date(dirtyDate);

        if (
            result === undefined ||
            result < currentDate ||
            isNaN(currentDate)
        ) {
            result = currentDate;
        }
    });
    return result || new Date(NaN);
}

export function min(adapter, datesArray) {
    var result;
    datesArray.forEach(function (dirtyDate) {
        var currentDate = adapter.date(dirtyDate);

        if (
            result === undefined ||
            result > currentDate ||
            isNaN(currentDate)
        ) {
            result = currentDate;
        }
    });
    return result || new Date(NaN);
}

export function differenceInCalendarDays(
    adapter,
    dirtyDateLeft,
    dirtyDateRight
) {
    var startOfDayLeft = getStartOfDay(adapter, dirtyDateLeft);
    var startOfDayRight = getStartOfDay(adapter, dirtyDateRight);

    var timestampLeft =
        getTime(adapter, startOfDayLeft) -
        getTimezoneOffsetInMilliseconds(adapter, startOfDayLeft);
    var timestampRight =
        getTime(adapter, startOfDayRight) -
        getTimezoneOffsetInMilliseconds(adapter, startOfDayRight);

    // Round the number of days to the nearest integer
    // because the number of milliseconds in a day is not constant
    // (e.g. it's different in the day of the daylight saving time clock shift)
    return Math.round((timestampLeft - timestampRight) / MILLISECONDS_IN_DAY);
}

function getDateMillisecondsPart(adapter, date) {
    return getTime(adapter, date) % MILLISECONDS_IN_MINUTE;
}

function getTimezoneOffsetInMilliseconds(adapter, dirtyDate) {
    var date = new Date(getTime(adapter, dirtyDate));
    var baseTimezoneOffset = Math.ceil(date.getTimezoneOffset());
    date.setSeconds(0, 0);
    var hasNegativeUTCOffset = baseTimezoneOffset > 0;
    var millisecondsPartOfTimezoneOffset = hasNegativeUTCOffset
        ? (MILLISECONDS_IN_MINUTE + getDateMillisecondsPart(adapter, date)) %
          MILLISECONDS_IN_MINUTE
        : getDateMillisecondsPart(adapter, date);

    return (
        baseTimezoneOffset * MILLISECONDS_IN_MINUTE +
        millisecondsPartOfTimezoneOffset
    );
}

export function differenceInCalendarMonths(
    adapter,
    dirtyDateLeft,
    dirtyDateRight
) {
    var dateLeft = adapter.date(dirtyDateLeft);
    var dateRight = adapter.date(dirtyDateRight);

    var yearDiff = adapter.getYear(dateLeft) - adapter.getYear(dateRight);
    var monthDiff = dateLeft.getMonth() - dateRight.getMonth();

    return yearDiff * 12 + monthDiff;
}

export function differenceInCalendarYears(
    adapter,
    dirtyDateLeft,
    dirtyDateRight
) {
    var dateLeft = adapter.date(dirtyDateLeft);
    var dateRight = adapter.date(dirtyDateRight);

    return adapter.getYear(dateLeft) - adapter.getYear(dateRight);
}

export function getDay(adapter, dirtyDate) {
    var date = adapter.date(dirtyDate);
    var day = date.getDay?.() || date.day?.();
    return day;
}

export function getDate(adapter, dirtyDate) {
    var date = adapter.date(dirtyDate);
    return formatDate(adapter, date, adapter.formats.dayOfMonth);
}

export function getTime(adapter, dirtyDate) {
    var date = adapter.date(dirtyDate);
    // TODO: refactor once date-io adds getTime
    var timestamp = date.getTime?.() || date.unix?.();
    return timestamp;
}

export function isDate(_, value) {
    return (
        value instanceof Date ||
        (typeof value === 'object' &&
            Object.prototype.toString.call(value) === '[object Date]')
    );
}

export function setQuarter(adapter, dirtyDate, dirtyQuarter) {
    var date = adapter.date(dirtyDate);
    var quarter = toInteger(dirtyQuarter);
    var oldQuarter = Math.floor(date.getMonth() / 3) + 1;
    var diff = quarter - oldQuarter;
    return adapter.setMonth(date, date.getMonth() + diff * 3);
}

export function getQuarter(adapter, dirtyDate) {
    var date = adapter.date(dirtyDate);
    var quarter = Math.floor(date.getMonth() / 3) + 1;
    return quarter;
}

export function startOfWeekYear(adapter, dirtyDate, dirtyOptions) {
    var options = dirtyOptions || {};
    var locale = options.locale;
    var localeFirstWeekContainsDate =
        locale && locale.options && locale.options.firstWeekContainsDate;
    var defaultFirstWeekContainsDate =
        localeFirstWeekContainsDate == null
            ? 1
            : toInteger(localeFirstWeekContainsDate);
    var firstWeekContainsDate =
        options.firstWeekContainsDate == null
            ? defaultFirstWeekContainsDate
            : toInteger(options.firstWeekContainsDate);

    var year = getWeekYear(adapter, dirtyDate, dirtyOptions);
    var firstWeek = new Date(0);
    firstWeek.setFullYear(year, 0, firstWeekContainsDate);
    firstWeek.setHours(0, 0, 0, 0);
    var date = getStartOfWeek(adapter, firstWeek, dirtyOptions);
    return date;
}

function getWeekYear(adapter, dirtyDate, dirtyOptions) {
    var date = adapter.date(dirtyDate);
    var year = adapter.getYear(date);

    var options = dirtyOptions || {};
    var locale = options.locale;
    var localeFirstWeekContainsDate =
        locale && locale.options && locale.options.firstWeekContainsDate;
    var defaultFirstWeekContainsDate =
        localeFirstWeekContainsDate == null
            ? 1
            : toInteger(localeFirstWeekContainsDate);
    var firstWeekContainsDate =
        options.firstWeekContainsDate == null
            ? defaultFirstWeekContainsDate
            : toInteger(options.firstWeekContainsDate);

    // Test if weekStartsOn is between 1 and 7 _and_ is not NaN
    if (!(firstWeekContainsDate >= 1 && firstWeekContainsDate <= 7)) {
        throw new RangeError(
            'firstWeekContainsDate must be between 1 and 7 inclusively'
        );
    }

    var firstWeekOfNextYear = new Date(0);
    firstWeekOfNextYear.setFullYear(year + 1, 0, firstWeekContainsDate);
    firstWeekOfNextYear.setHours(0, 0, 0, 0);
    var startOfNextYear = getStartOfWeek(
        adapter,
        firstWeekOfNextYear,
        dirtyOptions
    );

    var firstWeekOfThisYear = new Date(0);
    firstWeekOfThisYear.setFullYear(year, 0, firstWeekContainsDate);
    firstWeekOfThisYear.setHours(0, 0, 0, 0);
    var startOfThisYear = getStartOfWeek(
        adapter,
        firstWeekOfThisYear,
        dirtyOptions
    );

    if (getTime(adapter, date) >= getTime(adapter, startOfNextYear)) {
        return year + 1;
    } else if (getTime(adapter, date) >= getTime(adapter, startOfNextYear)) {
        return year;
    } else {
        return year - 1;
    }
}

export function addMonths(adapter, date, value) {
    return adapter.addMonths(adapter.date(date), value);
}

export function addWeeks(adapter, date, value) {
    return adapter.addWeeks(adapter.date(date), value);
}

export function addDays(adapter, date, value) {
    return adapter.addDays(adapter.date(date), value);
}

export function addHours(adapter, date, value) {
    return adapter.addHours(adapter.date(date), value);
}

export function addMinutes(adapter, date, value) {
    return adapter.addMinutes(adapter.date(date), value);
}

export function addSeconds(adapter, date, value) {
    return adapter.addSeconds(adapter.date(date), value);
}

export function isBefore(adapter, date, value) {
    return adapter.isBefore(adapter.date(date), value);
}

export function isAfter(adapter, date, value) {
    return adapter.isAfter(adapter.date(date), value);
}

export function getHours(adapter, date) {
    return adapter.getHours(adapter.date(date));
}

export function getMinutes(adapter, date) {
    return adapter.getMinutes(adapter.date(date));
}

export function getSeconds(adapter, date) {
    return adapter.getSeconds(adapter.date(date));
}
