import { JSONObject } from 'tiny-types';
import * as serenitySpecificErrors from '../errors';

export interface SerialisedError extends JSONObject {
    name:    string;
    message: string;
    stack:   string;
}

export class ErrorSerialiser {
    private static recognisedErrors = [
        ...Object.keys(serenitySpecificErrors).map(key => serenitySpecificErrors[key]),
        Error,
        EvalError,
        RangeError,
        ReferenceError,
        SyntaxError,
        TypeError,
        URIError,
    ];

    static serialise(error: Error): SerialisedError {
        // todo: serialise the cause as well
        return Object.getOwnPropertyNames(error).reduce((serialised, key) => {
            serialised[key] = error[key];
            return serialised;
        }, { name: error.name || error.constructor.name }) as SerialisedError;
    }

    static deserialise(serialisedError: SerialisedError): Error {
        // todo: de-serialise the cause as well
        const constructor = ErrorSerialiser.recognisedErrors.find(errorType => errorType.name === serialisedError.name) || Error;
        const deserialised = Object.create(constructor.prototype);
        for (const prop in serialisedError) {
            if (serialisedError.hasOwnProperty(prop)) {
                deserialised[prop] = serialisedError[prop];
            }
        }
        return deserialised;
    }

    static deserialiseFromStackTrace(stack: string) {
        const lines = stack.split('\n');
        const [, name, message ] = lines[0].match(/^([^\s:]+):\s(.*)$/);

        return ErrorSerialiser.deserialise({ name, message, stack });
    }
}