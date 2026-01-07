export const AUTH_DOMAIN = 'guest-service.local';

export const emailFromUsername = (username: string) => {
    if (username.includes('@')) return username;
    return `${username}@${AUTH_DOMAIN}`;
};

export const usernameFromEmail = (email: string) => {
    if (email.endsWith(`@${AUTH_DOMAIN}`)) {
        return email.split('@')[0];
    }
    return email;
};
