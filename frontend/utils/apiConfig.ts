export const getBackendUrl = () => {
    // Check if we are in the browser
    if (typeof window !== 'undefined') {
        // Use the current hostname but port 8999
        return `${window.location.protocol}//${window.location.hostname}:7070`;
    }
    // Fallback for SSR
    return "http://localhost:7070";
};
