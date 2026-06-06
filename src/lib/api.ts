const IS_PROD = import.meta.env.PROD;

export function apiFetch(endpoint: string, options?: RequestInit) {
    if (IS_PROD) {
        // endpoint is like '/api/settings'
        // we map it to '/api.php?route=settings'
        const route = endpoint.replace('/api/', '');
        return fetch(`/api.php?route=${route}`, options);
    }
    return fetch(endpoint, options);
}
