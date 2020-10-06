import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { withDateUtils } from './withDateUtils';
import onClickOutside from 'react-onclickoutside';

function generateMonthYears(dateUtils, minDate, maxDate) {
    const list = [];

    let currDate = dateUtils.startOfMonth(minDate);
    const lastDate = dateUtils.startOfMonth(maxDate);

    while (!dateUtils.isAfter(currDate, lastDate)) {
        list.push(dateUtils.date(currDate));

        currDate = dateUtils.addMonths(currDate, 1);
    }
    return list;
}

class MonthYearDropdownOptions extends React.Component {
    static propTypes = {
        minDate: PropTypes.instanceOf(Date).isRequired,
        maxDate: PropTypes.instanceOf(Date).isRequired,
        onCancel: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired,
        scrollableMonthYearDropdown: PropTypes.bool,
        date: PropTypes.instanceOf(Date).isRequired,
        dateFormat: PropTypes.string.isRequired,
        dateUtils: PropTypes.any,
    };

    constructor(props) {
        super(props);

        this.state = {
            monthYearsList: generateMonthYears(
                this.props.minDate,
                this.props.maxDate
            ),
        };
    }

    renderOptions = () => {
        return this.state.monthYearsList.map((monthYear) => {
            const monthYearPoint = this.props.dateUtils.getTime(monthYear);
            const isSameMonthYear =
                this.props.dateUtils.isSameYear(this.props.date, monthYear) &&
                this.props.dateUtils.isSameMonth(this.props.date, monthYear);

            return (
                <div
                    className={
                        isSameMonthYear
                            ? 'react-datepicker__month-year-option --selected_month-year'
                            : 'react-datepicker__month-year-option'
                    }
                    key={monthYearPoint}
                    onClick={this.onChange.bind(this, monthYearPoint)}
                >
                    {isSameMonthYear ? (
                        <span className="react-datepicker__month-year-option--selected">
                            ✓
                        </span>
                    ) : (
                        ''
                    )}
                    {this.props.dateUtils.formatDate(
                        monthYear,
                        this.props.dateFormat
                    )}
                </div>
            );
        });
    };

    onChange = (monthYear) => this.props.onChange(monthYear);

    handleClickOutside = () => {
        this.props.onCancel();
    };

    render() {
        let dropdownClass = classNames({
            'react-datepicker__month-year-dropdown': true,
            'react-datepicker__month-year-dropdown--scrollable': this.props
                .scrollableMonthYearDropdown,
        });

        return <div className={dropdownClass}>{this.renderOptions()}</div>;
    }
}

export default withDateUtils(onClickOutside(MonthYearDropdownOptions));
