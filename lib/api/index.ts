/**
 * Barrel for the API layer.
 *
 * Re-exports each domain module under a namespace so call sites read as
 * `ordersApi.getOrder(...)`. Import from here rather than reaching into
 * individual files, so the surface stays visible in one place.
 */

export * from "./types";
export { ApiError, NetworkError, apiClient, fetchPublic } from "./client";
export * as authApi from "./auth";
export * as catalogueApi from "./catalogue";
export * as cartApi from "./cart";
export * as ordersApi from "./orders";
