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
export function getDealTheme(title: string, storeName: string, categoryName?: string, isAiProp?: boolean): DealTheme {
  const t = title.toLowerCase();
  const s = storeName.toLowerCase();
  const c = categoryName?.toLowerCase() || '';

  const isAi =
    isAiProp ||
    /\bai\b/.test(t) ||
    t.includes('chatgpt') ||
    t.includes('gpt') ||
    t.includes('midjourney') ||
    t.includes('jasper') ||
    t.includes('saas') ||
    t.includes('copilot') ||
    s.includes('browse ai') ||
    s.includes('ai') ||
    c.includes('ai') ||
    c.includes('saas') ||
    c.includes('ai-tools');

  // 1. Determine Image URL based on keywords
  // We use high-quality, transparent or clean background Unsplash images representing the items
  let imageUrl = '';
  
  // First pass: Match based on specific item keywords in title or category name
  if (isAi) {
    imageUrl = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80';
  } else if (
    t.includes('playstation') || 
    t.includes('ps5') || 
    t.includes('ps4') || 
    t.includes('xbox') || 
    t.includes('nintendo') || 
    t.includes('gaming') || 
    t.includes('console') || 
    t.includes('controller') || 
    t.includes('joystick') || 
    t.includes('game') ||
    t.includes('gamer')
  ) {
    imageUrl = 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&auto=format&fit=crop&q=80';
  } else if (
    t.includes('bedsheet') || 
    t.includes('sheet') || 
    t.includes('pillow') || 
    t.includes('blanket') || 
    t.includes('mattress') || 
    t.includes('linen') || 
    t.includes('decor') || 
    t.includes('curtain') || 
    t.includes('towel') ||
    t.includes('cushion') ||
    t.includes('bedding') ||
    c.includes('decor') ||
    c.includes('furniture')
  ) {
    imageUrl = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&auto=format&fit=crop&q=80';
  } else if (
    t.includes('tv') || 
    t.includes('television') || 
    t.includes('smart tv') || 
    t.includes('led tv') || 
    t.includes('screen') || 
    t.includes('monitor')
  ) {
    imageUrl = 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400&auto=format&fit=crop&q=80';
  } else if (
    t.includes('washing machine') || 
    t.includes('washer') || 
    t.includes('dryer') || 
    t.includes('laundry') || 
    t.includes('washing')
  ) {
    imageUrl = 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&auto=format&fit=crop&q=80';
  } else if (
    t.includes('ac') || 
    t.includes('air conditioner') || 
    t.includes('cooler') || 
    t.includes('fan')
  ) {
    imageUrl = 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop&q=80';
  } else if (
    t.includes('laptop') || 
    t.includes('macbook') || 
    t.includes('computer') || 
    t.includes('pc')
  ) {
    imageUrl = 'https://images.unsplash.com/photo-1496181130204-755241524eab?w=400&auto=format&fit=crop&q=80';
  } else if (
    t.includes('phone') || 
    t.includes('mobile') || 
    t.includes('iphone')
  ) {
    imageUrl = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80';
  } else if (
    t.includes('headphone') || 
    t.includes('earphone') || 
    t.includes('earbuds') || 
    t.includes('audio') || 
    t.includes('soundbar') || 
    t.includes('speaker')
  ) {
    imageUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80';
  } else if (
    t.includes('shoe') || 
    t.includes('sneaker') || 
    t.includes('footwear') || 
    t.includes('slipper') ||
    t.includes('sandal')
  ) {
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
    c.includes('travel')
  ) {
    imageUrl = 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=400&auto=format&fit=crop&q=80';
  } else if (
    t.includes('pizza') || 
    t.includes('burger') || 
    t.includes('food') || 
    t.includes('dining') || 
    t.includes('restaurant') || 
    t.includes('meal') || 
    c.includes('food')
  ) {
    imageUrl = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80';
  } else if (
    t.includes('makeup') || 
    t.includes('beauty') || 
    t.includes('lipstick') || 
    t.includes('skincare') || 
    t.includes('perfume') || 
    t.includes('cosmetics') || 
    c.includes('beauty')
  ) {
    imageUrl = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&auto=format&fit=crop&q=80';
  } else if (t.includes('vacuum')) {
    imageUrl = 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400&auto=format&fit=crop&q=80';
  } else if (
    t.includes('appliance') || 
    t.includes('fridge') || 
    t.includes('refrigerator') || 
    t.includes('oven') || 
    t.includes('iron') || 
    t.includes('kettle')
  ) {
    imageUrl = 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&auto=format&fit=crop&q=80';
  } else if (
    t.includes('backpack') || 
    t.includes('bag') || 
    t.includes('luggage') || 
    t.includes('purse') || 
    t.includes('handbag')
  ) {
    imageUrl = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&auto=format&fit=crop&q=80';
  } else if (
    t.includes('credit card') || 
    t.includes('bank') || 
    t.includes('finance') || 
    t.includes('loan') || 
    t.includes('cashback') || 
    t.includes('visa') || 
    t.includes('mastercard') || 
    t.includes('paytm') || 
    t.includes('gpay')
  ) {
    imageUrl = 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&auto=format&fit=crop&q=80';
  } else if (
    t.includes('book') || 
    t.includes('kindle') || 
    t.includes('novel') || 
    t.includes('ebook') || 
    t.includes('course') || 
    t.includes('learn') || 
    t.includes('study') || 
    t.includes('education') || 
    c.includes('books') || 
    c.includes('education')
  ) {
    imageUrl = 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&auto=format&fit=crop&q=80';
  } else if (
    t.includes('toy') || 
    t.includes('kids') || 
    t.includes('baby') || 
    t.includes('stroller') || 
    t.includes('diaper') || 
    t.includes('toddler') || 
    c.includes('kids') || 
    c.includes('baby')
  ) {
    imageUrl = 'https://images.unsplash.com/photo-1515488042361-404e9250afef?w=400&auto=format&fit=crop&q=80';
  } else if (
    t.includes('grocery') || 
    t.includes('groceries') || 
    t.includes('fresh') || 
    t.includes('vegetable') || 
    t.includes('milk') || 
    s.includes('bigbasket') || 
    s.includes('blinkit') || 
    s.includes('instamart')
  ) {
    imageUrl = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80';
  } else if (
    t.includes('health') || 
    t.includes('wellness') || 
    t.includes('supplements') || 
    t.includes('vitamins') || 
    t.includes('protein') || 
    t.includes('medicine') || 
    t.includes('fitness') || 
    t.includes('gym') || 
    t.includes('yoga') || 
    c.includes('health') || 
    c.includes('fitness')
  ) {
    imageUrl = 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&auto=format&fit=crop&q=80';
  } else if (
    t.includes('hosting') || 
    t.includes('domain') || 
    t.includes('server') || 
    t.includes('vps') || 
    t.includes('coding') || 
    t.includes('developer')
  ) {
    imageUrl = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop&q=80';
  } else if (
    t.includes('men') || 
    t.includes('mens') || 
    t.includes('gentleman') || 
    t.includes('suit') || 
    t.includes('trimmer') || 
    t.includes('shaver')
  ) {
    imageUrl = 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400&auto=format&fit=crop&q=80';
  } else if (
    t.includes('watch') || 
    t.includes('smartwatch') || 
    t.includes('wearable') || 
    t.includes('fitbit')
  ) {
    imageUrl = 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400&auto=format&fit=crop&q=80';
  } else if (
    c.includes('fashion') || 
    t.includes('clothing') || 
    t.includes('shirt') || 
    t.includes('t-shirt') || 
    t.includes('jeans') || 
    t.includes('kurtis') || 
    t.includes('saree')
  ) {
    imageUrl = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&auto=format&fit=crop&q=80';
  } else if (c.includes('electronics')) {
    imageUrl = 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&auto=format&fit=crop&q=80';
  }

  // Second pass: If no specific item matched, fall back to store name associations
  if (!imageUrl) {
    if (
      s.includes('hp') || 
      s.includes('dell') || 
      s.includes('lenovo') || 
      s.includes('acer') || 
      s.includes('asus')
    ) {
      imageUrl = 'https://images.unsplash.com/photo-1496181130204-755241524eab?w=400&auto=format&fit=crop&q=80';
    } else if (
      s.includes('phone') || 
      s.includes('samsung') || 
      s.includes('oneplus') || 
      s.includes('redmi') || 
      s.includes('realme')
    ) {
      imageUrl = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80';
    } else if (
      s.includes('boat') || 
      s.includes('jbl') || 
      s.includes('sony')
    ) {
      imageUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80';
    } else if (
      s.includes('nike') || 
      s.includes('puma') || 
      s.includes('adidas') || 
      s.includes('bata') || 
      s.includes('campus') || 
      s.includes('crocs')
    ) {
      imageUrl = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80';
    } else if (
      s.includes('makemytrip') || 
      s.includes('yatra') || 
      s.includes('booking.com')
    ) {
      imageUrl = 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=400&auto=format&fit=crop&q=80';
    } else if (
      s.includes('swiggy') || 
      s.includes('zomato') || 
      s.includes('domino')
    ) {
      imageUrl = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80';
    } else if (
      s.includes('nykaa') || 
      s.includes('mamaearth') || 
      s.includes('bella-vita')
    ) {
      imageUrl = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&auto=format&fit=crop&q=80';
    } else if (
      s.includes('havells') || 
      s.includes('philips') || 
      s.includes('bajaj') || 
      s.includes('prestige') || 
      s.includes('croma')
    ) {
      imageUrl = 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&auto=format&fit=crop&q=80';
    } else if (
      s.includes('myntra') || 
      s.includes('ajio') || 
      s.includes('meesho') || 
      s.includes('bewakoof')
    ) {
      imageUrl = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&auto=format&fit=crop&q=80';
    } else {
      imageUrl = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&auto=format&fit=crop&q=80';
    }
  }

  // 2. Determine gradients and theme matching merchant/category branding
  let gradient = 'from-slate-700 via-slate-800 to-slate-900';
  let btnBg = 'bg-white text-slate-950 hover:bg-white/90';
  let badgeBg = 'bg-white/20 text-white backdrop-blur-md';

  if (isAi) {
    gradient = 'from-violet-600 via-indigo-700 to-indigo-950';
    btnBg = 'bg-white text-indigo-950 hover:bg-indigo-50';
    badgeBg = 'bg-violet-500/30 text-violet-100 border border-violet-500/20 backdrop-blur-md';
  } else if (
    t.includes('playstation') || 
    t.includes('ps5') || 
    t.includes('ps4') || 
    t.includes('xbox') || 
    t.includes('gaming')
  ) {
    gradient = 'from-slate-800 via-slate-900 to-zinc-950';
    btnBg = 'bg-white text-zinc-950 hover:bg-zinc-50';
    badgeBg = 'bg-slate-700/30 text-slate-100 border border-slate-700/20 backdrop-blur-md';
  } else if (
    t.includes('bedsheet') || 
    t.includes('sheet') || 
    t.includes('pillow') || 
    t.includes('blanket')
  ) {
    gradient = 'from-purple-700 via-pink-600 to-rose-700';
    btnBg = 'bg-white text-purple-950 hover:bg-purple-50';
    badgeBg = 'bg-purple-500/30 text-purple-100 border border-purple-500/20 backdrop-blur-md';
  } else if (s.includes('hp') || s.includes('dell') || s.includes('samsung') || s.includes('intel') || s.includes('reliance')) {
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
