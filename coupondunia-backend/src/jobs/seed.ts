import { sql } from 'drizzle-orm';
import { createDb } from '../db';
import { categories, stores, coupons } from '../db/schema';

// ─── Data Definitions ────────────────────────────────────────────────────────

const SEED_CATEGORIES = [
  { name: 'Fashion', slug: 'fashion', icon_url: null },
  { name: 'Electronics', slug: 'electronics', icon_url: null },
  { name: 'Food', slug: 'food', icon_url: null },
  { name: 'Beauty', slug: 'beauty', icon_url: null },
  { name: 'Travel', slug: 'travel', icon_url: null },
  { name: 'Grocery', slug: 'grocery', icon_url: null },
  { name: 'Health', slug: 'health', icon_url: null },
  { name: 'Home & Living', slug: 'home-living', icon_url: null },
];

const SEED_STORES = [
  {
    name: 'Myntra',
    slug: 'myntra',
    website_url: 'https://www.myntra.com',
    affiliate_url: 'CUELINKS_AFFILIATE_URL_MYNTRA',
    cashback_rate: 'Up to 10%',
    category: 'fashion',
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Myntra_Logo.png',
    banner_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
    description: "India's largest fashion platform with brands like H&M, Zara, Nike, Puma",
    coupons: [
      { title: "Flat 30% Off on Top Brands", type: "code", code: "MYNTRA30", discount_value: "30%", is_verified: true, is_featured: true },
      { title: "Extra 40% Off on Women's Clothing", type: "code", code: "STYLE40", discount_value: "40%", is_verified: true },
      { title: "Up to 70% Off in End of Season Sale", type: "deal", discount_value: "70%", is_featured: true },
      { title: "Flat ₹200 Off on Orders Above ₹999", type: "code", code: "SAVE200", discount_value: "₹200" },
      { title: "10% Cashback on Axis Bank Cards", type: "cashback", discount_value: "10%" },
      { title: "Buy 3 Get 1 Free on Accessories", type: "deal", discount_value: "Buy 3 Get 1" },
      { title: "Extra 20% Off on First App Order", type: "code", code: "FIRSTAPP", discount_value: "20%" },
      { title: "Flat 50% Off on Footwear", type: "deal", discount_value: "50%" },
      { title: "₹300 Off on Ethnic Wear Above ₹1499", type: "code", code: "ETHNIC300", discount_value: "₹300" },
      { title: "Free Shipping on All Orders Above ₹799", type: "deal", discount_value: "Free Shipping" },
      { title: "Up to 60% Off on Sports Brands", type: "deal", discount_value: "60%" },
      { title: "Flat 25% Off on Kids Clothing", type: "code", code: "KIDS25", discount_value: "25%" },
      { title: "Extra ₹500 Off on Premium Brands", type: "code", code: "PREMIUM500", discount_value: "₹500" },
      { title: "Up to 80% Off on Winter Clearance", type: "deal", discount_value: "80%" },
      { title: "15% Cashback on HDFC Credit Cards", type: "cashback", discount_value: "15%" },
      { title: "Flat 35% Off on Handbags and Wallets", type: "code", code: "BAG35", discount_value: "35%" },
      { title: "New User Special: 50% Off First Order", type: "code", code: "NEWUSER50", discount_value: "50%", is_exclusive: true },
      { title: "Up to 45% Off on Watches", type: "deal", discount_value: "45%" },
      { title: "Extra 10% Off with Paytm Wallet", type: "cashback", discount_value: "10%" },
      { title: "Flat 60% Off on Home and Living", type: "deal", discount_value: "60%" },
    ]
  },
  {
    name: 'Flipkart',
    slug: 'flipkart',
    website_url: 'https://www.flipkart.com',
    affiliate_url: 'CUELINKS_AFFILIATE_URL_FLIPKART',
    cashback_rate: 'Up to 12%',
    category: 'electronics',
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Flipkart_logo.png',
    banner_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
    description: "India's leading e-commerce marketplace for electronics, fashion, and groceries",
    coupons: [
      { title: "Flat 10% Off on Electronics", type: "code", code: "FKELEC10", discount_value: "10%", is_verified: true, is_featured: true },
      { title: "Up to 80% Off in Big Billion Days Sale", type: "deal", discount_value: "80%", is_featured: true },
      { title: "Extra ₹1000 Off on Mobiles Above ₹10000", type: "code", code: "MOBILE1000", discount_value: "₹1000" },
      { title: "5% Cashback on Flipkart Axis Bank Card", type: "cashback", code: null, discount_value: "5%", is_verified: true },
      { title: "Flat 20% Off on Laptops", type: "code", code: "LAPTOP20", discount_value: "20%" },
      { title: "Free Delivery on First Order", type: "deal", discount_value: "Free Delivery" },
      { title: "Up to 70% Off on Fashion and Clothing", type: "deal", discount_value: "70%" },
      { title: "Extra 15% Off on Home Appliances", type: "code", code: "HOME15", discount_value: "15%" },
      { title: "₹500 Off on TVs Above ₹20000", type: "code", code: "TV500", discount_value: "₹500" },
      { title: "Up to 60% Off on Books and Stationery", type: "deal", discount_value: "60%" },
      { title: "Flat 8% Off on Groceries", type: "code", code: "GROCERY8", discount_value: "8%" },
      { title: "Extra 25% Off on Toys and Games", type: "deal", discount_value: "25%" },
      { title: "10% Off on Furniture Orders", type: "code", code: "FURN10", discount_value: "10%" },
      { title: "New User: Flat ₹400 Off First Order", type: "code", code: "FKNEW400", discount_value: "₹400", is_exclusive: true },
      { title: "Up to 40% Off on Sports Equipment", type: "deal", discount_value: "40%" },
      { title: "Flat 12% Off on Beauty Products", type: "code", code: "BEAUTY12", discount_value: "12%" },
      { title: "Extra ₹2000 Off on ACs and Refrigerators", type: "code", code: "APPLIANCE2K", discount_value: "₹2000" },
      { title: "20% Cashback on SBI Cards (Max ₹750)", type: "cashback", discount_value: "20%" },
      { title: "Flat 30% Off on Headphones and Earbuds", type: "deal", discount_value: "30%" },
      { title: "Up to 50% Off on Cameras and Accessories", type: "deal", discount_value: "50%" },
    ]
  },
  {
    name: 'Amazon India',
    slug: 'amazon-india',
    website_url: 'https://www.amazon.in',
    affiliate_url: 'AMAZON_ASSOCIATES_AFFILIATE_URL',
    cashback_rate: 'Up to 8%',
    category: 'electronics',
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/600px-Amazon_logo.svg.png',
    banner_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
    description: 'Amazon India — shop electronics, books, fashion, and more with fast delivery',
    coupons: [
      { title: "Up to 70% Off in Great Indian Festival Sale", type: "deal", discount_value: "70%", is_featured: true },
      { title: "10% Instant Discount on Amazon Pay ICICI Card", type: "cashback", code: null, discount_value: "10%", is_verified: true },
      { title: "Flat ₹500 Off on Echo Devices", type: "deal", discount_value: "₹500" },
      { title: "Up to 40% Off on Smartphones", type: "deal", discount_value: "40%" },
      { title: "Extra 15% Off on Fashion for Prime Members", type: "code", code: "PRIMESTYLE", discount_value: "15%" },
      { title: "Free One-Day Delivery on Prime Orders", type: "deal", discount_value: "Free Delivery" },
      { title: "Up to 60% Off on Home and Kitchen", type: "deal", discount_value: "60%" },
      { title: "Flat 20% Off on Laptops and Computers", type: "deal", discount_value: "20%" },
      { title: "₹300 Off on Books Orders Above ₹999", type: "code", code: "BOOKS300", discount_value: "₹300" },
      { title: "Up to 50% Off on Baby Products", type: "deal", discount_value: "50%" },
      { title: "Extra 5% Off with Amazon Pay Balance", type: "cashback", discount_value: "5%" },
      { title: "Flat 30% Off on Watches and Sunglasses", type: "deal", discount_value: "30%" },
      { title: "Up to 80% Off on Daily Deals", type: "deal", discount_value: "80%" },
      { title: "New User: ₹150 Off First App Order", type: "code", code: "AMZNEW150", discount_value: "₹150", is_exclusive: true },
      { title: "Up to 45% Off on Sports and Fitness", type: "deal", discount_value: "45%" },
      { title: "15% Off on Health and Personal Care", type: "deal", discount_value: "15%" },
      { title: "Flat ₹1000 Off on Televisions Above ₹15000", type: "code", code: "TV1000", discount_value: "₹1000" },
      { title: "Up to 35% Off on Grocery and Gourmet", type: "deal", discount_value: "35%" },
      { title: "Extra 20% Off on Kindle eBooks", type: "deal", discount_value: "20%" },
      { title: "Flat 25% Off on Luggage and Travel Bags", type: "deal", discount_value: "25%" },
    ]
  },
  {
    name: 'Swiggy',
    slug: 'swiggy',
    website_url: 'https://www.swiggy.com',
    affiliate_url: 'SWIGGY_AFFILIATE_URL',
    cashback_rate: 'Up to 20%',
    category: 'food',
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Swiggy_logo.png',
    banner_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
    description: 'Swiggy — order food online from top restaurants with fast delivery',
    coupons: [
      { title: "Flat 60% Off on First Order (Max ₹120)", type: "code", code: "SWIGNEW", discount_value: "60%", is_verified: true, is_exclusive: true, is_featured: true },
      { title: "Flat 40% Off on Orders Above ₹199", type: "code", code: "SWIG40", discount_value: "40%" },
      { title: "Free Delivery on All Swiggy One Orders", type: "deal", discount_value: "Free Delivery" },
      { title: "Extra 20% Off on Instamart Grocery Orders", type: "code", code: "INSTA20", discount_value: "20%" },
      { title: "Flat ₹75 Off on Orders Above ₹299", type: "code", code: "SAVE75", discount_value: "₹75" },
      { title: "20% Cashback on HDFC Bank Cards", type: "cashback", discount_value: "20%" },
      { title: "Flat 30% Off on Weekend Orders", type: "code", code: "WEEKEND30", discount_value: "30%" },
      { title: "₹100 Off on Lunch Orders Between 11AM-3PM", type: "code", code: "LUNCH100", discount_value: "₹100" },
      { title: "Extra 25% Off on Biryani Orders", type: "deal", discount_value: "25%" },
      { title: "Flat 50% Off Using Paytm (Max ₹100)", type: "cashback", discount_value: "50%" },
      { title: "Free Swiggy One Membership for 3 Months", type: "deal", discount_value: "Free Membership", is_featured: true },
      { title: "₹50 Off on Every Order This Week", type: "code", code: "FLAT50", discount_value: "₹50" },
      { title: "15% Off on Desserts and Shakes", type: "deal", discount_value: "15%" },
      { title: "Flat 35% Off on Pizza Orders", type: "code", code: "PIZZA35", discount_value: "35%" },
      { title: "Extra ₹120 Off on Orders Above ₹500", type: "code", code: "BIG120", discount_value: "₹120" },
      { title: "10% Cashback on Axis Bank Debit Cards", type: "cashback", discount_value: "10%" },
      { title: "Flat 45% Off on Chinese Food Orders", type: "deal", discount_value: "45%" },
      { title: "Free Dessert on Orders Above ₹399", type: "deal", discount_value: "Free Dessert" },
      { title: "₹80 Off on Healthy Food Orders", type: "code", code: "HEALTH80", discount_value: "₹80" },
      { title: "20% Off on Late Night Orders (10PM-2AM)", type: "code", code: "NIGHT20", discount_value: "20%" },
    ]
  },
  {
    name: 'Zomato',
    slug: 'zomato',
    website_url: 'https://www.zomato.com',
    affiliate_url: 'ZOMATO_AFFILIATE_URL',
    cashback_rate: 'Up to 15%',
    category: 'food',
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/7/75/Zomato_logo.png',
    banner_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80',
    description: 'Zomato — discover restaurants, order food online, read reviews',
    coupons: [
      { title: "Flat 50% Off on First 5 Orders (Max ₹100)", type: "code", code: "ZOMONEW", discount_value: "50%", is_exclusive: true, is_featured: true },
      { title: "Flat 30% Off on Orders Above ₹199", type: "code", code: "ZOM30", discount_value: "30%", is_verified: true },
      { title: "Free Delivery with Zomato Gold", type: "deal", discount_value: "Free Delivery" },
      { title: "Extra 20% Off on Breakfast Orders Before 11AM", type: "code", code: "BREAKFAST20", discount_value: "20%" },
      { title: "₹100 Off on Orders Above ₹399", type: "code", code: "ZOM100", discount_value: "₹100" },
      { title: "15% Cashback on Kotak Bank Cards", type: "cashback", discount_value: "15%" },
      { title: "Flat 40% Off on South Indian Food", type: "deal", discount_value: "40%" },
      { title: "Extra ₹75 Off Using PhonePe Wallet", type: "cashback", discount_value: "₹75" },
      { title: "Flat 25% Off on North Indian Cuisine", type: "deal", discount_value: "25%" },
      { title: "Free Zomato Pro Membership for 1 Month", type: "deal", discount_value: "Free Membership" },
      { title: "₹60 Off on Lunch Orders", type: "code", code: "LUNCH60", discount_value: "₹60" },
      { title: "20% Off on Burger Orders", type: "deal", discount_value: "20%" },
      { title: "Flat 35% Off on Orders from New Restaurants", type: "deal", discount_value: "35%" },
      { title: "Extra 10% Off with Zomato Wallet", type: "cashback", discount_value: "10%" },
      { title: "₹150 Off on Orders Above ₹600", type: "code", code: "ZOM150", discount_value: "₹150" },
      { title: "Flat 45% Off on Desserts", type: "deal", discount_value: "45%" },
      { title: "25% Off on Healthy and Diet Food", type: "deal", discount_value: "25%" },
      { title: "Extra ₹200 Off on Weekend Dinner Orders", type: "code", code: "DINNER200", discount_value: "₹200" },
      { title: "Flat 60% Off on Midnight Snack Orders", type: "code", code: "MIDNIGHT60", discount_value: "60%" },
      { title: "10% Cashback on SBI Credit Cards", type: "cashback", discount_value: "10%" },
    ]
  },
  {
    name: 'Nykaa',
    slug: 'nykaa',
    website_url: 'https://www.nykaa.com',
    affiliate_url: 'CUELINKS_AFFILIATE_URL_NYKAA',
    cashback_rate: 'Up to 10%',
    category: 'beauty',
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Nykaa_Logo.svg/512px-Nykaa_Logo.svg.png',
    banner_url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=80',
    description: "Nykaa — India's premier beauty and wellness destination",
    coupons: [
      { title: "Flat 20% Off on Luxury Brands", type: "code", code: "NYK20", discount_value: "20%", is_verified: true, is_featured: true },
      { title: "Extra 15% Off on Skincare Products", type: "code", code: "SKIN15", discount_value: "15%" },
      { title: "Up to 50% Off in Nykaa Sale", type: "deal", discount_value: "50%", is_featured: true },
      { title: "₹200 Off on Orders Above ₹999", type: "code", code: "NYK200", discount_value: "₹200" },
      { title: "Free Gift on Orders Above ₹1499", type: "deal", discount_value: "Free Gift" },
      { title: "10% Cashback on Nykaa Credit Card", type: "cashback", discount_value: "10%" },
      { title: "Flat 25% Off on Lipsticks and Lip Care", type: "deal", discount_value: "25%" },
      { title: "Extra 30% Off on Hair Care Products", type: "code", code: "HAIR30", discount_value: "30%" },
      { title: "₹500 Off on Premium Fragrances", type: "code", code: "FRAGRANCE500", discount_value: "₹500" },
      { title: "Up to 40% Off on Men's Grooming", type: "deal", discount_value: "40%" },
      { title: "New User: Flat 30% Off First Order", type: "code", code: "NYKNEW30", discount_value: "30%", is_exclusive: true },
      { title: "Free Shipping on All Orders Above ₹499", type: "deal", discount_value: "Free Shipping" },
      { title: "15% Off on Organic and Natural Products", type: "deal", discount_value: "15%" },
      { title: "Extra ₹300 Off on Face Serums", type: "code", code: "SERUM300", discount_value: "₹300" },
      { title: "Up to 60% Off on Nail Art Supplies", type: "deal", discount_value: "60%" },
      { title: "Flat 20% Off on Sunscreen Products", type: "deal", discount_value: "20%" },
      { title: "Extra 10% Off on International Brands", type: "code", code: "INTL10", discount_value: "10%" },
      { title: "₹150 Off on Makeup Brushes Set", type: "code", code: "BRUSH150", discount_value: "₹150" },
      { title: "Up to 35% Off on Body Care Range", type: "deal", discount_value: "35%" },
      { title: "12% Cashback on HDFC Bank Cards", type: "cashback", discount_value: "12%" },
    ]
  },
  {
    name: 'MakeMyTrip',
    slug: 'makemytrip',
    website_url: 'https://www.makemytrip.com',
    affiliate_url: 'CUELINKS_AFFILIATE_URL_MMT',
    cashback_rate: 'Up to ₹600 per booking',
    category: 'travel',
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/MakeMyTrip_Logo.svg/512px-MakeMyTrip_Logo.svg.png',
    banner_url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80',
    description: 'MakeMyTrip — book flights, hotels, holiday packages across India and worldwide',
    coupons: [
      { title: "Flat ₹1500 Off on Domestic Flight Bookings", type: "code", code: "MMTFLY", discount_value: "₹1500", is_verified: true, is_featured: true },
      { title: "Up to 40% Off on Hotel Bookings", type: "deal", discount_value: "40%", is_featured: true },
      { title: "Extra ₹2000 Off on International Flights", type: "code", code: "INTFLY2K", discount_value: "₹2000" },
      { title: "Flat 25% Off on Holiday Packages", type: "code", code: "HOLIDAY25", discount_value: "25%" },
      { title: "₹600 Instant Discount on First Hotel Booking", type: "code", code: "MMTHOTEL", discount_value: "₹600", is_exclusive: true },
      { title: "15% Cashback on ICICI Bank Cards", type: "cashback", discount_value: "15%" },
      { title: "Flat ₹800 Off on Train + Hotel Combo", type: "deal", discount_value: "₹800" },
      { title: "Up to 30% Off on Bus Bookings", type: "deal", discount_value: "30%" },
      { title: "Extra ₹1000 Off on Rajasthan Tour Packages", type: "code", code: "RAJASTHAN1K", discount_value: "₹1000" },
      { title: "Free Cab Booking with Flight + Hotel Combo", type: "deal", discount_value: "Free Cab" },
      { title: "₹500 Off on Goa Hotel Bookings", type: "code", code: "GOA500", discount_value: "₹500" },
      { title: "10% Off on Last-Minute Hotel Deals", type: "deal", discount_value: "10%" },
      { title: "Flat ₹3000 Off on Maldives Packages", type: "code", code: "MALDIVES3K", discount_value: "₹3000" },
      { title: "Extra 20% Off on Weekend Getaways", type: "deal", discount_value: "20%" },
      { title: "₹200 Off on Cab Bookings Above ₹1000", type: "code", code: "CAB200", discount_value: "₹200" },
      { title: "Up to 35% Off on Luxury Hotels", type: "deal", discount_value: "35%" },
      { title: "12% Cashback on Axis Bank Cards", type: "cashback", discount_value: "12%" },
      { title: "Flat ₹750 Off on Kerala Tour Packages", type: "code", code: "KERALA750", discount_value: "₹750" },
      { title: "Free Travel Insurance on Package Bookings", type: "deal", discount_value: "Free Insurance" },
      { title: "₹1200 Off on Honeymoon Packages", type: "code", code: "HONEY1200", discount_value: "₹1200" },
    ]
  },
  {
    name: 'Ajio',
    slug: 'ajio',
    website_url: 'https://www.ajio.com',
    affiliate_url: 'CUELINKS_AFFILIATE_URL_AJIO',
    cashback_rate: 'Up to 12%',
    category: 'fashion',
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/AJIO_logo.svg/512px-AJIO_logo.svg.png',
    banner_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
    description: 'Ajio — curated fashion from top Indian and international brands',
    coupons: [
      { title: "Flat 30% Off Sitewide", type: "code", code: "AJIO30", discount_value: "30%", is_verified: true, is_featured: true },
      { title: "Extra 40% Off on Western Wear", type: "deal", discount_value: "40%" },
      { title: "Up to 70% Off in AJIO Big Bold Sale", type: "deal", discount_value: "70%", is_featured: true },
      { title: "₹300 Off on Orders Above ₹1299", type: "code", code: "AJIO300", discount_value: "₹300" },
      { title: "New User: 50% Off First Order", type: "code", code: "AJIONEW50", discount_value: "50%", is_exclusive: true },
      { title: "Extra 25% Off on Footwear", type: "code", code: "AJIOFOOT", discount_value: "25%" },
      { title: "Flat 20% Off on Ethnic Wear", type: "deal", discount_value: "20%" },
      { title: "₹500 Off on Premium Brand Orders Above ₹2499", type: "code", code: "PREMIUM500", discount_value: "₹500" },
      { title: "Up to 60% Off on Casual Wear", type: "deal", discount_value: "60%" },
      { title: "Free Shipping on All Orders", type: "deal", discount_value: "Free Shipping" },
      { title: "15% Cashback on RBL Bank Cards", type: "cashback", discount_value: "15%" },
      { title: "Flat 35% Off on Sportswear", type: "code", code: "SPORT35", discount_value: "35%" },
      { title: "Extra ₹200 Off on Denim Collection", type: "code", code: "DENIM200", discount_value: "₹200" },
      { title: "Up to 50% Off on Accessories", type: "deal", discount_value: "50%" },
      { title: "Flat 22% Off on Formal Wear", type: "code", code: "FORMAL22", discount_value: "22%" },
      { title: "₹400 Off on Handbags and Clutches", type: "code", code: "BAG400", discount_value: "₹400" },
      { title: "Extra 18% Off on Kids Fashion", type: "deal", discount_value: "18%" },
      { title: "10% Cashback on Kotak Bank Cards", type: "cashback", discount_value: "10%" },
      { title: "Up to 45% Off on Winter Collection", type: "deal", discount_value: "45%" },
      { title: "Flat 28% Off on Innerwear and Loungewear", type: "code", code: "INNER28", discount_value: "28%" },
    ]
  },
  {
    name: 'BigBasket',
    slug: 'bigbasket',
    website_url: 'https://www.bigbasket.com',
    affiliate_url: 'CUELINKS_AFFILIATE_URL_BIGBASKET',
    cashback_rate: 'Up to 8%',
    category: 'grocery',
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Bigbasket_Logo.svg/512px-Bigbasket_Logo.svg.png',
    banner_url: 'https://images.unsplash.com/photo-1543083503-087771d187cf?auto=format&fit=crop&w=1200&q=80',
    description: "BigBasket — India's largest online grocery and supermarket",
    coupons: [
      { title: "Flat 25% Off on First Order", type: "code", code: "BBNEW25", discount_value: "25%", is_verified: true, is_exclusive: true, is_featured: true },
      { title: "Extra 20% Off on Organic Products", type: "code", code: "ORGANIC20", discount_value: "20%" },
      { title: "₹150 Off on Orders Above ₹1000", type: "code", code: "BB150", discount_value: "₹150" },
      { title: "Free Delivery on Orders Above ₹600", type: "deal", discount_value: "Free Delivery" },
      { title: "Flat 15% Off on Fresh Fruits and Vegetables", type: "deal", discount_value: "15%" },
      { title: "10% Cashback on Amazon Pay", type: "cashback", discount_value: "10%" },
      { title: "Extra ₹200 Off on Household Essentials", type: "code", code: "HOME200", discount_value: "₹200" },
      { title: "Flat 30% Off on Personal Care Products", type: "deal", discount_value: "30%" },
      { title: "₹100 Off on Dairy and Breakfast Orders", type: "code", code: "DAIRY100", discount_value: "₹100" },
      { title: "Up to 40% Off on Gourmet and World Foods", type: "deal", discount_value: "40%" },
      { title: "Extra 12% Off on Snacks and Beverages", type: "deal", discount_value: "12%" },
      { title: "Flat 20% Off on Baby and Kids Products", type: "code", code: "BABY20", discount_value: "20%" },
      { title: "₹75 Off on Pet Care Products", type: "code", code: "PET75", discount_value: "₹75" },
      { title: "8% Cashback on ICICI Bank Cards", type: "cashback", discount_value: "8%" },
      { title: "Flat 18% Off on Cleaning Supplies", type: "deal", discount_value: "18%" },
      { title: "Extra ₹250 Off on Monthly Basket Orders", type: "code", code: "MONTHLY250", discount_value: "₹250" },
      { title: "Up to 35% Off on Bakery Products", type: "deal", discount_value: "35%" },
      { title: "Free Eggs Carton on Orders Above ₹800", type: "deal", discount_value: "Free Eggs" },
      { title: "₹120 Off on Cooking Oils and Ghee", type: "code", code: "OIL120", discount_value: "₹120" },
      { title: "Flat 22% Off on Health and Nutrition", type: "deal", discount_value: "22%" },
    ]
  },
  {
    name: 'Meesho',
    slug: 'meesho',
    website_url: 'https://www.meesho.com',
    affiliate_url: 'CUELINKS_AFFILIATE_URL_MEESHO',
    cashback_rate: 'Up to 15%',
    category: 'fashion',
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Meesho_Logo_2023.svg/512px-Meesho_Logo_2023.svg.png',
    banner_url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=80',
    description: 'Meesho — affordable fashion, home and kitchen products starting at ₹99',
    coupons: [
      { title: "Flat 30% Off Sitewide on First Order", type: "code", code: "MEESHO30", discount_value: "30%", is_verified: true, is_exclusive: true, is_featured: true },
      { title: "Extra 25% Off on Women's Kurtas", type: "deal", discount_value: "25%" },
      { title: "Free Delivery on All Orders", type: "deal", discount_value: "Free Delivery", is_featured: true },
      { title: "Up to 80% Off in Meesho Mega Sale", type: "deal", discount_value: "80%" },
      { title: "₹100 Off on Orders Above ₹399", type: "code", code: "MSH100", discount_value: "₹100" },
      { title: "Flat 40% Off on Sarees and Lehengas", type: "deal", discount_value: "40%" },
      { title: "Extra 20% Off on Home Decor Products", type: "code", code: "HOMEDEC20", discount_value: "20%" },
      { title: "15% Off on Kitchen and Dining", type: "deal", discount_value: "15%" },
      { title: "Flat 50% Off on Jewellery", type: "deal", discount_value: "50%" },
      { title: "₹200 Off on Orders Above ₹799", type: "code", code: "MSH200", discount_value: "₹200" },
      { title: "Extra 35% Off on Men's Shirts", type: "deal", discount_value: "35%" },
      { title: "Flat 45% Off on Kids Toys", type: "deal", discount_value: "45%" },
      { title: "New User: ₹250 Off First Order", type: "code", code: "MSHNEW250", discount_value: "₹250", is_exclusive: true },
      { title: "Up to 60% Off on Beauty Products", type: "deal", discount_value: "60%" },
      { title: "10% Cashback on UPI Payments", type: "cashback", discount_value: "10%" },
      { title: "Flat 28% Off on Sports and Fitness", type: "deal", discount_value: "28%" },
      { title: "₹150 Off on Stationery and School Supplies", type: "code", code: "SCHOOL150", discount_value: "₹150" },
      { title: "Extra 22% Off on Mobile Accessories", type: "deal", discount_value: "22%" },
      { title: "Flat 55% Off on Ethnic Wear Collection", type: "deal", discount_value: "55%" },
      { title: "12% Cashback on Paytm Payments", type: "cashback", discount_value: "12%" },
    ]
  }
];

// ─── Execution Logic ─────────────────────────────────────────────────────────

export async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  CouponDunia — Database Seeding Job');
  console.log(`  Started at: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════════════');

  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL environment variable is missing.');
    process.exit(1);
  }

  const db = createDb(process.env.DATABASE_URL);

  let categoriesSeeded = 0;
  let storesSeeded = 0;
  let couponsSeeded = 0;

  // 1. Seed Categories
  console.log('\n📁 Seeding Categories...');
  for (const cat of SEED_CATEGORIES) {
    try {
      await db.insert(categories).values({
        name: cat.name,
        slug: cat.slug,
        icon_url: cat.icon_url,
      }).onConflictDoNothing();
      categoriesSeeded++;
      console.log(`   ✓ Category: ${cat.name}`);
    } catch (err) {
      console.error(`   ❌ Failed to seed category: ${cat.name}`, err);
    }
  }

  // Fetch created categories to obtain their IDs
  const allCategories = await db.select({ id: categories.id, slug: categories.slug }).from(categories);
  const categoryMap = new Map(allCategories.map(c => [c.slug, c.id]));

  // 2. Seed Stores & Coupons
  console.log('\n🏪 Seeding Stores & Coupons...');
  for (const storeData of SEED_STORES) {
    console.log(`\n👉 Seeding Store: ${storeData.name}...`);
    try {
      const categoryId = categoryMap.get(storeData.category) || null;
      if (!categoryId) {
        console.warn(`   ⚠️ Category ID not found for slug "${storeData.category}". Skipping category association.`);
      }

      // Upsert Store
      const [insertedStore] = await db.insert(stores).values({
        name: storeData.name,
        slug: storeData.slug,
        website_url: storeData.website_url,
        affiliate_url: storeData.affiliate_url,
        cashback_rate: storeData.cashback_rate,
        description: storeData.description,
        category_id: categoryId,
        logo_url: storeData.logo_url || null,
        banner_url: storeData.banner_url || null,
      }).onConflictDoUpdate({
        target: stores.slug,
        set: {
          name: sql`EXCLUDED.name`,
          website_url: sql`EXCLUDED.website_url`,
          affiliate_url: sql`EXCLUDED.affiliate_url`,
          cashback_rate: sql`EXCLUDED.cashback_rate`,
          description: sql`EXCLUDED.description`,
          category_id: sql`EXCLUDED.category_id`,
          logo_url: sql`EXCLUDED.logo_url`,
          banner_url: sql`EXCLUDED.banner_url`,
          updated_at: sql`NOW()`,
        }
      }).returning();

      storesSeeded++;
      console.log(`   ✅ Store ${storeData.name} seeded (ID: ${insertedStore.id})`);

      // Seed Coupons for this Store
      let storeCouponsSeeded = 0;
      const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days from now

      for (const cp of storeData.coupons) {
        try {
          await db.insert(coupons).values({
            store_id: insertedStore.id,
            title: cp.title,
            code: cp.code || null,
            coupon_type: cp.type as 'code' | 'deal' | 'cashback',
            discount_value: cp.discount_value,
            affiliate_url: storeData.affiliate_url, // Seed coupons inherit store's affiliate URL
            source: 'manual',
            is_verified: cp.is_verified || false,
            is_exclusive: cp.is_exclusive || false,
            is_featured: cp.is_featured || false,
            expires_at: expiresAt,
          }).onConflictDoUpdate({
            target: [coupons.store_id, coupons.title],
            set: {
              code: sql`EXCLUDED.code`,
              coupon_type: sql`EXCLUDED.coupon_type`,
              discount_value: sql`EXCLUDED.discount_value`,
              affiliate_url: sql`EXCLUDED.affiliate_url`,
              is_verified: sql`EXCLUDED.is_verified`,
              is_exclusive: sql`EXCLUDED.is_exclusive`,
              is_featured: sql`EXCLUDED.is_featured`,
              expires_at: sql`EXCLUDED.expires_at`,
              updated_at: sql`NOW()`,
            }
          });
          storeCouponsSeeded++;
          couponsSeeded++;
        } catch (err) {
          console.error(`      ❌ Failed to seed coupon: "${cp.title}"`, err);
        }
      }
      console.log(`   ✅ Seeded ${storeCouponsSeeded} coupons for ${storeData.name}`);

    } catch (err) {
      console.error(`   ❌ Failed to seed store: ${storeData.name}`, err);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  Seeding Summary:');
  console.log(`  Seeded ${categoriesSeeded} categories, ${storesSeeded} stores, ${couponsSeeded} coupons`);
  console.log(`  Completed at: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════════════');
}

main().catch((error) => {
  console.error('Fatal error in seeding job:', error);
  process.exit(1);
});
