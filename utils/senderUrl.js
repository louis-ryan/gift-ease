// Where the public sender app lives. Set NEXT_PUBLIC_SENDER_URL (e.g. https://wishlistagogo.com)
// when the sender app moves to its own domain; shared links and QR codes all come from here.
export const SENDER_URL = (process.env.NEXT_PUBLIC_SENDER_URL || 'https://gift-easy-sender.vercel.app').replace(/\/+$/, '');

export const senderLink = (uri) => `${SENDER_URL}/for/${uri}`;

// Without the protocol, for display ("wishlistagogo.com/for/sams-birthday")
export const SENDER_HOST = SENDER_URL.replace(/^https?:\/\//, '');
