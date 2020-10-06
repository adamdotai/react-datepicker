import PropTypes from 'prop-types';
import React from 'react';
import { withDateUtils } from './withDateUtils';

class Time extends React.Component {
    static get defaultProps() {
        return {
            intervals: 30,
            onTimeChange: () => {},
            todayButton: null,
            timeCaption: 'Time',
        };
    }

    static calcCenterPosition = (listHeight, centerLiRef) => {
        return (
            centerLiRef.offsetTop -
            (listHeight / 2 - centerLiRef.clientHeight / 2)
        );
    };

    static propTypes = {
        format: PropTypes.string,
        includeTimes: PropTypes.array,
        intervals: PropTypes.number,
        selected: PropTypes.instanceOf(Date),
        openToDate: PropTypes.instanceOf(Date),
        onChange: PropTypes.func,
        timeClassName: PropTypes.func,
        todayButton: PropTypes.node,
        minTime: PropTypes.instanceOf(Date),
        maxTime: PropTypes.instanceOf(Date),
        excludeTimes: PropTypes.array,
        monthRef: PropTypes.object,
        timeCaption: PropTypes.string,
        injectTimes: PropTypes.array,
        locale: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.shape({ locale: PropTypes.object }),
        ]),
        showTimeSelectOnly: PropTypes.bool,
        dateUtils: PropTypes.any,
    };

    state = {
        height: null,
    };

    componentDidMount() {
        // code to ensure selected time will always be in focus within time window when it first appears
        this.list.scrollTop = Time.calcCenterPosition(
            this.props.monthRef
                ? this.props.monthRef.clientHeight - this.header.clientHeight
                : this.list.clientHeight,
            this.centerLi
        );
        if (this.props.monthRef && this.header) {
            this.setState({
                height:
                    this.props.monthRef.clientHeight - this.header.clientHeight,
            });
        }
    }

    handleClick = (time) => {
        if (
            ((this.props.minTime || this.props.maxTime) &&
                this.props.dateUtils.isTimeInDisabledRange(time, this.props)) ||
            (this.props.excludeTimes &&
                this.props.dateUtils.isTimeDisabled(
                    time,
                    this.props.excludeTimes
                )) ||
            (this.props.includeTimes &&
                !this.props.dateUtils.isTimeDisabled(
                    time,
                    this.props.includeTimes
                ))
        ) {
            return;
        }
        this.props.onChange(time);
    };

    liClasses = (time, currH, currM) => {
        let classes = [
            'react-datepicker__time-list-item',
            this.props.timeClassName
                ? this.props.timeClassName(time, currH, currM)
                : undefined,
        ];

        if (
            this.props.selected &&
            currH === this.props.dateUtils.getHours(time) &&
            currM === this.props.dateUtils.getMinutes(time)
        ) {
            classes.push('react-datepicker__time-list-item--selected');
        }
        if (
            ((this.props.minTime || this.props.maxTime) &&
                this.props.dateUtils.isTimeInDisabledRange(time, this.props)) ||
            (this.props.excludeTimes &&
                this.props.dateUtils.isTimeDisabled(
                    time,
                    this.props.excludeTimes
                )) ||
            (this.props.includeTimes &&
                !this.props.dateUtils.isTimeDisabled(
                    time,
                    this.props.includeTimes
                ))
        ) {
            classes.push('react-datepicker__time-list-item--disabled');
        }
        if (
            this.props.injectTimes &&
            (this.props.dateUtils.getHours(time) * 60 +
                this.props.dateUtils.getMinutes(time)) %
                this.props.intervals !==
                0
        ) {
            classes.push('react-datepicker__time-list-item--injected');
        }

        return classes.join(' ');
    };

    renderTimes = () => {
        let times = [];
        const format = this.props.format
            ? this.props.format
            : this.props.dateUtils.formats.fullTime;
        const intervals = this.props.intervals;

        const base = this.props.dateUtils.getStartOfDay(
            this.props.dateUtils.date()
        );
        const multiplier = 1440 / intervals;
        const sortedInjectTimes =
            this.props.injectTimes &&
            this.props.injectTimes.sort(function (a, b) {
                return a - b;
            });

        const activeDate =
            this.props.selected ||
            this.props.openToDate ||
            this.props.dateUtils.date();
        const currH = this.props.dateUtils.getHours(activeDate);
        const currM = this.props.dateUtils.getMinutes(activeDate);
        const activeTime = this.props.dateUtils.setHours(
            this.props.dateUtils.setMinutes(base, currM),
            currH
        );

        for (let i = 0; i < multiplier; i++) {
            const currentTime = this.props.dateUtils.addMinutes(
                base,
                i * intervals
            );
            times.push(currentTime);

            if (sortedInjectTimes) {
                const timesToInject = this.props.dateUtils.timesToInjectAfter(
                    base,
                    currentTime,
                    i,
                    intervals,
                    sortedInjectTimes
                );
                times = times.concat(timesToInject);
            }
        }

        return times.map((time, i) => (
            <li
                key={i}
                onClick={this.handleClick.bind(this, time)}
                className={this.liClasses(time, currH, currM)}
                ref={(li) => {
                    if (
                        this.props.dateUtils.isBefore(time, activeTime) ||
                        this.props.dateUtils.isEqual(time, activeTime)
                    ) {
                        this.centerLi = li;
                    }
                }}
            >
                {this.props.dateUtils.formatDate(
                    time,
                    format,
                    this.props.locale
                )}
            </li>
        ));
    };

    render() {
        const { height } = this.state;

        return (
            <div
                className={`react-datepicker__time-container ${
                    this.props.todayButton
                        ? 'react-datepicker__time-container--with-today-button'
                        : ''
                }`}
            >
                <div
                    className={`react-datepicker__header react-datepicker__header--time ${
                        this.props.showTimeSelectOnly
                            ? 'react-datepicker__header--time--only'
                            : ''
                    }`}
                    ref={(header) => {
                        this.header = header;
                    }}
                >
                    <div className="react-datepicker-time__header">
                        {this.props.timeCaption}
                    </div>
                </div>
                <div className="react-datepicker__time">
                    <div className="react-datepicker__time-box">
                        <ul
                            className="react-datepicker__time-list"
                            ref={(list) => {
                                this.list = list;
                            }}
                            style={height ? { height } : {}}
                        >
                            {this.renderTimes()}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}

export default withDateUtils(Time);
