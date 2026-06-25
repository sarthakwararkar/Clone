export interface DealTheme {
  gradient: string;
  btnBg: string;
  badgeBg: string;
  imageUrl: string;
  textColor: string;
}

/**
 * Classifies a coupon/deal based on its title, store name, and category
 * to return a matching premium gradient, button styling, and relevant Unsplash image.
 */
export function getDealTheme(title: string, storeName: string, categoryName?: string): DealTheme {
  const t = title.toLowerCase();
  const s = storeName.toLowerCase();
  const c = categoryName?.toLowerCase() || '';

  // 1. Determine Image URL based on keywords
  // We use high-quality, transparent or clean background Unsplash images representing the items
  let imageUrl = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&auto=format&fit=crop&q=80'; // Default: Premium wrapped gift box
  
  if (
    t.includes('laptop') || 
    t.includes('macbook') || 
    t.includes('computer') || 
    t.includes('pc') || 
    s.includes('hp') || 
    s.includes('dell') || 
    s.includes('lenovo') || 
    s.includes('acer') || 
    s.includes('asus')
  ) {
    // Beautiful floating/isolated-feel laptop
    imageUrl = 'https://images.unsplash.com/photo-1496181130204-755241524eab?w=400&auto=format&fit=crop&q=80';
  } else if (
    t.includes('phone') || 
    t.includes('mobile') || 
    t.includes('iphone') || 
    t.includes('samsung') || 
    t.includes('oneplus') || 
    t.includes('redmi') || 
    t.includes('realme')
  ) {
    // Premium smartphone
    imageUrl = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80';
  } else if (
    t.includes('headphone') || 
    t.includes('earphone') || 
    t.includes('earbuds') || 
    t.includes('audio') || 
    t.includes('soundbar') || 
    t.includes('speaker') || 
    s.includes('boat') || 
    s.includes('jbl') || 
    s.includes('sony')
  ) {
    // Sleek headphones
    imageUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80';
  } else if (
    t.includes('shoe') || 
    t.includes('sneaker') || 
    t.includes('footwear') || 
    t.includes('slipper') || 
    s.includes('nike') || 
    s.includes('puma') || 
    s.includes('adidas') || 
    s.includes('bata')
  ) {
    // Stylish red athletic sneaker
    imageUrl = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80';
  } else if (
    t.includes('flight') || 
    t.includes('airline') || 
    t.includes('ticket') || 
    t.includes('travel') || 
    t.includes('hotel') || 
    t.includes('booking') || 
    t.includes('stay') || 
    t.includes('holiday') || 
    s.includes('makemytrip') || 
    s.includes('yatra') || 
    s.includes('booking.com') || 
    c.includes('travel')
  ) {
    // Travel suitcase / luggage bag
    imageUrl = 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=400&auto=format&fit=crop&q=80';
  } else if (
    t.includes('pizza') || 
    t.includes('burger') || 
    t.includes('food') || 
    t.includes('dining') || 
    t.includes('restaurant') || 
    t.includes('meal') || 
    s.includes('swiggy') || 
    s.includes('zomato') || 
    s.includes('domino') || 
    c.includes('food')
  ) {
    // Delicious fresh pizza
    imageUrl = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80';
  } else if (
    t.includes('makeup') || 
    t.includes('beauty') || 
    t.includes('lipstick') || 
    t.includes('skincare') || 
    t.includes('perfume') || 
    t.includes('cosmetics') || 
    s.includes('nykaa') || 
    s.includes('mamaearth') || 
    c.includes('beauty')
  ) {
    // Cosmetic & beauty items
    imageUrl = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&auto=format&fit=crop&q=80';
  } else if (
    t.includes('appliance') || 
    t.includes('ac') || 
    t.includes('fridge') || 
    t.includes('oven') || 
    t.includes('vacuum') || 
    t.includes('iron') || 
    t.includes('kettle') || 
    s.includes('havells') || 
    s.includes('philips') || 
    s.includes('bajaj') || 
    s.includes('prestige') || 
    s.includes('croma')
  ) {
    // Modern kitchen appliance (blender/airfryer)
    imageUrl = 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400&auto=format&fit=crop&q=80';
  } else if (
    c.includes('fashion') || 
    t.includes('clothing') || 
    t.includes('shirt') || 
    t.includes('t-shirt') || 
    t.includes('jeans') || 
    t.includes('kurtis') || 
    t.includes('saree') || 
    s.includes('myntra') || 
    s.includes('ajio')
  ) {
    // Premium shopping bags / apparel
    imageUrl = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&auto=format&fit=crop&q=80';
  } else if (c.includes('electronics')) {
    // General electronics gadget
    imageUrl = 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&auto=format&fit=crop&q=80';
  }

  // 2. Determine gradients and theme matching merchant/category branding
  let gradient = 'from-slate-700 via-slate-800 to-slate-900';
  let btnBg = 'bg-white text-slate-950 hover:bg-white/90';
  let badgeBg = 'bg-white/20 text-white backdrop-blur-md';

  if (s.includes('hp') || s.includes('dell') || s.includes('samsung') || s.includes('intel') || s.includes('reliance')) {
    gradient = 'from-blue-600 via-blue-700 to-indigo-900';
    btnBg = 'bg-white text-indigo-950 hover:bg-white/90';
  } else if (s.includes('havells') || s.includes('philips') || s.includes('amazon') || s.includes('oneplus')) {
    gradient = 'from-amber-500 via-orange-500 to-red-600';
    btnBg = 'bg-white text-orange-950 hover:bg-white/90';
  } else if (s.includes('acer') || s.includes('lenovo') || s.includes('flipkart') || s.includes('boat')) {
    gradient = 'from-emerald-600 via-teal-700 to-emerald-950';
    btnBg = 'bg-white text-teal-950 hover:bg-white/90';
  } else if (s.includes('myntra') || s.includes('ajio') || s.includes('nykaa') || c.includes('fashion') || c.includes('beauty')) {
    gradient = 'from-rose-500 via-pink-600 to-purple-800';
    btnBg = 'bg-white text-rose-950 hover:bg-white/90';
  } else if (s.includes('makemytrip') || s.includes('yatra') || s.includes('booking') || c.includes('travel')) {
    gradient = 'from-cyan-500 via-sky-600 to-blue-800';
    btnBg = 'bg-white text-cyan-950 hover:bg-white/90';
  } else if (s.includes('swiggy') || s.includes('zomato') || c.includes('food')) {
    gradient = 'from-amber-400 via-orange-500 to-rose-600';
    btnBg = 'bg-white text-orange-950 hover:bg-white/90';
  }

  return { gradient, btnBg, badgeBg, imageUrl, textColor: 'text-white' };
}
