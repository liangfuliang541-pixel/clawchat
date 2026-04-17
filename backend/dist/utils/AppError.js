export class AppError extends Error {
    statusCode;
    code;
    details;
    constructor(statusCode, code, message, details) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.name = 'AppError';
    }
}
export class ValidationError extends AppError {
    constructor(details) {
        super(400, 'VALIDATION_ERROR', 'Validation failed', details);
    }
}
export class AuthenticationError extends AppError {
    constructor(message = 'Unauthorized') {
        super(401, 'UNAUTHORIZED', message);
    }
}
export class NotFoundError extends AppError {
    constructor(resource) {
        super(404, 'NOT_FOUND', `${resource} not found`);
    }
}
export class ConflictError extends AppError {
    constructor(message = 'Conflict') {
        super(409, 'CONFLICT', message);
    }
}
