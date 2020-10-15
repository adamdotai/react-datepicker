import React from 'react';
import { DatePickerContext } from '../DatePickerProvider';

export function useDateUtils() {
    const context = React.useContext(DatePickerContext);
    return context;
}
