'use client';

import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Phone, MessageCircle, Truck, RotateCcw, Shield,
  Star, CheckCircle2, ShoppingBag, ChevronRight, BadgeCheck,
} from 'lucide-react';
import { type Product } from '@/lib/products';
import { createOrder } from '@/app/checkout/actions';

/* ─── helpers ─────────────────────────────────────────── */

const parseImages = (images: string | string[] | undefined | null): string[] => {
  if (!images) return [];
  if (Array.isArray(images)) {
    return images
      .flatMap((img) => (img?.includes(',') ? img.split(',').map((i) => i.trim()) : [img]))
      .filter(Boolean);
  }
  return images.split(',').map((s) => s.trim()).filter(Boolean);
};

const fmt = (v: string | number | null | undefined): number => {
  if (!v) return 0;
  return typeof v === 'string' ? parseFloat(v) : v;
};

/* ─── static content ──────────────────────────────────── */

const REVIEWS = [
  { name: 'Rafiqul Islam', city: 'Dhaka', stars: 5, text: 'অসাধারণ কোয়ালিটি! কাপড় অনেক আরামদায়ক এবং ফিটিং একদম পারফেক্ট।', time: '২ দিন আগে' },
  { name: 'Nasrin Akter', city: 'Chattogram', stars: 5, text: 'দ্রুত ডেলিভারি, প্রোডাক্ট ছবির মতোই এসেছে। অনেক খুশি!', time: '৪ দিন আগে' },
  { name: 'Kamal Hossain', city: 'Sylhet', stars: 5, text: 'দামের তুলনায় মান অনেক ভালো। আবারও অর্ডার করব ইনশাআল্লাহ।', time: '১ সপ্তাহ আগে' },
];

/* ─── component ─────────────────────────────────────────── */

export default function LandingProductClient({
  product,
  relatedProducts,
}: {
  product: Product;
  relatedProducts: Product[];
}) {
  const orderRef = useRef<HTMLDivElement>(null);

  const images = parseImages(product.images);

  const activeVariants = useMemo(
    () => (product.variants ?? []).filter((v) => v.isActive !== false),
    [product.variants]
  );

  // Deduplicate variant options (e.g. Size, Color)
  const variantOptions = useMemo(() => {
    if (!activeVariants.length) return [];
    const sample = activeVariants[0];
    const isNewFormat = sample.value.includes(': ');

    if (isNewFormat) {
      const parts = sample.value.split(' / ');
      const types = parts.map((p) => p.split(': ')[0].trim());
      return types.map((type, idx) => ({
        name: type,
        values: Array.from(new Set(activeVariants.map((v) => {
          const vParts = v.value.split(' / ');
          return vParts[idx]?.split(': ')[1]?.trim() ?? vParts[idx] ?? '';
        }))),
      }));
    }

    const isComposite = activeVariants.some((v) => v.value.includes(' / '));
    const splitValues = activeVariants.map((v) => isComposite ? v.value.split(' / ') : [v.value]);
    const numOpts = splitValues[0]?.length ?? 0;
    return Array.from({ length: numOpts }, (_, i) => ({
      name: activeVariants[0]?.variantType?.name ?? `Option ${i + 1}`,
      values: Array.from(new Set(splitValues.map((sv) => sv[i] ?? ''))),
    }));
  }, [activeVariants]);

  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>(() => {
    const init: Record<number, string> = {};
    if (activeVariants.length > 0) {
      const def = activeVariants.find((v) => v.isDefault) ?? activeVariants[0];
      const isNew = def.value.includes(': ');
      const vals = isNew
        ? def.value.split(' / ').map((p) => p.split(': ')[1]?.trim() ?? p)
        : def.value.split(' / ');
      vals.forEach((val, idx) => { init[idx] = val; });
    }
    return init;
  });

  const selectedVariant = useMemo(() => {
    if (!activeVariants.length) return null;
    return activeVariants.find((v) => {
      const isNew = v.value.includes(': ');
      const vVals = isNew
        ? v.value.split(' / ').map((p) => p.split(': ')[1]?.trim() ?? p)
        : v.value.split(' / ');
      return variantOptions.every((_, idx) => vVals[idx] === selectedOptions[idx]);
    }) ?? null;
  }, [activeVariants, selectedOptions, variantOptions]);

  const [mainImage, setMainImage] = useState(images[0] ?? '');

  const price = fmt(selectedVariant?.price ?? product.price);
  const comparePrice = selectedVariant?.comparePrice
    ? fmt(selectedVariant.comparePrice)
    : product.comparePrice ? fmt(product.comparePrice) : null;
  const discount = comparePrice && comparePrice > price
    ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
  const savings = comparePrice && comparePrice > price ? comparePrice - price : 0;

  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [orderNumber, setOrderNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', address: '', shippingZone: '' });

  const shippingCharge = form.shippingZone === 'OUTSIDE_DHAKA' ? 110 : 80;
  const orderTotal = price * quantity + shippingCharge;

  const handleOptionSelect = (optIdx: number, val: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optIdx]: val }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'নাম লিখুন';
    if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 10) e.phone = 'সঠিক মোবাইল নম্বর দিন';
    if (!form.shippingZone) e.shippingZone = 'ডেলিভারি এলাকা বেছে নিন';
    if (!form.address.trim()) e.address = 'ঠিকানা লিখুন';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setIsSubmitting(true);
    try {
      const result = await createOrder(
        form,
        [{
          id: product.id.toString(),
          productId: product.id,
          variantId: selectedVariant?.id ?? null,
          quantity,
          size: '',
          color: '',
          variantType: selectedVariant?.variantType?.name ?? '',
          variantValue: selectedVariant?.value ?? '',
          unitPrice: price,
        }],
        null
      );
      if (result.success) {
        setStep('success');
        setOrderNumber(result.orderId?.toString() ?? '');
      } else {
        setErrors({ submit: result.error ?? 'অর্ডার দেওয়া যায়নি। আবার চেষ্টা করুন।' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ─── render ──────────────────────────────────────────── */

  return (
    <div className="bg-[#fafaf7] text-gray-900 min-h-screen">

      {/* ── TOP BAR ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-widest uppercase text-gray-900">
            Fabble
          </Link>
          <div className="flex items-center gap-4">
            <a
              href="https://wa.me/8801700000000"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#25D366]"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
            <a href="tel:+8801700000000" className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 transition">
              <Phone className="w-4 h-4" />
              01700-000000
            </a>
          </div>
        </div>
      </header>

      {/* ── ANNOUNCEMENT ── */}
      <div className="bg-primary text-white text-xs font-semibold text-center py-2 tracking-wide">
        🎁 ঢাকার ভেতরে ফ্রি ডেলিভারি &nbsp;·&nbsp; ক্যাশ অন ডেলিভারি সুবিধা
      </div>

      {/* ── PRODUCT HERO ── */}
      <section className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">

          {/* Left: Image gallery */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="relative bg-white rounded-2xl overflow-hidden aspect-[4/5] shadow-sm">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <ShoppingBag className="w-16 h-16 text-gray-300" />
                </div>
              )}
              {discount > 0 && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  -{discount}% ছাড়
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMainImage(img)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      mainImage === img ? 'border-primary' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product info + order form */}
          <div ref={orderRef}>
            {step === 'success' ? (
              /* ── SUCCESS ── */
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">অর্ডার সফল হয়েছে!</h2>
                  {orderNumber && (
                    <p className="text-sm text-gray-500">অর্ডার নম্বর: <span className="font-mono text-gray-900 font-semibold">{orderNumber}</span></p>
                  )}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  শীঘ্রই আমাদের টিম আপনার নম্বরে কল করবে অর্ডার কনফার্ম করতে।
                </p>
                <a
                  href="https://wa.me/8801700000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] text-white font-semibold px-5 py-3 rounded-xl text-sm hover:bg-[#1ebe59] transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp-এ যোগাযোগ করুন
                </a>
                <div className="pt-2">
                  <Link href="/shop" className="text-sm text-primary hover:underline">
                    আরও শপিং করুন →
                  </Link>
                </div>
              </div>
            ) : (
              /* ── ORDER FORM ── */
              <div className="space-y-5">
                {/* Product meta */}
                <div>
                  {product.category?.name && (
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">
                      {product.category.name}
                    </p>
                  )}
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug mb-3">{product.name}</h1>

                  {/* Ratings row */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex text-amber-400">
                      {[1,2,3,4,5].map((s) => <Star key={s} className="w-4 h-4 fill-current" />)}
                    </div>
                    <span className="text-xs text-gray-500 font-medium">৪.৯/৫ · ১২০+ অর্ডার</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-3xl font-bold text-primary">৳{price.toFixed(0)}</span>
                    {comparePrice && (
                      <span className="text-lg text-gray-400 line-through">৳{comparePrice.toFixed(0)}</span>
                    )}
                  </div>
                  {savings > 0 && (
                    <p className="text-sm text-red-500 font-semibold">
                      আপনি সাশ্রয় করছেন ৳{savings.toFixed(0)}!
                    </p>
                  )}
                </div>

                {/* Variants */}
                {variantOptions.map((opt, optIdx) => (
                  <div key={optIdx}>
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      {opt.name}
                      {selectedOptions[optIdx] && (
                        <span className="ml-2 text-primary font-bold">{selectedOptions[optIdx]}</span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {opt.values.map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleOptionSelect(optIdx, val)}
                          className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                            selectedOptions[optIdx] === val
                              ? 'border-primary bg-primary text-white'
                              : 'border-gray-200 text-gray-700 hover:border-primary/50 bg-white'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Quick benefits */}
                <div className="flex flex-wrap gap-3">
                  {[
                    { icon: Truck, text: 'ঢাকায় ফ্রি ডেলিভারি' },
                    { icon: Shield, text: 'ক্যাশ অন ডেলিভারি' },
                    { icon: RotateCcw, text: '৭ দিন রিটার্ন' },
                  ].map(({ icon: Icon, text }) => (
                    <span key={text} className="flex items-center gap-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-full px-3 py-1.5 font-medium">
                      <Icon className="w-3.5 h-3.5 text-primary" />
                      {text}
                    </span>
                  ))}
                </div>

                {/* Order form card */}
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-primary px-5 py-3">
                    <p className="text-white text-sm font-bold tracking-wide">অর্ডার ফর্ম — পণ্য পেয়ে টাকা দিন</p>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Name row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">নাম *</label>
                        <input
                          type="text"
                          value={form.firstName}
                          onChange={(e) => { setForm((f) => ({ ...f, firstName: e.target.value })); setErrors((er) => { const n={...er}; delete n.firstName; return n; }); }}
                          placeholder="আপনার নাম"
                          className={`w-full border rounded-lg px-3 py-2.5 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/30 transition ${errors.firstName ? 'border-red-400' : 'border-gray-200'}`}
                        />
                        {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">পদবি</label>
                        <input
                          type="text"
                          value={form.lastName}
                          onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                          placeholder="ঐচ্ছিক"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">মোবাইল নম্বর *</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => { setForm((f) => ({ ...f, phone: e.target.value })); setErrors((er) => { const n={...er}; delete n.phone; return n; }); }}
                        placeholder="01XXXXXXXXX"
                        className={`w-full border rounded-lg px-3 py-2.5 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/30 transition ${errors.phone ? 'border-red-400' : 'border-gray-200'}`}
                      />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>

                    {/* Delivery zone */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2">ডেলিভারি এলাকা *</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: 'INSIDE_DHAKA', label: 'ঢাকার ভেতরে', charge: 'ফ্রি ডেলিভারি' },
                          { value: 'OUTSIDE_DHAKA', label: 'ঢাকার বাইরে', charge: '৳১১০' },
                        ].map(({ value, label, charge }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => { setForm((f) => ({ ...f, shippingZone: value })); setErrors((er) => { const n={...er}; delete n.shippingZone; return n; }); }}
                            className={`flex flex-col items-center py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                              form.shippingZone === value
                                ? 'border-primary bg-primary/5 text-primary'
                                : errors.shippingZone
                                ? 'border-red-300 text-gray-600 hover:border-primary/50'
                                : 'border-gray-200 text-gray-600 hover:border-primary/40'
                            }`}
                          >
                            <span>{label}</span>
                            <span className={`text-xs font-normal mt-0.5 ${form.shippingZone === value ? 'text-primary' : 'text-gray-400'}`}>
                              {charge}
                            </span>
                          </button>
                        ))}
                      </div>
                      {errors.shippingZone && <p className="text-red-500 text-xs mt-1">{errors.shippingZone}</p>}
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">সম্পূর্ণ ঠিকানা *</label>
                      <input
                        type="text"
                        value={form.address}
                        onChange={(e) => { setForm((f) => ({ ...f, address: e.target.value })); setErrors((er) => { const n={...er}; delete n.address; return n; }); }}
                        placeholder="বাড়ি নম্বর, রাস্তা, এলাকা"
                        className={`w-full border rounded-lg px-3 py-2.5 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/30 transition ${errors.address ? 'border-red-400' : 'border-gray-200'}`}
                      />
                      {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-gray-600">পরিমাণ</label>
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-3 py-2 text-gray-500 hover:bg-gray-50 transition text-lg leading-none">−</button>
                        <span className="px-5 py-2 text-sm font-bold border-x border-gray-200">{quantity}</span>
                        <button type="button" onClick={() => setQuantity((q) => Math.min(q + 1, 10))} className="px-3 py-2 text-gray-500 hover:bg-gray-50 transition text-lg leading-none">+</button>
                      </div>
                    </div>

                    {/* Order summary */}
                    <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-sm">
                      <div className="flex justify-between text-gray-500">
                        <span>সাবটোটাল ({quantity}টি)</span>
                        <span>৳{(price * quantity).toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>ডেলিভারি</span>
                        <span>
                          {form.shippingZone === 'INSIDE_DHAKA' ? (
                            <span className="text-green-600 font-semibold">ফ্রি</span>
                          ) : form.shippingZone === 'OUTSIDE_DHAKA' ? '৳১১০' : '—'}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-gray-900 pt-1.5 border-t border-gray-200 text-base">
                        <span>মোট পরিশোধ</span>
                        <span className="text-primary">৳{form.shippingZone ? orderTotal.toFixed(0) : (price * quantity).toFixed(0)}</span>
                      </div>
                    </div>

                    {errors.submit && (
                      <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        {errors.submit}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-primary text-white font-bold py-4 rounded-xl text-sm tracking-wide hover:bg-primary/90 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_8px_24px_rgba(0,0,0,0.15)]"
                    >
                      {isSubmitting ? 'অর্ডার দেওয়া হচ্ছে...' : '🛍️ ক্যাশ অন ডেলিভারিতে অর্ডার করুন'}
                    </button>

                    <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                      <BadgeCheck className="w-3.5 h-3.5 text-green-500" />
                      পণ্য হাতে পেয়ে টাকা দিন — কোনো অগ্রিম নেই
                    </p>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── PRODUCT DESCRIPTION ── */}
      {product.description && (
        <section className="max-w-6xl mx-auto px-4 py-10">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">পণ্যের বিবরণ</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm md:text-base">
              {product.description}
            </p>
          </div>
        </section>
      )}

      {/* ── REVIEWS ── */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">কাস্টমার রিভিউ</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex text-amber-400">
                {[1,2,3,4,5].map((s) => <Star key={s} className="w-4 h-4 fill-current" />)}
              </div>
              <span className="text-sm text-gray-500">৪.৯ গড় · ১২০+ রিভিউ</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {REVIEWS.map((r) => (
            <div key={r.name} className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
              <div className="flex text-amber-400">
                {Array.from({ length: r.stars }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">"{r.text}"</p>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                    {r.name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.city}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-300">{r.time}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── RELATED PRODUCTS ── */}
      {relatedProducts.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">আরও দেখুন</h2>
            <Link href="/shop" className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline">
              সব পণ্য <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((p) => {
              const pImgs = parseImages(p.images);
              const pPrice = fmt(p.price);
              const pCompare = p.comparePrice ? fmt(p.comparePrice) : null;
              const pDiscount = pCompare && pCompare > pPrice ? Math.round(((pCompare - pPrice) / pCompare) * 100) : 0;

              return (
                <Link key={p.id} href={`/landing/${p.id}`} className="group">
                  <div className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all">
                    <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                      {pImgs[0] ? (
                        <img src={pImgs[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                      {pDiscount > 0 && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          -{pDiscount}%
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-gray-800 font-medium leading-snug line-clamp-2 mb-1">{p.name}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-primary">৳{pPrice.toFixed(0)}</span>
                        {pCompare && <span className="text-xs text-gray-400 line-through">৳{pCompare.toFixed(0)}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── STICKY MOBILE CTA (only when not in view) ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-200 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-gray-500 leading-none mb-0.5">{product.name}</p>
            <p className="text-base font-bold text-primary">৳{price.toFixed(0)}</p>
          </div>
          <button
            onClick={() => orderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            className="bg-primary text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-primary/90 transition whitespace-nowrap"
          >
            অর্ডার করুন
          </button>
        </div>
      </div>

      {/* Bottom padding for mobile CTA */}
      <div className="h-20 md:h-0" />

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-3">
          <Link href="/" className="text-lg font-bold tracking-widest uppercase text-gray-900">
            Fabble
          </Link>
          <p className="text-xs text-gray-400">প্রিমিয়াম ফ্যাশন · ক্যাশ অন ডেলিভারি · ১০০% অরিজিনাল</p>
          <div className="flex items-center justify-center gap-5 text-xs text-gray-500">
            <a href="tel:+8801700000000" className="flex items-center gap-1 hover:text-gray-800 transition">
              <Phone className="w-3.5 h-3.5" /> 01700-000000
            </a>
            <a href="https://wa.me/8801700000000" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#25D366] hover:opacity-80 transition">
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </a>
          </div>
          <p className="text-xs text-gray-300">© {new Date().getFullYear()} Fabble</p>
        </div>
      </footer>
    </div>
  );
}
