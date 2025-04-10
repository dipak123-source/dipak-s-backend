class ApiError extends Error {
    constructor(
        statuscode,
        message = "Something went wrong",
        error = [],
        stack = ""
    ) {
        super(message); // Calls the parent Error class constructor
        this.statuscode = statuscode; // HTTP status code (e.g., 404, 500)
        this.data = null; // Additional data related to the error, can be set later
        this.message = message; // Error message
        this.error = error; // An array of error details (e.g., validation errors)
        this.success = false; // Indicates that the operation was unsuccessful

        if (stack) { // If a custom stack trace is provided, use it, => custom stack trance = A custom stack trace is a manually-defined or 
        // modified stack trace used to provide more meaningful debugging information than what is automatically generated by JavaScript's Error objects.
            this.stack = stack;
        } else { // Otherwise, capture the default stack trace
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };
