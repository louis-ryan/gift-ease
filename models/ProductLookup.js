import mongoose from 'mongoose';

// Cache of successful product-link lookups, keyed by canonical URL, so pasting the same
// link again is instant and doesn't spend another paid fallback request.
// MongoDB's TTL index removes entries after a day, so prices don't go too stale.
const ProductLookupSchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true },
  product: { type: mongoose.Schema.Types.Mixed, required: true },
  source: { type: String }, // 'direct' | 'zyte' | 'direct+zyte'
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 },
});

export default mongoose.models.ProductLookup || mongoose.model('ProductLookup', ProductLookupSchema);
