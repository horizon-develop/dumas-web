/**
 * API Error Response structure from backend GlobalExceptionHandler
 */
export interface ApiErrorResponse {
	timestamp: string;
	status: number;
	error: string;
	errorCode: ErrorCode;
	message: string;
	path: string;
	fieldErrors?: Record<string, string>;
	violations?: Record<string, string>;
}

/**
 * Error codes from backend GlobalExceptionHandler
 * Synced with: dumas-backend/src/main/java/dumas/web/Exception/GlobalExceptionHandler.java
 */
export type ErrorCode =
	// Authentication errors (401)
	| "INVALID_CREDENTIALS"
	| "AUTHENTICATION_FAILED"
	| "AUTHENTICATION_ERROR"
	| "SESSION_ERROR"
	// Authorization errors (403)
	| "ACCESS_DENIED"
	// Validation errors (400)
	| "VALIDATION_ERROR"
	| "CONSTRAINT_VIOLATION"
	| "MALFORMED_JSON"
	| "INVALID_REQUEST"
	| "OPERATION_NOT_ALLOWED"
	// Not found errors (404)
	| "RESOURCE_NOT_FOUND"
	| "ENDPOINT_NOT_FOUND"
	// Conflict errors (409)
	| "REGISTRATION_ERROR"
	| "RESOURCE_CONFLICT"
	// Business logic errors (400)
	| "INVALID_COUPON"
	| "CART_ERROR"
	| "STOCK_ERROR"
	// Payment errors (402)
	| "PAYMENT_ERROR"
	// Method not allowed (405)
	| "METHOD_NOT_ALLOWED"
	// Server errors (500)
	| "INTERNAL_ERROR";

/**
 * Error code to HTTP status mapping
 */
export const ERROR_CODE_STATUS: Record<ErrorCode, number> = {
	INVALID_CREDENTIALS: 401,
	AUTHENTICATION_FAILED: 401,
	AUTHENTICATION_ERROR: 401,
	SESSION_ERROR: 401,
	ACCESS_DENIED: 403,
	VALIDATION_ERROR: 400,
	CONSTRAINT_VIOLATION: 400,
	MALFORMED_JSON: 400,
	INVALID_REQUEST: 400,
	OPERATION_NOT_ALLOWED: 400,
	RESOURCE_NOT_FOUND: 404,
	ENDPOINT_NOT_FOUND: 404,
	REGISTRATION_ERROR: 409,
	RESOURCE_CONFLICT: 409,
	INVALID_COUPON: 400,
	CART_ERROR: 400,
	STOCK_ERROR: 400,
	PAYMENT_ERROR: 402,
	METHOD_NOT_ALLOWED: 405,
	INTERNAL_ERROR: 500,
};

/**
 * User-friendly error messages in Spanish (matching backend messages)
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
	INVALID_CREDENTIALS: "Email o contraseña incorrectos",
	AUTHENTICATION_FAILED: "Sesión inválida. Por favor inicia sesión nuevamente",
	AUTHENTICATION_ERROR: "Error de autenticación",
	SESSION_ERROR: "Sesión inválida. Por favor inicia sesión nuevamente",
	ACCESS_DENIED: "No tienes permisos para realizar esta acción",
	VALIDATION_ERROR: "Datos de entrada inválidos",
	CONSTRAINT_VIOLATION: "Datos inválidos",
	MALFORMED_JSON: "El formato de los datos enviados es incorrecto",
	INVALID_REQUEST: "Los datos de la solicitud son inválidos",
	OPERATION_NOT_ALLOWED: "No se puede completar esta operación",
	RESOURCE_NOT_FOUND: "El recurso solicitado no fue encontrado",
	ENDPOINT_NOT_FOUND: "El endpoint solicitado no existe",
	REGISTRATION_ERROR: "No se pudo completar el registro. Verifica los datos ingresados",
	RESOURCE_CONFLICT: "No se pudo completar la operación debido a un conflicto",
	INVALID_COUPON: "El cupón ingresado no es válido",
	CART_ERROR: "No se puede procesar el carrito",
	STOCK_ERROR: "Algunos productos no tienen stock disponible",
	PAYMENT_ERROR: "No se pudo procesar el pago. Intenta nuevamente",
	METHOD_NOT_ALLOWED: "Método no permitido",
	INTERNAL_ERROR: "Error interno del servidor. Por favor inténtalo más tarde",
};

/**
 * Check if an error code requires logout
 */
export const isAuthError = (errorCode: ErrorCode): boolean => {
	return ["AUTHENTICATION_FAILED", "SESSION_ERROR"].includes(errorCode);
};

/**
 * Check if an error code is a validation error with field details
 */
export const isValidationError = (errorCode: ErrorCode): boolean => {
	return ["VALIDATION_ERROR", "CONSTRAINT_VIOLATION"].includes(errorCode);
};

/**
 * Extract error details from axios error
 */
export const extractApiError = (error: unknown): ApiErrorResponse | null => {
	if (
		error &&
		typeof error === "object" &&
		"response" in error &&
		error.response &&
		typeof error.response === "object" &&
		"data" in error.response
	) {
		const data = error.response.data as ApiErrorResponse;
		if (data.errorCode) {
			return data;
		}
	}
	return null;
};

/**
 * Get user-friendly message from error
 */
export const getErrorMessage = (error: unknown): string => {
	const apiError = extractApiError(error);
	if (apiError) {
		return apiError.message || ERROR_MESSAGES[apiError.errorCode] || ERROR_MESSAGES.INTERNAL_ERROR;
	}
	if (error instanceof Error) {
		return error.message;
	}
	return ERROR_MESSAGES.INTERNAL_ERROR;
};
