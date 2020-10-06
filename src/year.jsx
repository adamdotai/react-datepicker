import classnames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { withDateUtils } from './withDateUtils';

class Year extends React.Component {
    static propTypes = {
        date: PropTypes.string,
        disabledKeyboardNavigation: PropTypes.bool,
        onDayClick: PropTypes.func,
        preSelection: PropTypes.instanceOf(Date),
        selected: PropTypes.object,
        inline: PropTypes.bool,
        maxDate: PropTypes.instanceOf(Date),
        minDate: PropTypes.instanceOf(Date),
        yearItemNumber: PropTypes.number,
        dateUtils: PropTypes.any,
    };

    constructor(props) {
        super(props);
    }

    handleYearClick = (day, event) => {
        if (this.props.onDayClick) {
            this.props.onDayClick(day, event);
        }
    };

    isSameDay = (y, other) => this.props.dateUtils.isSameDay(y, other);

    isKeyboardSelected = (y) => {
        const date = this.props.dateUtils.getStartOfYear(
            this.props.dateUtils.setYear(this.props.date, y)
        );
        return (
            !this.props.disabledKeyboardNavigation &&
            !this.props.inline &&
            !this.props.dateUtils.isSameDay(
                date,
                this.props.dateUtils.getStartOfYear(this.props.selected)
            ) &&
            this.props.dateUtils.isSameDay(
                date,
                this.props.dateUtils.getStartOfYear(this.props.preSelection)
            )
        );
    };

    onYearClick = (e, y) => {
        const { date } = this.props;
        this.handleYearClick(
            this.props.dateUtils.getStartOfYear(
                this.props.dateUtils.setYear(date, y)
            ),
            e
        );
    };

    getYearClassNames = (y) => {
        const { minDate, maxDate, selected } = this.props;
        return classnames('react-datepicker__year-text', {
            'react-datepicker__year-text--selected':
                y === this.props.dateUtils.getYear(selected),
            'react-datepicker__year-text--disabled':
                (minDate || maxDate) &&
                this.props.dateUtils.isYearDisabled(y, this.props),
            'react-datepicker__year-text--keyboard-selected': this.isKeyboardSelected(
                y
            ),
            'react-datepicker__year-text--today':
                y === this.props.dateUtils.getYear(this.props.dateUtils.date()),
        });
    };

    render() {
        const yearsList = [];
        const { date, yearItemNumber } = this.props;
        const { startPeriod, endPeriod } = this.props.dateUtils.getYearsPeriod(
            date,
            yearItemNumber
        );

        for (let y = startPeriod; y <= endPeriod; y++) {
            yearsList.push(
                <div
                    onClick={(ev) => {
                        this.onYearClick(ev, y);
                    }}
                    className={this.getYearClassNames(y)}
                    key={y}
                >
                    {y}
                </div>
            );
        }
        return (
            <div className="react-datepicker__year">
                <div className="react-datepicker__year-wrapper">
                    {yearsList}
                </div>
            </div>
        );
    }
}

export default withDateUtils(Year);
