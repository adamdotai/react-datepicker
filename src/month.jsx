import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Week from './week';
import { withDateUtils } from './withDateUtils';

const FIXED_HEIGHT_STANDARD_WEEK_COUNT = 6;

class Month extends React.Component {
    static propTypes = {
        ariaLabelPrefix: PropTypes.string,
        chooseDayAriaLabelPrefix: PropTypes.string,
        disabledDayAriaLabelPrefix: PropTypes.string,
        disabledKeyboardNavigation: PropTypes.bool,
        day: PropTypes.instanceOf(Date).isRequired,
        dayClassName: PropTypes.func,
        monthClassName: PropTypes.func,
        endDate: PropTypes.instanceOf(Date),
        orderInDisplay: PropTypes.number,
        excludeDates: PropTypes.array,
        filterDate: PropTypes.func,
        fixedHeight: PropTypes.bool,
        formatWeekNumber: PropTypes.func,
        highlightDates: PropTypes.instanceOf(Map),
        includeDates: PropTypes.array,
        locale: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.shape({ locale: PropTypes.object }),
        ]),
        maxDate: PropTypes.instanceOf(Date),
        minDate: PropTypes.instanceOf(Date),
        onDayClick: PropTypes.func,
        onDayMouseEnter: PropTypes.func,
        onMouseLeave: PropTypes.func,
        onWeekSelect: PropTypes.func,
        peekNextMonth: PropTypes.bool,
        preSelection: PropTypes.instanceOf(Date),
        setPreSelection: PropTypes.func,
        selected: PropTypes.instanceOf(Date),
        selectingDate: PropTypes.instanceOf(Date),
        selectsEnd: PropTypes.bool,
        selectsStart: PropTypes.bool,
        selectsRange: PropTypes.bool,
        showWeekNumbers: PropTypes.bool,
        startDate: PropTypes.instanceOf(Date),
        setOpen: PropTypes.func,
        shouldCloseOnSelect: PropTypes.bool,
        renderDayContents: PropTypes.func,
        showMonthYearPicker: PropTypes.bool,
        showFullMonthYearPicker: PropTypes.bool,
        showTwoColumnMonthYearPicker: PropTypes.bool,
        showQuarterYearPicker: PropTypes.bool,
        handleOnKeyDown: PropTypes.func,
        isInputFocused: PropTypes.bool,
        weekAriaLabelPrefix: PropTypes.string,
        containerRef: PropTypes.oneOfType([
            PropTypes.func,
            PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
        ]),
        dateUtils: PropTypes.any,
    };

    MONTH_REFS = Array(12)
        .fill()
        .map(() => React.createRef());

    isDisabled = (date) => this.props.dateUtils.isDayDisabled(date, this.props);

    isExcluded = (date) => this.props.dateUtils.isDayExcluded(date, this.props);

    handleDayClick = (day, event) => {
        if (this.props.onDayClick) {
            this.props.onDayClick(day, event, this.props.orderInDisplay);
        }
    };

    handleDayMouseEnter = (day) => {
        if (this.props.onDayMouseEnter) {
            this.props.onDayMouseEnter(day);
        }
    };

    handleMouseLeave = () => {
        if (this.props.onMouseLeave) {
            this.props.onMouseLeave();
        }
    };

    isRangeStartMonth = (m) => {
        const { day, startDate, endDate } = this.props;
        if (!startDate || !endDate) {
            return false;
        }
        return this.props.dateUtils.isSameMonth(
            this.props.dateUtils.setMonth(day, m),
            startDate
        );
    };

    isRangeStartQuarter = (q) => {
        const { day, startDate, endDate } = this.props;
        if (!startDate || !endDate) {
            return false;
        }
        return this.props.dateUtils.isSameQuarter(
            this.props.dateUtils.setQuarter(day, q),
            startDate
        );
    };

    isRangeEndMonth = (m) => {
        const { day, startDate, endDate } = this.props;
        if (!startDate || !endDate) {
            return false;
        }
        return this.props.dateUtils.isSameMonth(
            this.props.dateUtils.setMonth(day, m),
            endDate
        );
    };

    isRangeEndQuarter = (q) => {
        const { day, startDate, endDate } = this.props;
        if (!startDate || !endDate) {
            return false;
        }
        return this.props.dateUtils.isSameQuarter(
            this.props.dateUtils.setQuarter(day, q),
            endDate
        );
    };

    isWeekInMonth = (startOfWeek) => {
        const day = this.props.day;
        const endOfWeek = this.props.dateUtils.addDays(startOfWeek, 6);

        return (
            this.props.dateUtils.isSameMonth(startOfWeek, day) ||
            this.props.dateUtils.isSameMonth(endOfWeek, day)
        );
    };

    renderWeeks = () => {
        const weeks = [];
        var isFixedHeight = this.props.fixedHeight;
        let currentWeekStart = this.props.dateUtils.getStartOfWeek(
            this.props.dateUtils.getStartOfMonth(this.props.day),
            this.props.locale
        );
        let i = 0;
        let breakAfterNextPush = false;

        while (true) {
            weeks.push(
                <Week
                    ariaLabelPrefix={this.props.weekAriaLabelPrefix}
                    chooseDayAriaLabelPrefix={
                        this.props.chooseDayAriaLabelPrefix
                    }
                    disabledDayAriaLabelPrefix={
                        this.props.disabledDayAriaLabelPrefix
                    }
                    key={i}
                    day={currentWeekStart}
                    month={this.props.dateUtils.getMonth(this.props.day)}
                    onDayClick={this.handleDayClick}
                    onDayMouseEnter={this.handleDayMouseEnter}
                    onWeekSelect={this.props.onWeekSelect}
                    formatWeekNumber={this.props.formatWeekNumber}
                    locale={this.props.locale}
                    minDate={this.props.minDate}
                    maxDate={this.props.maxDate}
                    excludeDates={this.props.excludeDates}
                    includeDates={this.props.includeDates}
                    highlightDates={this.props.highlightDates}
                    selectingDate={this.props.selectingDate}
                    filterDate={this.props.filterDate}
                    preSelection={this.props.preSelection}
                    selected={this.props.selected}
                    selectsStart={this.props.selectsStart}
                    selectsEnd={this.props.selectsEnd}
                    selectsRange={this.props.selectsRange}
                    showWeekNumber={this.props.showWeekNumbers}
                    startDate={this.props.startDate}
                    endDate={this.props.endDate}
                    dayClassName={this.props.dayClassName}
                    setOpen={this.props.setOpen}
                    shouldCloseOnSelect={this.props.shouldCloseOnSelect}
                    disabledKeyboardNavigation={
                        this.props.disabledKeyboardNavigation
                    }
                    renderDayContents={this.props.renderDayContents}
                    handleOnKeyDown={this.props.handleOnKeyDown}
                    isInputFocused={this.props.isInputFocused}
                    containerRef={this.props.containerRef}
                />
            );

            if (breakAfterNextPush) break;

            i++;
            currentWeekStart = this.props.dateUtils.addWeeks(
                currentWeekStart,
                1
            );

            // If one of these conditions is true, we will either break on this week
            // or break on the next week
            const isFixedAndFinalWeek =
                isFixedHeight && i >= FIXED_HEIGHT_STANDARD_WEEK_COUNT;
            const isNonFixedAndOutOfMonth =
                !isFixedHeight && !this.isWeekInMonth(currentWeekStart);

            if (isFixedAndFinalWeek || isNonFixedAndOutOfMonth) {
                if (this.props.peekNextMonth) {
                    breakAfterNextPush = true;
                } else {
                    break;
                }
            }
        }

        return weeks;
    };

    onMonthClick = (e, m) => {
        this.handleDayClick(
            this.props.dateUtils.startOfMonth(
                this.props.dateUtils.setMonth(this.props.day, m)
            ),
            e
        );
    };

    handleMonthNavigation = (newMonth, newDate) => {
        if (this.isDisabled(newDate) || this.isExcluded(newDate)) return;
        this.props.setPreSelection(newDate);
        this.MONTH_REFS[newMonth].current &&
            this.MONTH_REFS[newMonth].current.focus();
    };

    onMonthKeyDown = (event, month) => {
        const eventKey = event.key;
        if (!this.props.disabledKeyboardNavigation) {
            switch (eventKey) {
                case 'Enter':
                    this.onMonthClick(event, month);
                    this.props.setPreSelection(this.props.selected);
                    break;
                case 'ArrowRight':
                    this.handleMonthNavigation(
                        month === 11 ? 0 : month + 1,
                        this.props.dateUtils.addMonths(
                            this.props.preSelection,
                            1
                        )
                    );
                    break;
                case 'ArrowLeft':
                    this.handleMonthNavigation(
                        month === 0 ? 11 : month - 1,
                        this.props.dateUtils.addMonths(
                            this.props.preSelection,
                            -1
                        )
                    );
                    break;
            }
        }
    };

    onQuarterClick = (e, q) => {
        this.handleDayClick(
            this.props.dateUtils.getStartOfQuarter(
                this.props.dateUtils.setQuarter(this.props.day, q)
            ),
            e
        );
    };

    getMonthClassNames = (m) => {
        const {
            day,
            startDate,
            endDate,
            selected,
            minDate,
            maxDate,
            preSelection,
        } = this.props;
        return classnames(
            'react-datepicker__month-text',
            `react-datepicker__month-${m}`,
            {
                'react-datepicker__month--disabled':
                    (minDate || maxDate) &&
                    this.props.dateUtils.isMonthDisabled(
                        this.props.dateUtils.setMonth(day, m),
                        this.props
                    ),
                'react-datepicker__month--selected':
                    this.props.dateUtils.getMonth(day) === m &&
                    this.props.dateUtils.getYear(day) ===
                        this.props.dateUtils.getYear(selected),
                'react-datepicker__month-text--keyboard-selected':
                    this.props.dateUtils.getMonth(preSelection) === m,
                'react-datepicker__month--in-range': this.props.dateUtils.isMonthinRange(
                    startDate,
                    endDate,
                    m,
                    day
                ),
                'react-datepicker__month--range-start': this.isRangeStartMonth(
                    m
                ),
                'react-datepicker__month--range-end': this.isRangeEndMonth(m),
            }
        );
    };

    getTabIndex = (m) => {
        const preSelectedMonth = this.props.dateUtils.getMonth(
            this.props.preSelection
        );
        const tabIndex =
            !this.props.disabledKeyboardNavigation && m === preSelectedMonth
                ? '0'
                : '-1';

        return tabIndex;
    };

    getAriaLabel = (month) => {
        const {
            ariaLabelPrefix = 'Choose',
            disabledDayAriaLabelPrefix = 'Not available',
            day,
        } = this.props;

        const labelDate = this.props.dateUtils.setMonth(day, month);
        const prefix =
            this.isDisabled(labelDate) || this.isExcluded(labelDate)
                ? disabledDayAriaLabelPrefix
                : ariaLabelPrefix;

        return `${prefix} ${this.props.dateUtils.formatDate(
            labelDate,
            'MMMM yyyy'
        )}`;
    };

    getQuarterClassNames = (q) => {
        const {
            day,
            startDate,
            endDate,
            selected,
            minDate,
            maxDate,
        } = this.props;
        return classnames(
            'react-datepicker__quarter-text',
            `react-datepicker__quarter-${q}`,
            {
                'react-datepicker__quarter--disabled':
                    (minDate || maxDate) &&
                    this.props.dateUtils.isQuarterDisabled(
                        this.props.dateUtils.setQuarter(day, q),
                        this.props
                    ),
                'react-datepicker__quarter--selected':
                    this.props.dateUtils.getQuarter(day) === q &&
                    this.props.dateUtils.getYear(day) ===
                        this.props.dateUtils.getYear(selected),
                'react-datepicker__quarter--in-range': this.props.dateUtils.isQuarterInRange(
                    startDate,
                    endDate,
                    q,
                    day
                ),
                'react-datepicker__quarter--range-start': this.isRangeStartQuarter(
                    q
                ),
                'react-datepicker__quarter--range-end': this.isRangeEndQuarter(
                    q
                ),
            }
        );
    };

    renderMonths = () => {
        const {
            showFullMonthYearPicker,
            showTwoColumnMonthYearPicker,
            locale,
        } = this.props;
        const monthsThreeColumns = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [9, 10, 11],
        ];
        const monthsTwoColumns = [
            [0, 1],
            [2, 3],
            [4, 5],
            [6, 7],
            [8, 9],
            [10, 11],
        ];
        const monthLayout = showTwoColumnMonthYearPicker
            ? monthsTwoColumns
            : monthsThreeColumns;
        return monthLayout.map((month, i) => (
            <div className="react-datepicker__month-wrapper" key={i}>
                {month.map((m, j) => (
                    <div
                        ref={this.MONTH_REFS[m]}
                        key={j}
                        onClick={(ev) => {
                            this.onMonthClick(ev, m);
                        }}
                        onKeyDown={(ev) => {
                            this.onMonthKeyDown(ev, m);
                        }}
                        tabIndex={this.getTabIndex(m)}
                        className={this.getMonthClassNames(m)}
                        role="button"
                        aria-label={this.getAriaLabel(m)}
                    >
                        {showFullMonthYearPicker
                            ? this.props.dateUtils.getMonthInLocale(m, locale)
                            : this.props.dateUtils.getMonthShortInLocale(
                                  m,
                                  locale
                              )}
                    </div>
                ))}
            </div>
        ));
    };

    renderQuarters = () => {
        const quarters = [1, 2, 3, 4];
        return (
            <div className="react-datepicker__quarter-wrapper">
                {quarters.map((q, j) => (
                    <div
                        key={j}
                        onClick={(ev) => {
                            this.onQuarterClick(ev, q);
                        }}
                        className={this.getQuarterClassNames(q)}
                    >
                        {this.props.dateUtils.getQuarterShortInLocale(
                            q,
                            this.props.locale
                        )}
                    </div>
                ))}
            </div>
        );
    };

    getClassNames = () => {
        const {
            day,
            selectingDate,
            selectsStart,
            selectsEnd,
            showMonthYearPicker,
            showQuarterYearPicker,
            monthClassName,
        } = this.props;
        const _monthClassName = monthClassName
            ? monthClassName(day)
            : undefined;

        return classnames(
            'react-datepicker__month',
            _monthClassName,
            {
                'react-datepicker__month--selecting-range':
                    selectingDate && (selectsStart || selectsEnd),
            },
            { 'react-datepicker__monthPicker': showMonthYearPicker },
            { 'react-datepicker__quarterPicker': showQuarterYearPicker }
        );
    };

    render() {
        const {
            showMonthYearPicker,
            showQuarterYearPicker,
            day,
            ariaLabelPrefix = 'month ',
        } = this.props;
        return (
            <div
                className={this.getClassNames()}
                onMouseLeave={this.handleMouseLeave}
                aria-label={`${ariaLabelPrefix} ${this.props.dateUtils.formatDate(
                    day,
                    'yyyy-MM'
                )}`}
            >
                {showMonthYearPicker
                    ? this.renderMonths()
                    : showQuarterYearPicker
                    ? this.renderQuarters()
                    : this.renderWeeks()}
            </div>
        );
    }
}

export default withDateUtils(Month);
