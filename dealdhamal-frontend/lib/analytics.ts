export const trackEvent = (eventName: string, parameters?: Record<string, string | number | boolean>) => {
  if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
    window.gtag('event', eventName, parameters)
  }
}

export const trackCouponReveal = (couponId: string, storeName: string, couponType: string) =>
  trackEvent('coupon_reveal', { coupon_id: couponId, store_name: storeName, coupon_type: couponType })

export const trackCouponCopy = (couponId: string, storeName: string) =>
  trackEvent('coupon_copy', { coupon_id: couponId, store_name: storeName })

export const trackCouponClick = (couponId: string, storeName: string) =>
  trackEvent('coupon_click', { coupon_id: couponId, store_name: storeName })

export const trackCouponReport = (couponId: string, worked: boolean) =>
  trackEvent('coupon_report', { coupon_id: couponId, worked })

export const trackSearch = (query: string, resultsCount: number) =>
  trackEvent('search', { search_term: query, results_count: resultsCount })

export const trackStoreView = (storeSlug: string, storeName: string) =>
  trackEvent('store_view', { store_slug: storeSlug, store_name: storeName })

export const trackAlertSubscribe = (storeSlug?: string, categorySlug?: string) =>
  trackEvent('alert_subscribe', { store_slug: storeSlug ?? 'all', category_slug: categorySlug ?? 'all' })

export const trackSaveCoupon = (couponId: string, storeName: string) =>
  trackEvent('save_coupon', { coupon_id: couponId, store_name: storeName })
