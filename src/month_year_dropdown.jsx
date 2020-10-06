import PropTypes from 'prop-types';
import React from 'react';
import MonthYearDropdownOptions from './month_year_dropdown_options';
import { withDateUtils } from './withDateUtils';

class MonthYearDropdown extends React.Component {
    static propTypes = {
        dropdownMode: PropTypes.oneOf(['scroll', 'select']).isRequired,
        dateFormat: PropTypes.string.isRequired,
        locale: PropTypes.string,
        maxDate: PropTypes.instanceOf(Date).isRequired,
        minDate: PropTypes.instanceOf(Date).isRequired,
        date: PropTypes.instanceOf(Date).isRequired,
        onChange: PropTypes.func.isRequired,
        scrollableMonthYearDropdown: PropTypes.bool,
        dateUtils: PropTypes.any,
    };

    state = {
        dropdownVisible: false,
    };

    renderSelectOptions = () => {
        let currDate = this.props.dateUtils.startOfMonth(this.props.minDate);
        const lastDate = this.props.dateUtils.startOfMonth(this.props.maxDate);
        const options = [];

        while (!this.props.dateUtils.isAfter(currDate, lastDate)) {
            const timepoint = this.props.dateUtils.getTime(currDate);
            options.push(
                <option key={timepoint} value={timepoint}>
                    {this.props.dateUtils.formatDate(
                        currDate,
                        this.props.dateFormat,
                        this.props.locale
                    )}
                </option>
            );

            currDate = this.props.dateUtils.addMonths(currDate, 1);
        }

        return options;
    };

    onSelectChange = (e) => {
        this.onChange(e.target.value);
    };

    renderSelectMode = () => (
        <select
            value={this.props.dateUtils.getTime(
                this.props.dateUtils.startOfMonth(this.props.date)
            )}
            className="react-datepicker__month-year-select"
            onChange={this.onSelectChange}
        >
            {this.renderSelectOptions()}
        </select>
    );

    renderReadView = (visible) => {
        const yearMonth = this.props.dateUtils.formatDate(
            this.props.date,
            this.props.dateFormat,
            this.props.locale
        );

        return (
            <div
                key="read"
                style={{ visibility: visible ? 'visible' : 'hidden' }}
                className="react-datepicker__month-year-read-view"
                onClick={(event) => this.toggleDropdown(event)}
            >
                <span className="react-datepicker__month-year-read-view--down-arrow" />
                <span className="react-datepicker__month-year-read-view--selected-month-year">
                    {yearMonth}
                </span>
            </div>
        );
    };

    renderDropdown = () => (
        <MonthYearDropdownOptions
            key="dropdown"
            date={this.props.date}
            dateFormat={this.props.dateFormat}
            onChange={this.onChange}
            onCancel={this.toggleDropdown}
            minDate={this.props.minDate}
            maxDate={this.props.maxDate}
            scrollableMonthYearDropdown={this.props.scrollableMonthYearDropdown}
        />
    );

    renderScrollMode = () => {
        const { dropdownVisible } = this.state;
        let result = [this.renderReadView(!dropdownVisible)];
        if (dropdownVisible) {
            result.unshift(this.renderDropdown());
        }
        return result;
    };

    onChange = (monthYearPoint) => {
        this.toggleDropdown();

        const changedDate = this.props.dateUtils.date(parseInt(monthYearPoint));

        if (
            this.props.dateUtils.isSameYear(this.props.date, changedDate) &&
            this.props.dateUtils.isSameMonth(this.props.date, changedDate)
        ) {
            return;
        }

        this.props.onChange(changedDate);
    };

    toggleDropdown = () =>
        this.setState({
            dropdownVisible: !this.state.dropdownVisible,
        });

    render() {
        let renderedDropdown;
        switch (this.props.dropdownMode) {
            case 'scroll':
                renderedDropdown = this.renderScrollMode();
                break;
            case 'select':
                renderedDropdown = this.renderSelectMode();
                break;
        }

        return (
            <div
                className={`react-datepicker__month-year-dropdown-container react-datepicker__month-year-dropdown-container--${this.props.dropdownMode}`}
            >
                {renderedDropdown}
            </div>
        );
    }
}

export default withDateUtils(MonthYearDropdown);
