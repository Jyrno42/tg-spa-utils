import { FormikErrors } from 'formik';
import { call } from 'redux-saga/effects';
import {
    InvalidResponseCode,
    NetworkError,
    ResourceErrorInterface,
    ValidationErrorInterface
} from 'tg-resources';

import { defaultMessages, ErrorMessages } from './messages';


const isValidationError = (error: any): error is ValidationErrorInterface => (
    error.isValidationError
);

const isStatusCodeError = (error: any): error is InvalidResponseCode => (
    error.isInvalidResponseCode
);

const isNetworkError = (error: any): error is NetworkError => (
    error.isNetworkError
);

export interface FormErrorHandlerOptions<Values> {
    setErrors: (errors: FormikErrors<Values>) => void | Iterator<any>;
    setStatus: (status?: any) => void | Iterator<any>;

    error: ResourceErrorInterface;
    messages?: ErrorMessages;
}


interface ErrorMapping {
    field: string;
    message: string;
}


export function* formErrorsHandler<Values>(options: FormErrorHandlerOptions<Values>) {
    const { error, messages = defaultMessages, setErrors, setStatus } = options;

    if (isNetworkError(error)) {
        yield call(setStatus, {
            message: messages.network,
        });

    } else if (isStatusCodeError(error)) {
        yield call(setStatus, {
            message: messages.invalidResponseCode,
        });

    } else if (isValidationError(error)) {
        const { nonFieldErrors } = error.errors;

        if (nonFieldErrors) {
            yield call(setStatus, {
                message: nonFieldErrors.toString(),
            });
        }

        const fields = error.errors
            .filter((e: ValidationErrorInterface) => e.fieldName !== 'nonFieldErrors')
            .map((e: ValidationErrorInterface) => ({ field: e.fieldName, message: e.toString() }))
            .reduce((result: any, current: ErrorMapping) => {
                result[current.field] = current.message;
                return result;
            }, {});

        yield call(setErrors, fields);
    } else {
        // Fallback to status error
        yield call(setStatus, `${error}`);
    }
}
