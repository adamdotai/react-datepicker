import React from 'react';
import { DatePickerContext } from './DatePickerProvider';

export function withDateUtils(Component) {
    class WrappedComponent extends React.Component {
        render() {
            const props = this.props;
            return (
                <DatePickerContext.Consumer>
                    {({ locale, utils }) => {
                        return (
                            <Component
                                ref={this.props.forwardedRef}
                                {...props}
                                locale={locale}
                                dateUtils={utils}
                            />
                        );
                    }}
                </DatePickerContext.Consumer>
            );
        }
    }
    const ForwardedComponent = React.forwardRef(function (props, ref) {
        return <WrappedComponent forwardedRef={ref} {...props} />;
    });
    ForwardedComponent.prototype = {};
    return ForwardedComponent;
}
