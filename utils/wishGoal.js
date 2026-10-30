// A wish's goal is `amount` in its own `currency`. `price` is the USD equivalent, filled in
// server-side (utils/wishPrice.js); older wishes may only have `price`, in which case the
// goal is that, in USD. Safe to import from client components.
export const wishCurrency = (note) => (note.amount && note.currency ? note.currency : 'USD').toUpperCase();

export const wishGoal = (note) => parseFloat(note.amount || note.price) || 0;
