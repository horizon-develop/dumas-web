import axios from "axios";
import { clearUserData } from "../../features/auth/utils/authUtils";
import {
	type ErrorCode,
	extractApiError,
	isAuthError,
	ERROR_MESSAGES,
} from "../types/apiError";

const apiClient = axios.create({
	baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
	timeout: 10000,
	withCredentials: true,
});

let isRefreshing = false;
let failedQueue: { resolve: () => void; reject: (error: unknown) => void }[] = [];

const processQueue = (error: unknown) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve();
		}
	});
	failedQueue = [];
};

apiClient.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		const status = error.response?.status;
		const apiError = extractApiError(error);
		const errorCode = apiError?.errorCode as ErrorCode | undefined;

		if (status === 401 && !originalRequest._retry) {
			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					failedQueue.push({
						resolve: () => resolve(apiClient(originalRequest)),
						reject,
					});
				});
			}

			originalRequest._retry = true;
			isRefreshing = true;

			try {
				await apiClient.post("/api/auth/refresh");
				processQueue(null);
				return apiClient(originalRequest);
			} catch (refreshError: unknown) {
				processQueue(refreshError);
				clearUserData();

				const refreshApiError = extractApiError(refreshError);
				const refreshErrorCode = refreshApiError?.errorCode;

				if (refreshErrorCode && isAuthError(refreshErrorCode)) {
					window.dispatchEvent(
						new CustomEvent("auth-logout", {
							detail: { reason: "session_expired", errorCode: refreshErrorCode },
						})
					);
				} else {
					window.dispatchEvent(new CustomEvent("auth-logout"));
				}

				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}

		if (status >= 500) {
			const serverError = new Error(
				errorCode
					? ERROR_MESSAGES[errorCode]
					: ERROR_MESSAGES.INTERNAL_ERROR
			);
			return Promise.reject(serverError);
		}

		return Promise.reject(error);
	}
);

export default apiClient;
