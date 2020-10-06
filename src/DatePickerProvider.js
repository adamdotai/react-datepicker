import React, { createContext } from 'react';
import { mapObject, curry } from './utils/utils';
import * as utilities from './date_utils';

const DatePickerContext = createContext();
DatePickerContext.displayName = 'DatePickerContext';

class DatePickerProvider extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            utils: {},
        };
    }

    static getDerivedStateFromProps(props, state) {
        const { adapter } = props;
        if (props.adapter !== state.utils.adapter) {
            const utils = Object.assign(
                Object.create(adapter),
                mapObject(utilities, ([key, utilFunc]) => ({
                    [key]: curry(utilFunc)(adapter),
                }))
            );
            return {
                utils,
            };
        }
        return null;
    }

    render() {
        const { adapter, locale, children } = this.props;
        const { utils } = this.state;
        return (
            <DatePickerContext.Provider value={{ adapter, locale, utils }}>
                {children}
            </DatePickerContext.Provider>
        );
    }
}

export { DatePickerContext, DatePickerProvider };
