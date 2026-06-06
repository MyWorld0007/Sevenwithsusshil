const IS_PROD = import.meta.env.PROD;

export function apiFetch(endpoint: string, options?: RequestInit) {
    const isHostinger = typeof window !== 'undefined' && !window.location.hostname.includes('.run.app') && !window.location.hostname.includes('localhost');
    
    if (IS_PROD && isHostinger) {
        // endpoint is like '/api/settings'
        // we map it to '/api.php?route=settings'
        const route = endpoint.replace('/api/', '');
        return fetch(`/api.php?route=${route}`, options);
    }
    return fetch(endpoint, options);
}
