const isProduction = process.env.NODE_ENV === 'production';

export const cookiesOption = {
    httpOnly: true,
    secure: isProduction ? true : (process.env.COOKIE_SECURE === 'true'),
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

export default cookiesOption;
