export function curry(func) {
    return function curried(...args) {
        if (args.length >= func.length) {
            return func.apply(this, args);
        } else {
            return function (...args2) {
                return curried.apply(this, args.concat(args2));
            };
        }
    };
}

export function mapObject(obj, func) {
    return Object.assign({}, ...Object.entries(obj).map(func));
}

export default function toInteger(dirtyNumber) {
    if (dirtyNumber === null || dirtyNumber === true || dirtyNumber === false) {
        return NaN;
    }

    const number = Number(dirtyNumber);

    if (isNaN(number)) {
        return number;
    }

    return number < 0 ? Math.ceil(number) : Math.floor(number);
}
