import { ErrorCode, ErrorItem, ErrorResponse } from "../protobuf";

export { ErrorCode } from "../protobuf";

const defaultMessages: Record<ErrorCode, string> = {
    [ErrorCode.SERVER_ERROR]: "",
    [ErrorCode.VALIDATION_ERROR]: "",
    [ErrorCode.UPLOAD_ERROR]: "",
    [ErrorCode.NO_AUTH]: "Вы не авторизовались",
    [ErrorCode.NOT_EXISTS]: "Не существует",
};

const statuses: Record<ErrorCode, number> = {
    [ErrorCode.SERVER_ERROR]: 500,
    [ErrorCode.VALIDATION_ERROR]: 400,
    [ErrorCode.UPLOAD_ERROR]: 400,
    [ErrorCode.NO_AUTH]: 401,
    [ErrorCode.NOT_EXISTS]: 400,
};

export class APIError extends Error {
    statusCode: number;
    protobuf: Uint8Array;

    constructor(
        code: ErrorCode,
        message?: string,
        options: { errors: ErrorItem[]; params: Record<string, string> } = {
            errors: [],
            params: {},
        },
    ) {
        super();
        this.statusCode = statuses[code];
        console.log(code, message, options);
        this.protobuf = ErrorResponse.toBinary({
            code,
            message: message || defaultMessages[code],
            errors: options.errors,
            params: options.params,
        });
    }
}
