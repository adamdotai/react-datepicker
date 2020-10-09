import classnames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { withDateUtils } from './withDateUtils';

class Day extends React.Component {
    static propTypes = {
        ariaLabelPrefixWhenEnabled: PropTypes.string,
        ariaLabelPrefixWhenDisabled: PropTypes.string,
        disabledKeyboardNavigation: PropTypes.bool,
        day: PropTypes.instanceOf(Date).isRequired,
        dayClassName: PropTypes.func,
        endDate: PropTypes.instanceOf(Date),
        highlightDates: PropTypes.instanceOf(Map),
        month: PropTypes.number,
        onClick: PropTypes.func,
        onMouseEnter: PropTypes.func,
        preSelection: PropTypes.instanceOf(Date),
        selected: PropTypes.object,
        selectingDate: PropTypes.instanceOf(Date),
        selectsEnd: PropTypes.bool,
        selectsStart: PropTypes.bool,
        selectsRange: PropTypes.bool,
        startDate: PropTypes.instanceOf(Date),
        renderDayContents: PropTypes.func,
        handleOnKeyDown: PropTypes.func,
        containerRef: PropTypes.oneOfType([
            PropTypes.func,
            PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
        ]),
        dateUtils: PropTypes.any,
    };

    componentDidMount() {
        this.handleFocusDay();
    }

    componentDidUpdate(prevProps) {
        this.handleFocusDay(prevProps);
    }

    dayEl = React.createRef();

    handleClick = (event) => {
        if (!this.isDisabled() && this.props.onClick) {
            this.props.onClick(event);
        }
    };

    handleMouseEnter = (event) => {
        if (!this.isDisabled() && this.props.onMouseEnter) {
            this.props.onMouseEnter(event);
        }
    };

    handleOnKeyDown = (event) => {
        const eventKey = event.key;
        if (eventKey === ' ') {
            event.preventDefault();
            event.key = 'Enter';
        }

        this.props.handleOnKeyDown(event);
    };

    isSameDay = (other) =>
        this.props.dateUtils.isSameDay(this.props.day, other);

    isKeyboardSelected = () =>
        !this.props.disabledKeyboardNavigation &&
        !this.isSameDay(this.props.selected) &&
        this.isSameDay(this.props.preSelection);

    isDisabled = () =>
        this.props.dateUtils.isDayDisabled(this.props.day, this.props);

    isExcluded = () =>
        this.props.dateUtils.isDayExcluded(this.props.day, this.props);

    getHighLightedClass = (defaultClassName) => {
        const { day, highlightDates } = this.props;

        if (!highlightDates) {
            return false;
        }

        // Looking for className in the Map of {'day string, 'className'}
        const dayStr = this.props.dateUtils.formatDate(day, 'MM.dd.yyyy');
        return highlightDates.get(dayStr);
    };

    isInRange = () => {
        const { day, startDate, endDate } = this.props;
        if (!startDate || !endDate) {
            return false;
        }
        return this.props.dateUtils.isDayInRange(day, startDate, endDate);
    };

    isInSelectingRange = () => {
        const {
            day,
            selectsStart,
            selectsEnd,
            selectsRange,
            selectingDate,
            startDate,
            endDate,
        } = this.props;
        if (
            !(selectsStart || selectsEnd || selectsRange) ||
            !selectingDate ||
            this.isDisabled()
        ) {
            return false;
        }

        if (
            selectsStart &&
            endDate &&
            (this.props.dateUtils.isBefore(selectingDate, endDate) ||
                this.props.dateUtils.isEqual(selectingDate, endDate))
        ) {
            return this.props.dateUtils.isDayInRange(
                day,
                selectingDate,
                endDate
            );
        }

        if (
            selectsEnd &&
            startDate &&
            (this.props.dateUtils.isAfter(selectingDate, startDate) ||
                this.props.dateUtils.isEqual(selectingDate, startDate))
        ) {
            return this.props.dateUtils.isDayInRange(
                day,
                startDate,
                selectingDate
            );
        }

        if (
            selectsRange &&
            startDate &&
            !endDate &&
            (this.props.dateUtils.isAfter(selectingDate, startDate) ||
                this.props.dateUtils.isEqual(selectingDate, startDate))
        ) {
            return this.props.dateUtils.isDayInRange(
                day,
                startDate,
                selectingDate
            );
        }

        return false;
    };

    isSelectingRangeStart = () => {
        if (!this.isInSelectingRange()) {
            return false;
        }

        const { day, selectingDate, startDate, selectsStart } = this.props;

        if (selectsStart) {
            return this.props.dateUtils.isSameDay(day, selectingDate);
        } else {
            return this.props.dateUtils.isSameDay(day, startDate);
        }
    };

    isSelectingRangeEnd = () => {
        if (!this.isInSelectingRange()) {
            return false;
        }

        const { day, selectingDate, endDate, selectsEnd } = this.props;

        if (selectsEnd) {
            return this.props.dateUtils.isSameDay(day, selectingDate);
        } else {
            return this.props.dateUtils.isSameDay(day, endDate);
        }
    };

    isRangeStart = () => {
        const { day, startDate, endDate } = this.props;
        if (!startDate || !endDate) {
            return false;
        }
        return this.props.dateUtils.isSameDay(startDate, day);
    };

    isRangeEnd = () => {
        const { day, startDate, endDate } = this.props;
        if (!startDate || !endDate) {
            return false;
        }
        return this.props.dateUtils.isSameDay(endDate, day);
    };

    isWeekend = () => {
        const weekday = this.props.dateUtils.getDay(this.props.day);
        return weekday === 0 || weekday === 6;
    };

    isOutsideMonth = () => {
        return (
            this.props.month !== undefined &&
            this.props.month !== this.props.dateUtils.getMonth(this.props.day)
        );
    };

    getClassNames = (date) => {
        const dayClassName = this.props.dayClassName
            ? this.props.dayClassName(date)
            : undefined;
        return classnames(
            'react-datepicker__day',
            dayClassName,
            'react-datepicker__day--' +
                this.props.dateUtils.getDayOfWeekCode(this.props.day),
            {
                'react-datepicker__day--disabled': this.isDisabled(),
                'react-datepicker__day--excluded': this.isExcluded(),
                'react-datepicker__day--selected': this.isSameDay(
                    this.props.selected
                ),
                'react-datepicker__day--keyboard-selected': this.isKeyboardSelected(),
                'react-datepicker__day--range-start': this.isRangeStart(),
                'react-datepicker__day--range-end': this.isRangeEnd(),
                'react-datepicker__day--in-range': this.isInRange(),
                'react-datepicker__day--in-selecting-range': this.isInSelectingRange(),
                'react-datepicker__day--selecting-range-start': this.isSelectingRangeStart(),
                'react-datepicker__day--selecting-range-end': this.isSelectingRangeEnd(),
                'react-datepicker__day--today': this.isSameDay(
                    this.props.dateUtils.date()
                ),
                'react-datepicker__day--weekend': this.isWeekend(),
                'react-datepicker__day--outside-month': this.isOutsideMonth(),
            },
            this.getHighLightedClass('react-datepicker__day--highlighted')
        );
    };

    getAriaLabel = () => {
        const {
            day,
            ariaLabelPrefixWhenEnabled = 'Choose',
            ariaLabelPrefixWhenDisabled = 'Not available',
        } = this.props;

        const prefix =
            this.isDisabled() || this.isExcluded()
                ? ariaLabelPrefixWhenDisabled
                : ariaLabelPrefixWhenEnabled;

        return `${prefix} ${this.props.dateUtils.formatDate(day, 'PPPP')}`;
    };

    getTabIndex = (selected, preSelection) => {
        const selectedDay = selected || this.props.selected;
        const preSelectionDay = preSelection || this.props.preSelection;

        const tabIndex =
            this.isKeyboardSelected() ||
            (this.isSameDay(selectedDay) &&
                this.props.dateUtils.isSameDay(preSelectionDay, selectedDay))
                ? 0
                : -1;

        return tabIndex;
    };

    // various cases when we need to apply focus to the preselected day
    // focus the day on mount/update so that keyboard navigation works while cycling through months with up or down keys (not for prev and next month buttons)
    // prevent focus for these activeElement cases so we don't pull focus from the input as the calendar opens
    handleFocusDay = (prevProps = {}) => {
        let shouldFocusDay = false;
        // only do this while the input isn't focused
        // otherwise, typing/backspacing the date manually may steal focus away from the input
        if (
            this.getTabIndex() === 0 &&
            !prevProps.isInputFocused &&
            this.isSameDay(this.props.preSelection)
        ) {
            // there is currently no activeElement
            if (
                !document.activeElement ||
                document.activeElement === document.body
            ) {
                shouldFocusDay = true;
            }
            // the activeElement is in the container, and it is another instance of Day
            if (
                this.props.containerRef &&
                this.props.containerRef.current &&
                this.props.containerRef.current.contains(
                    document.activeElement
                ) &&
                document.activeElement.classList.contains(
                    'react-datepicker__day'
                )
            ) {
                shouldFocusDay = true;
            }
        }

        shouldFocusDay && this.dayEl.current.focus({ preventScroll: true });
    };
    render = () => (
        <div
            ref={this.dayEl}
            className={this.getClassNames(this.props.day)}
            onKeyDown={this.handleOnKeyDown}
            onClick={this.handleClick}
            onMouseEnter={this.handleMouseEnter}
            tabIndex={this.getTabIndex()}
            aria-label={this.getAriaLabel()}
            role="button"
            aria-disabled={this.isDisabled()}
        >
            {this.props.renderDayContents
                ? this.props.renderDayContents(
                      this.props.dateUtils.getDate(this.props.day),
                      this.props.day
                  )
                : this.props.dateUtils.getDate(this.props.day)}
        </div>
    );
}

export default withDateUtils(Day);
