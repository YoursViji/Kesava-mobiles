// A small hand-rolled English / Telugu / Tamil switcher for the store's own wording (menus,
// headings, buttons, form labels). Product names, descriptions and specifications come from the
// database and stay in English. The choice is remembered in the browser and defaults to English
// on the server so there is no mismatch when the page hydrates.
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Lang = 'en' | 'te' | 'ta'

const dict = {
  nav_mobiles: { en: 'Buy Mobiles', te: 'మొబైల్స్ కొనుగోలు', ta: 'மொபைல் வாங்க' },
  nav_accessories: { en: 'Accessories', te: 'యాక్సెసరీస్', ta: 'அணிகலன்கள்' },
  nav_offers: { en: 'Offers', te: 'ఆఫర్లు', ta: 'சலுகைகள்' },
  nav_compare: { en: 'Compare', te: 'పోల్చండి', ta: 'ஒப்பிடு' },
  nav_service: { en: 'Book Service', te: 'సర్వీస్ బుక్ చేయండి', ta: 'சர்வீஸ் புக் செய்யுங்கள்' },
  nav_track: { en: 'Track Service', te: 'సర్వీస్ ట్రాక్ చేయండి', ta: 'சர்வீஸ் நிலை பார்க்க' },
  nav_contact: { en: 'Store & Contact', te: 'స్టోర్ & సంప్రదింపు', ta: 'கடை & தொடர்பு' },
  nav_exchange: { en: 'Exchange', te: 'ఎక్స్‌చేంజ్', ta: 'எக்ஸ்சேஞ்ச்' },
  nav_book_service_short: { en: 'Book a Service', te: 'సర్వీస్ బుక్ చేయండి', ta: 'சர்வீஸ் புக் செய்யுங்கள்' },
  nav_loyalty: { en: 'Rewards', te: 'రివార్డులు', ta: 'ரிவார்டுகள்' },

  add_to_cart: { en: 'Add to cart', te: 'కార్ట్‌కి జోడించండి', ta: 'கார்ட்டில் சேர்' },
  added_short: { en: 'Added', te: 'జోడించబడింది', ta: 'சேர்க்கப்பட்டது' },
  each: { en: 'each', te: 'ఒక్కొక్కటి', ta: 'ஒன்றுக்கு' },
  items_label: { en: 'items', te: 'ఐటమ్‌లు', ta: 'பொருட்கள்' },

  cart_title: { en: 'Your cart', te: 'మీ కార్ట్', ta: 'உங்கள் கார்ட்' },
  cart_pickup_note: {
    en: 'Every order is prepared for pickup at {store} — pay when you collect it.',
    te: '{store} వద్ద పికప్ కోసం ప్రతి ఆర్డర్ సిద్ధం చేయబడుతుంది — తీసుకునేటప్పుడు చెల్లించండి.',
    ta: 'ஒவ்வொரு ஆர்டரும் {store} இல் பிக்அப் செய்ய தயார் செய்யப்படும் — வாங்கும்போது பணம் செலுத்தலாம்.',
  },
  cart_empty_title: { en: 'Your cart is empty', te: 'మీ కార్ట్ ఖాళీగా ఉంది', ta: 'உங்கள் கார்ட் காலியாக உள்ளது' },
  cart_empty_sub: {
    en: 'Add a phone or an accessory to reserve it for store pickup.',
    te: 'స్టోర్ పికప్ కోసం రిజర్వ్ చేయడానికి ఫోన్ లేదా యాక్సెసరీ జోడించండి.',
    ta: 'கடையில் பிக்அப் செய்ய ஒரு போன் அல்லது அணிகலனை சேர்க்கவும்.',
  },
  order_summary: { en: 'Order summary', te: 'ఆర్డర్ సారాంశం', ta: 'ஆர்டர் சுருக்கம்' },
  place_pickup_order: { en: 'Place pickup order', te: 'పికప్ ఆర్డర్ పెట్టండి', ta: 'பிக்அப் ஆர்டர் செய்யுங்கள்' },
  placing_order: { en: 'Placing order…', te: 'ఆర్డర్ పెడుతోంది…', ta: 'ஆர்டர் செய்யப்படுகிறது…' },
  pay_at_store_note: {
    en: 'No online payment needed — pay in store when you collect your order.',
    te: 'ఆన్‌లైన్ పేమెంట్ అవసరం లేదు — ఆర్డర్ తీసుకునేటప్పుడు స్టోర్‌లో చెల్లించండి.',
    ta: 'ஆன்லைன் பணம் தேவையில்லை — ஆர்டரை வாங்கும்போது கடையில் பணம் செலுத்தவும்.',
  },
  order_confirm_title: { en: 'Order placed!', te: 'ఆర్డర్ పెట్టబడింది!', ta: 'ஆர்டர் வைக்கப்பட்டது!' },
  order_confirm_text: {
    en: 'Show this code at {store} to collect your order. We will keep it ready for you.',
    te: 'మీ ఆర్డర్ తీసుకోవడానికి {store} వద్ద ఈ కోడ్ చూపించండి. మేము దాన్ని మీ కోసం సిద్ధంగా ఉంచుతాము.',
    ta: 'உங்கள் ஆர்டரை பெற {store} இல் இந்த குறியீட்டைக் காட்டவும். நாங்கள் அதை உங்களுக்காக தயாராக வைத்திருப்போம்.',
  },
  order_total_label: { en: 'Total to pay at store', te: 'స్టోర్‌లో చెల్లించాల్సిన మొత్తం', ta: 'கடையில் செலுத்த வேண்டிய தொகை' },
  continue_shopping: { en: 'Continue shopping', te: 'షాపింగ్ కొనసాగించండి', ta: 'ஷாப்பிங் தொடரவும்' },

  field_delivery_choice: { en: 'How would you like to get it?', te: 'మీరు ఎలా పొందాలనుకుంటున్నారు?', ta: 'எப்படி பெற விரும்புகிறீர்கள்?' },
  delivery_pickup: { en: 'Store pickup (free)', te: 'స్టోర్ పికప్ (ఫ్రీ)', ta: 'கடையில் பிக்அப் (இலவசம்)' },
  delivery_home: { en: 'Home delivery', te: 'హోమ్ డెలివరీ', ta: 'வீட்டுக்கு டெலிவரி' },
  field_delivery_address: { en: 'Delivery address', te: 'డెలివరీ చిరునామా', ta: 'டெலிவரி முகவரி' },
  delivery_address_placeholder: { en: 'House no, street, area, city, pincode…', te: 'ఇంటి నంబర్, వీధి, ప్రాంతం, సిటీ, పిన్‌కోడ్…', ta: 'வீட்டு எண், தெரு, பகுதி, நகரம், பின்கோடு…' },
  delivery_fee_label: { en: 'Delivery fee', te: 'డెలివరీ ఫీజు', ta: 'டெலிவரி கட்டணம்' },
  delivery_free_note: { en: 'Free — collect it yourself at the store', te: 'ఫ్రీ — స్టోర్‌లో మీరే తీసుకోండి', ta: 'இலவசம் — கடையிலேயே பெற்றுக் கொள்ளுங்கள்' },
  order_delivery_note: {
    en: "We'll ship your order to the address you gave and keep you posted as it's processed, shipped and delivered.",
    te: 'మీ ఆర్డర్‌ని మీరు ఇచ్చిన చిరునామాకి పంపిస్తాము, ప్రాసెస్, షిప్ మరియు డెలివరీ అయ్యే క్రమంలో మీకు తెలియజేస్తాము.',
    ta: 'உங்கள் முகவரிக்கு ஆர்டரை அனுப்புவோம், செயலாக்கம், அனுப்பப்படுதல் மற்றும் டெலிவரி நிலைகளை உங்களுக்குத் தெரிவிப்போம்.',
  },

  emi_title: { en: 'EMI calculator', te: 'EMI కాలిక్యులేటర్', ta: 'EMI கால்குலேட்டர்' },
  emi_down_payment: { en: 'Down payment', te: 'డౌన్ పేమెంట్', ta: 'முன்பணம்' },
  emi_tenure: { en: 'Choose tenure', te: 'వ్యవధి ఎంచుకోండి', ta: 'கால அளவைத் தேர்வு செய்யுங்கள்' },
  months: { en: 'months', te: 'నెలలు', ta: 'மாதங்கள்' },
  month: { en: 'month', te: 'నెల', ta: 'மாதம்' },
  emi_monthly_estimate: { en: 'Estimated monthly EMI', te: 'అంచనా నెలవారీ EMI', ta: 'மதிப்பிடப்பட்ட மாத EMI' },
  emi_disclaimer: {
    en: 'Indicative only at ~13% p.a. Final EMI depends on the bank/card at checkout.',
    te: 'ఇది సూచనాత్మకం మాత్రమే, ~13% వార్షిక రేటుతో. చివరి EMI బ్యాంక్/కార్డ్ మీద ఆధారపడి ఉంటుంది.',
    ta: 'இது ~13% வருடாந்திர வட்டியில் மதிப்பீடு மட்டுமே. இறுதி EMI வங்கி/கார்டைப் பொருத்தது.',
  },

  reviews_title: { en: 'Customer reviews', te: 'కస్టమర్ రివ్యూలు', ta: 'வாடிக்கையாளர் விமர்சனங்கள்' },
  reviews_count_label: { en: 'reviews', te: 'రివ్యూలు', ta: 'விமர்சனங்கள்' },
  no_reviews_yet: {
    en: 'No reviews yet — be the first to share your experience.',
    te: 'ఇంకా రివ్యూలు లేవు — మీ అనుభవాన్ని షేర్ చేసిన మొదటి వ్యక్తి అవ్వండి.',
    ta: 'இன்னும் விமர்சனங்கள் இல்லை — உங்கள் அனுபவத்தை பகிரும் முதல் நபராக இருங்கள்.',
  },
  write_review: { en: 'Write a review', te: 'రివ్యూ రాయండి', ta: 'விமர்சனம் எழுதுங்கள்' },
  your_rating: { en: 'Your rating', te: 'మీ రేటింగ్', ta: 'உங்கள் மதிப்பீடு' },
  your_review: { en: 'Your review', te: 'మీ రివ్యూ', ta: 'உங்கள் விமர்சனம்' },
  review_placeholder: { en: 'What did you like about this phone?', te: 'ఈ ఫోన్ గురించి మీకు ఏమి నచ్చింది?', ta: 'இந்த போனில் உங்களுக்கு எது பிடித்தது?' },
  submitting: { en: 'Submitting…', te: 'సమర్పిస్తోంది…', ta: 'சமர்பிக்கப்படுகிறது…' },
  submit_review: { en: 'Submit review', te: 'రివ్యూ సమర్పించండి', ta: 'விமர்சனத்தை சமர்ப்பிக்கவும்' },

  exchange_badge_label: { en: 'Exchange Estimator', te: 'ఎక్స్‌చేంజ్ అంచనా', ta: 'எக்ஸ்சேஞ்ச் மதிப்பீடு' },
  exchange_title: { en: 'What is your old phone worth?', te: 'మీ పాత ఫోన్ ఎంత విలువైనది?', ta: 'உங்கள் பழைய போனின் மதிப்பு என்ன?' },
  exchange_subtitle: {
    en: 'Answer a few quick questions to get an instant exchange bonus estimate you can use towards any phone at our Nagari store.',
    te: 'తక్షణ ఎక్స్‌చేంజ్ బోనస్ అంచనా పొందడానికి కొన్ని ప్రశ్నలకు సమాధానం ఇవ్వండి, దీన్ని నగరి స్టోర్‌లో ఏ ఫోన్‌కైనా ఉపయోగించవచ్చు.',
    ta: 'சில கேள்விகளுக்கு பதிலளித்து, எங்கள் நகரி கடையில் எந்த போனுக்கும் பயன்படுத்தக்கூடிய உடனடி எக்ஸ்சேஞ்ச் மதிப்பீட்டைப் பெறுங்கள்.',
  },
  exchange_field_brand: { en: 'Old phone brand', te: 'పాత ఫోన్ బ్రాండ్', ta: 'பழைய போன் பிராண்ட்' },
  exchange_field_model: { en: 'Model (optional)', te: 'మోడల్ (ఆప్షనల్)', ta: 'மாடல் (விருப்பம்)' },
  exchange_field_year: { en: 'Purchase year', te: 'కొనుగోలు సంవత్సరం', ta: 'வாங்கிய ஆண்டு' },
  exchange_field_condition: { en: 'Condition', te: 'పరిస్థితి', ta: 'நிலை' },
  exchange_estimate_label: { en: 'Instant estimate', te: 'తక్షణ అంచనా', ta: 'உடனடி மதிப்பீடு' },
  exchange_disclaimer: { en: 'Final value confirmed after in-store inspection.', te: 'స్టోర్‌లో పరిశీలన తర్వాత చివరి విలువ నిర్ధారించబడుతుంది.', ta: 'கடையில் ஆய்வு செய்த பிறகு இறுதி மதிப்பு உறுதி செய்யப்படும்.' },
  exchange_claim_title: { en: 'Claim this estimate', te: 'ఈ అంచనాను క్లెయిమ్ చేయండి', ta: 'இந்த மதிப்பீட்டைப் பெறுங்கள்' },
  exchange_claim_text: {
    en: "Leave your details and we'll hold this offer for you at the store.",
    te: 'మీ వివరాలు ఇవ్వండి, మేము ఈ ఆఫర్‌ని స్టోర్‌లో మీ కోసం ఉంచుతాము.',
    ta: 'உங்கள் விவரங்களை தரவும், இந்த சலுகையை கடையில் உங்களுக்காக வைத்திருப்போம்.',
  },
  claiming: { en: 'Claiming…', te: 'క్లెయిమ్ చేస్తోంది…', ta: 'கோரப்படுகிறது…' },
  claim_estimate_btn: { en: 'Claim my estimate', te: 'నా అంచనా క్లెయిమ్ చేయండి', ta: 'என் மதிப்பீட்டை பெறுங்கள்' },
  claim_valid_note: { en: 'Valid for 7 days when you bring the claim code in-store.', te: 'క్లెయిమ్ కోడ్‌ని స్టోర్‌కి తీసుకువస్తే 7 రోజులు చెల్లుతుంది.', ta: 'கோரிக்கை குறியீட்டை கடையில் காட்டினால் 7 நாட்கள் செல்லுபடியாகும்.' },
  exchange_claimed_title: { en: 'Estimate claimed!', te: 'అంచనా క్లెయిమ్ చేయబడింది!', ta: 'மதிப்பீடு பெறப்பட்டது!' },
  exchange_claimed_text: {
    en: 'Bring your old phone and this code to {store} within 7 days to redeem your exchange bonus.',
    te: 'మీ పాత ఫోన్ మరియు ఈ కోడ్‌ని 7 రోజుల్లో {store}కి తీసుకువచ్చి మీ ఎక్స్‌చేంజ్ బోనస్ పొందండి.',
    ta: 'உங்கள் பழைய போன் மற்றும் இந்த குறியீட்டை 7 நாட்களுக்குள் {store} இல் கொண்டு வந்து உங்கள் எக்ஸ்சேஞ்ச் பணத்தைப் பெறுங்கள்.',
  },
  exchange_bonus_label: { en: 'Your exchange bonus', te: 'మీ ఎక్స్‌చేంజ్ బోనస్', ta: 'உங்கள் எக்ஸ்சேஞ்ச் தொகை' },
  claim_code_label: { en: 'Claim code', te: 'క్లెయిమ్ కోడ్', ta: 'கோரிக்கை குறியீடு' },

  home_title: {
    en: '{store} — the best deals on mobiles, accessories and repairs done right.',
    te: '{store} — మొబైల్స్, యాక్సెసరీస్ మరియు రిపేర్లకు ఉత్తమ ఆఫర్లు.',
    ta: '{store} — மொபைல், அணிகலன்கள் மற்றும் சரியான ரிப்பேருக்கு சிறந்த சலுகைகள்.',
  },
  home_subtitle: {
    en: 'Browse the latest smartphones and accessories from every top brand with real offers, or book a doorstep-quality repair and track it online from quote to pickup — all from your neighbourhood store in Nagari.',
    te: 'నిజమైన ఆఫర్లతో అన్ని టాప్ బ్రాండ్ల తాజా స్మార్ట్‌ఫోన్‌లు మరియు యాక్సెసరీస్ చూడండి, లేదా నాణ్యమైన రిపేర్ బుక్ చేసి, కోట్ నుండి పికప్ వరకు ఆన్‌లైన్‌లో ట్రాక్ చేయండి — ఇదంతా నగరిలోని మీ లోకల్ స్టోర్ నుండి.',
    ta: 'உண்மையான சலுகைகளுடன் அனைத்து முன்னணி பிராண்டுகளின் புதிய ஸ்மார்ட்போன்கள் மற்றும் அணிகலன்களை பார்வையிடுங்கள், அல்லது தரமான ரிப்பேரை புக் செய்து மேற்கோள் முதல் பிக்அப் வரை ஆன்லைனில் கண்காணிக்கவும் — இதெல்லாம் நகரியில் உள்ள உங்கள் அருகிலுள்ள கடையிலிருந்து.',
  },
  home_find_mobile: { en: 'Find your mobile', te: 'మీ మొబైల్ కనుగొనండి', ta: 'உங்கள் மொபைலை கண்டறியுங்கள்' },
  home_book_service: { en: 'Book a service', te: 'సర్వీస్ బుక్ చేయండి', ta: 'சர்வீஸ் புக் செய்யுங்கள்' },
  feature_genuine_title: { en: '100% Genuine', te: '100% జెన్యూయిన్', ta: '100% உண்மையானது' },
  feature_genuine_text: { en: 'Original phones with full manufacturer warranty.', te: 'పూర్తి తయారీదారు వారంటీతో ఒరిజినల్ ఫోన్లు.', ta: 'முழு உற்பத்தியாளர் உத்தரவாதத்துடன் ஒரிஜினல் போன்கள்.' },
  feature_pickup_title: { en: 'Fast Store Pickup', te: 'వేగవంతమైన స్టోర్ పికప్', ta: 'விரைவான கடை பிக்அப்' },
  feature_pickup_text: { en: 'Reserve online, collect from our Nagari store same day.', te: 'ఆన్‌లైన్‌లో రిజర్వ్ చేసి, అదే రోజు నగరి స్టోర్ నుండి తీసుకోండి.', ta: 'ஆன்லைனில் முன்பதிவு செய்து, அதே நாளில் நகரி கடையில் இருந்து பெறுங்கள்.' },
  feature_exchange_title: { en: 'Exchange & Bank Offers', te: 'ఎక్స్‌చేంజ్ & బ్యాంక్ ఆఫర్లు', ta: 'எக்ஸ்சேஞ்ச் & வங்கி சலுகைகள்' },
  feature_exchange_text: { en: 'Trade in your old phone and save more instantly.', te: 'మీ పాత ఫోన్‌ని ఎక్స్‌చేంజ్ చేసి వెంటనే ఎక్కువ ఆదా చేయండి.', ta: 'உங்கள் பழைய போனை மாற்றி உடனடியாக மேலும் சேமிக்கவும்.' },
  home_offers_title: { en: "Today's best offers", te: 'ఈరోజు ఉత్తమ ఆఫర్లు', ta: 'இன்றைய சிறந்த சலுகைகள்' },
  home_see_all_offers: { en: 'See all offers →', te: 'అన్ని ఆఫర్లు చూడండి →', ta: 'அனைத்து சலுகைகளையும் பார்க்க →' },
  home_bestselling_title: { en: 'Best-selling mobiles', te: 'బెస్ట్ సెల్లింగ్ మొబైల్స్', ta: 'அதிகம் விற்பனையாகும் மொபைல்கள்' },
  home_view_all_mobiles: { en: 'View all mobiles →', te: 'అన్ని మొబైల్స్ చూడండి →', ta: 'அனைத்து மொபைல்களையும் காண →' },
  home_accessories_title: { en: 'Popular accessories', te: 'ప్రముఖ యాక్సెసరీస్', ta: 'பிரபல அணிகலன்கள்' },
  home_view_all_accessories: { en: 'View all accessories →', te: 'అన్ని యాక్సెసరీస్ చూడండి →', ta: 'அனைத்து அணிகலன்களையும் காண →' },
  home_service_badge: { en: 'Mobile Service', te: 'మొబైల్ సర్వీస్', ta: 'மொபைல் சர்வீஸ்' },
  home_service_title: { en: 'Screen cracked? Battery draining fast? We fix it.', te: 'స్క్రీన్ పగిలిందా? బ్యాటరీ వేగంగా అయిపోతుందా? మేము రిపేర్ చేస్తాం.', ta: 'திரை உடைந்ததா? பேட்டரி வேகமாக குறைகிறதா? நாங்கள் சரி செய்கிறோம்.' },
  home_service_text: {
    en: 'Register your device online in under a minute, get a transparent quote from our technicians, and track every step — inspection, repair and pay — right here on our site.',
    te: 'ఒక నిమిషంలో మీ డివైజ్‌ని ఆన్‌లైన్‌లో రిజిస్టర్ చేయండి, మా టెక్నీషియన్ల నుండి క్లియర్ కోట్ పొందండి, ఇన్‌స్పెక్షన్, రిపేర్ మరియు పే — ప్రతి స్టెప్‌ని ఇక్కడే ట్రాక్ చేయండి.',
    ta: 'ஒரு நிமிடத்திற்குள் உங்கள் சாதனத்தை ஆன்லைனில் பதிவு செய்யுங்கள், எங்கள் தொழில்நுட்ப வல்லுநர்களிடமிருந்து தெளிவான மேற்கோள் பெறுங்கள், ஆய்வு, ரிப்பேர் மற்றும் பணம் செலுத்துதல் — ஒவ்வொரு படியையும் இங்கேயே கண்காணிக்கவும்.',
  },
  home_service_cta: { en: 'Book a service appointment', te: 'సర్వీస్ అపాయింట్‌మెంట్ బుక్ చేయండి', ta: 'சர்வீஸ் அப்பாயிண்ட்மென்ட் புக் செய்யுங்கள்' },
  home_rating_text: { en: '4.6 / 5 service rating', te: '4.6 / 5 సర్వీస్ రేటింగ్', ta: '4.6 / 5 சர்வீஸ் மதிப்பீடு' },
  home_rating_sub: { en: 'from customers in Nagari & nearby towns', te: 'నగరి & చుట్టుపక్కల టౌన్ల కస్టమర్ల నుండి', ta: 'நகரி & அருகிலுள்ள ஊர்களின் வாடிக்கையாளர்களிடமிருந்து' },
  home_parts_title: { en: 'Genuine spare parts', te: 'జెన్యూయిన్ స్పేర్ పార్ట్స్', ta: 'உண்மையான ஸ்பேர் பாகங்கள்' },
  home_parts_sub: { en: 'with a repair warranty on every job', te: 'ప్రతి పనిపై రిపేర్ వారంటీతో', ta: 'ஒவ்வொரு வேலைக்கும் ரிப்பேர் உத்தரவாதத்துடன்' },
  home_visit_title: { en: 'Visit our store', te: 'మా స్టోర్‌ని సందర్శించండి', ta: 'எங்கள் கடையை பார்வையிடுங்கள்' },
  home_directions: { en: 'Get directions →', te: 'దిక్కులు పొందండి →', ta: 'திசைகளைப் பெறுங்கள் →' },

  mobiles_title: { en: 'Find your mobile', te: 'మీ మొబైల్ కనుగొనండి', ta: 'உங்கள் மொபைலை கண்டறியுங்கள்' },
  search_placeholder: { en: 'Search by phone name or brand, e.g. iPhone, Redmi…', te: 'ఫోన్ పేరు లేదా బ్రాండ్ ద్వారా వెతకండి, ఉదా. iPhone, Redmi…', ta: 'போன் பெயர் அல்லது பிராண்ட் மூலம் தேடுங்கள், எ.கா. iPhone, Redmi…' },
  sort_popular: { en: 'Most popular', te: 'అత్యంత ప్రసిద్ధమైనవి', ta: 'மிகவும் பிரபலமானது' },
  sort_price_asc: { en: 'Price: Low to High', te: 'ధర: తక్కువ నుండి ఎక్కువ', ta: 'விலை: குறைவு முதல் அதிகம்' },
  sort_price_desc: { en: 'Price: High to Low', te: 'ధర: ఎక్కువ నుండి తక్కువ', ta: 'விலை: அதிகம் முதல் குறைவு' },
  sort_rating: { en: 'Top rated', te: 'టాప్ రేటెడ్', ta: 'சிறந்த மதிப்பீடு' },
  all_brands: { en: 'All brands', te: 'అన్ని బ్రాండ్లు', ta: 'அனைத்து பிராண்டுகளும்' },
  any_price: { en: 'Any price', te: 'ఏ ధర అయినా', ta: 'எந்த விலையும்' },
  no_match_title: { en: 'No phones match these filters', te: 'ఈ ఫిల్టర్లకు సరిపోయే ఫోన్లు లేవు', ta: 'இந்த வடிகட்டிகளுக்கு பொருந்தும் போன்கள் இல்லை' },
  no_match_sub: { en: 'Try a different brand or a higher price range.', te: 'వేరే బ్రాండ్ లేదా ఎక్కువ ధర పరిధిని ప్రయత్నించండి.', ta: 'வேறு பிராண்ட் அல்லது அதிக விலை வரம்பை முயற்சிக்கவும்.' },
  reset_filters: { en: 'Reset filters', te: 'ఫిల్టర్లను రీసెట్ చేయండి', ta: 'வடிகட்டிகளை மீட்டமைக்க' },

  accessories_title: { en: 'Mobile accessories', te: 'మొబైల్ యాక్సెసరీస్', ta: 'மொபைல் அணிகலன்கள்' },
  accessories_subtitle: {
    en: 'Earphones, earbuds, covers, tempered glass, chargers, cables, power banks and batteries — all in stock.',
    te: 'ఇయర్‌ఫోన్లు, ఇయర్‌బడ్స్, కవర్లు, టెంపర్డ్ గ్లాస్, చార్జర్లు, కేబుల్స్, పవర్ బ్యాంక్‌లు మరియు బ్యాటరీలు — అన్నీ స్టాక్‌లో ఉన్నాయి.',
    ta: 'இயர்போன்கள், இயர்பட்ஸ், கவர்கள், டெம்பர்டு கிளாஸ், சார்ஜர்கள், கேபிள்கள், பவர் பேங்குகள் மற்றும் பேட்டரிகள் — அனைத்தும் இருப்பில் உள்ளன.',
  },
  all_categories: { en: 'All categories', te: 'అన్ని కేటగరీలు', ta: 'அனைத்து வகைகளும்' },
  no_accessory_match_title: { en: 'No accessories match these filters', te: 'ఈ ఫిల్టర్లకు సరిపోయే యాక్సెసరీస్ లేవు', ta: 'இந்த வடிகட்டிகளுக்கு பொருந்தும் அணிகலன்கள் இல்லை' },

  add_to_compare: { en: 'Add to compare', te: 'పోల్చడానికి జోడించండి', ta: 'ஒப்பிட சேர்' },
  added_to_compare: { en: 'Added to compare', te: 'పోల్చడానికి జోడించబడింది', ta: 'ஒப்பிட சேர்க்கப்பட்டது' },
  product_specifications: { en: 'Specifications', te: 'స్పెసిఫికేషన్లు', ta: 'விவரக்குறிப்புகள்' },
  call_to_reserve: { en: 'Call to reserve', te: 'రిజర్వ్ చేయడానికి కాల్ చేయండి', ta: 'முன்பதிவு செய்ய அழைக்கவும்' },
  warranty_badge: { en: '1-year warranty', te: '1 సంవత్సరం వారంటీ', ta: '1 வருட உத்தரவாதம்' },
  pickup_badge: { en: 'Same-day pickup', te: 'అదే రోజు పికప్', ta: 'அதே நாள் பிக்அப்' },
  exchange_badge: { en: 'Exchange available', te: 'ఎక్స్‌చేంజ్ అందుబాటులో ఉంది', ta: 'எக்ஸ்சேஞ்ச் கிடைக்கும்' },
  more_from: { en: 'More from', te: 'మరిన్ని', ta: 'மற்றவை' },
  in_stock_note: { en: 'Inclusive of all taxes · In stock at Nagari store', te: 'అన్ని పన్నులు కలుపుకుని · నగరి స్టోర్‌లో స్టాక్‌లో ఉంది', ta: 'அனைத்து வரிகளும் உட்பட · நகரி கடையில் இருப்பில் உள்ளது' },

  compare_title: { en: 'Compare mobiles', te: 'మొబైల్స్ పోల్చండి', ta: 'மொபைல்களை ஒப்பிடுங்கள்' },
  compare_subtitle: { en: 'Pick up to 4 phones and see their specifications side by side.', te: '4 ఫోన్ల వరకు ఎంచుకుని వాటి స్పెసిఫికేషన్లను పక్కపక్కనే చూడండి.', ta: '4 போன்கள் வரை தேர்ந்து அவற்றின் விவரக்குறிப்புகளை பக்கம் பக்கமாக பார்க்கவும்.' },
  compare_none_title: { en: 'No phones selected yet', te: 'ఇంకా ఫోన్లు ఎంచుకోలేదు', ta: 'இன்னும் போன்கள் தேர்ந்திடப்படவில்லை' },
  compare_none_sub: { en: "Add phones from the list below, or from any mobile's page.", te: 'దిగువ లిస్ట్ నుండి లేదా ఏ మొబైల్ పేజీ నుండైనా ఫోన్లను జోడించండి.', ta: 'கீழே உள்ள பட்டியலில் இருந்து அல்லது எந்த மொபைல் பக்கத்திலிருந்தும் போன்களை சேர்க்கவும்.' },
  compare_add_another: { en: 'Add another phone', te: 'మరో ఫోన్ జోడించండి', ta: 'மற்றொரு போனை சேர்க்கவும்' },
  compare_now: { en: 'Compare now', te: 'ఇప్పుడు పోల్చండి', ta: 'இப்போது ஒப்பிடுங்கள்' },
  compare_selected: { en: 'phone(s) selected to compare', te: 'పోల్చడానికి ఫోన్(లు) ఎంచుకోబడ్డాయి', ta: 'ஒப்பிட தேர்ந்த போன்(கள்)' },
  clear: { en: 'Clear', te: 'క్లియర్', ta: 'அழி' },

  offers_title: { en: 'Offers & promotions', te: 'ఆఫర్లు & ప్రమోషన్లు', ta: 'சலுகைகள் & விளம்பரங்கள்' },
  offers_subtitle: {
    en: 'Live discounts at Kesava Mobiles, Nagari — plus exchange and bank offers you can combine at checkout.',
    te: 'కేసవ మొబైల్స్, నగరిలో లైవ్ డిస్కౌంట్లు — చెక్అవుట్‌లో కలిపి ఉపయోగించే ఎక్స్‌చేంజ్ & బ్యాంక్ ఆఫర్లు.',
    ta: 'கேசவ மொபைல்ஸ், நகரியில் நேரடி தள்ளுபடிகள் — செக்அவுட்டில் இணைத்து பயன்படுத்தக்கூடிய எக்ஸ்சேஞ்ச் & வங்கி சலுகைகள்.',
  },
  offer_exchange_title: { en: 'Exchange bonus', te: 'ఎక్స్‌చేంజ్ బోనస్', ta: 'எக்ஸ்சேஞ்ச் போனஸ்' },
  offer_exchange_text: {
    en: 'Trade in any working smartphone and get up to ₹4,000 extra off, on top of the listed price.',
    te: 'పనిచేసే ఏ స్మార్ట్‌ఫోన్‌నైనా ఎక్స్‌చేంజ్ చేసి, లిస్ట్ చేసిన ధరపై అదనంగా ₹4,000 వరకు తగ్గింపు పొందండి.',
    ta: 'வேலை செய்யும் எந்த ஸ்மார்ட்போனையும் மாற்றி, பட்டியலிடப்பட்ட விலையில் கூடுதலாக ₹4,000 வரை தள்ளுபடி பெறுங்கள்.',
  },
  offer_bank_title: { en: 'Bank & EMI offers', te: 'బ్యాంక్ & EMI ఆఫర్లు', ta: 'வங்கி & EMI சலுகைகள்' },
  offer_bank_text: {
    en: 'No-cost EMI on 3/6/9 months with major banks. Ask in-store which card gives instant cashback.',
    te: 'ప్రధాన బ్యాంకులతో 3/6/9 నెలలకు నో-కాస్ట్ EMI. ఏ కార్డ్ వెంటనే క్యాష్‌బ్యాక్ ఇస్తుందో స్టోర్‌లో అడగండి.',
    ta: 'முன்னணி வங்கிகளுடன் 3/6/9 மாதங்களுக்கு இலவச EMI. எந்த கார்டு உடனடி கேஷ்பேக் தருகிறது என்று கடையில் கேளுங்கள்.',
  },
  offer_refer_title: { en: 'Bring-a-friend', te: 'ఫ్రెండ్‌ని తీసుకురండి', ta: 'நண்பரை அழைத்து வாங்கள்' },
  offer_refer_text: {
    en: 'Refer a friend who buys with us and both of you get a free screen guard + case.',
    te: 'మా వద్ద కొనుగోలు చేసే ఫ్రెండ్‌ని రెఫర్ చేయండి, ఇద్దరికీ ఫ్రీ స్క్రీన్ గార్డ్ + కవర్ లభిస్తుంది.',
    ta: 'எங்களிடம் வாங்கும் நண்பரை பரிந்துரைத்தால், இருவருக்கும் இலவச ஸ்க்ரீன் கார்டு + கவர் கிடைக்கும்.',
  },
  offers_all_title: { en: 'All discounted phones', te: 'డిస్కౌంట్‌లో ఉన్న అన్ని ఫోన్లు', ta: 'தள்ளுபடியில் உள்ள அனைத்து போன்கள்' },
  offers_none_title: { en: 'No live discounts right now', te: 'ఇప్పుడు లైవ్ డిస్కౌంట్లు లేవు', ta: 'இப்போது நேரடி தள்ளுபடிகள் இல்லை' },
  offers_none_sub: { en: 'Check back soon, or call the store for the latest price.', te: 'త్వరలో మళ్ళీ చూడండి, లేదా తాజా ధర కోసం స్టోర్‌కి కాల్ చేయండి.', ta: 'விரைவில் மீண்டும் பாருங்கள், அல்லது சமீபத்திய விலைக்கு கடைக்கு அழைக்கவும்.' },

  service_badge: { en: 'Register for service', te: 'సర్వీస్ కోసం రిజిస్టర్ చేయండి', ta: 'சர்வீஸுக்கு பதிவு செய்யுங்கள்' },
  service_book_title: { en: 'Book a repair appointment', te: 'రిపేర్ అపాయింట్‌మెంట్ బుక్ చేయండి', ta: 'ரிப்பேர் அப்பாயிண்ட்மென்ட் புக் செய்யுங்கள்' },
  service_book_text: {
    en: 'Tell us about your device and the issue. Our technicians will inspect it and share a transparent quote before doing any work — track everything online with your code.',
    te: 'మీ డివైజ్ మరియు సమస్య గురించి మాకు చెప్పండి. మా టెక్నీషియన్లు దాన్ని పరిశీలించి, ఏ పని చేయకముందే క్లియర్ కోట్ ఇస్తారు — మీ కోడ్‌తో ఆన్‌లైన్‌లో ప్రతిదీ ట్రాక్ చేయండి.',
    ta: 'உங்கள் சாதனம் மற்றும் சிக்கலைப் பற்றி எங்களுக்குச் சொல்லுங்கள். எங்கள் தொழில்நுட்ப வல்லுநர்கள் ஆய்வு செய்து, எந்த வேலையும் செய்வதற்கு முன் தெளிவான மேற்கோள் தருவார்கள் — உங்கள் குறியீட்டுடன் ஆன்லைனில் அனைத்தையும் கண்காணிக்கவும்.',
  },
  service_li_warranty: { en: 'Genuine spare parts with repair warranty', te: 'రిపేర్ వారంటీతో జెన్యూయిన్ స్పేర్ పార్ట్స్', ta: 'ரிப்பேர் உத்தரவாதத்துடன் உண்மையான ஸ்பேர் பாகங்கள்' },
  service_li_time: { en: 'Most repairs done within 24–48 hours', te: 'చాలా రిపేర్లు 24–48 గంటల్లో పూర్తవుతాయి', ta: 'பெரும்பாலான ரிப்பேர்கள் 24–48 மணி நேரத்தில் முடிக்கப்படும்' },
  field_name: { en: 'Your name', te: 'మీ పేరు', ta: 'உங்கள் பெயர்' },
  field_phone: { en: 'Phone number', te: 'ఫోన్ నంబర్', ta: 'தொலைபேசி எண்' },
  field_email: { en: 'Email (optional)', te: 'ఇమెయిల్ (ఆప్షనల్)', ta: 'மின்னஞ்சல் (விருப்பம்)' },
  field_brand: { en: 'Device brand', te: 'డివైజ్ బ్రాండ్', ta: 'சாதன பிராண்ட்' },
  field_model: { en: 'Device model', te: 'డివైజ్ మోడల్', ta: 'சாதன மாடல்' },
  field_type: { en: 'Service type', te: 'సర్వీస్ రకం', ta: 'சர்வீஸ் வகை' },
  field_issue: { en: 'Describe the issue', te: 'సమస్యను వివరించండి', ta: 'சிக்கலை விவரிக்கவும்' },
  field_date: { en: 'Preferred date', te: 'కావలసిన తేదీ', ta: 'விருப்பமான தேதி' },
  field_time: { en: 'Preferred time', te: 'కావలసిన సమయం', ta: 'விருப்பமான நேரம்' },
  book_btn: { en: 'Book service appointment', te: 'సర్వీస్ అపాయింట్‌మెంట్ బుక్ చేయండి', ta: 'சர்வீஸ் அப்பாயிண்ட்மென்ட் புக் செய்யுங்கள்' },
  booking_pending: { en: 'Booking…', te: 'బుక్ చేస్తోంది…', ta: 'புக் செய்யப்படுகிறது…' },
  confirm_title: { en: 'Booking confirmed!', te: 'బుకింగ్ నిర్ధారించబడింది!', ta: 'புக்கிங் உறுதி செய்யப்பட்டது!' },
  confirm_text: {
    en: 'Your device is registered for service. Save this tracking code to follow every step online.',
    te: 'మీ డివైజ్ సర్వీస్ కోసం రిజిస్టర్ చేయబడింది. ఈ ట్రాకింగ్ కోడ్‌ని సేవ్ చేసుకోండి.',
    ta: 'உங்கள் சாதனம் சர்வீஸுக்கு பதிவு செய்யப்பட்டது. இந்த நிலை குறியீட்டை சேமித்து வையுங்கள்.',
  },
  track_this: { en: 'Track this service', te: 'ఈ సర్వీస్‌ని ట్రాక్ చేయండి', ta: 'இந்த சர்வீஸை பார்க்கவும்' },
  back_home: { en: 'Back to home', te: 'హోమ్‌కి తిరిగి వెళ్లండి', ta: 'முகப்புக்கு திரும்பு' },

  track_title: { en: 'Track my service', te: 'నా సర్వీస్‌ని ట్రాక్ చేయండి', ta: 'என் சர்வீஸை பார்க்கவும்' },
  track_subtitle: {
    en: 'Enter the tracking code you received when you booked, to see live status, your quote and to pay online.',
    te: 'బుక్ చేసినప్పుడు మీకు వచ్చిన ట్రాకింగ్ కోడ్‌ను ఎంటర్ చేసి, స్టేటస్, కోట్ చూసి ఆన్‌లైన్‌లో పే చేయండి.',
    ta: 'புக் செய்தபோது பெற்ற நிலை குறியீட்டை உள்ளிட்டு, நேரடி நிலை, மேற்கோள் பார்த்து ஆன்லைனில் பணம் செலுத்தவும்.',
  },
  track_btn: { en: 'Track service', te: 'సర్వీస్ ట్రాక్ చేయండి', ta: 'சர்வீஸை பார்க்கவும்' },
  track_notfound_title: { en: "We couldn't find that tracking code", te: 'ఆ ట్రాకింగ్ కోడ్ కనుగొనబడలేదు', ta: 'அந்த நிலை குறியீடு கிடைக்கவில்லை' },
  track_notfound_sub: {
    en: 'Double-check the code from your booking confirmation, or call the store for help.',
    te: 'మీ బుకింగ్ నిర్ధారణ నుండి కోడ్‌ని మళ్ళీ చెక్ చేయండి, లేదా సహాయం కోసం స్టోర్‌కి కాల్ చేయండి.',
    ta: 'உங்கள் புக்கிங் உறுதி செய்தலில் இருந்து குறியீட்டை மீண்டும் சரிபார்க்கவும், அல்லது உதவிக்கு கடைக்கு அழைக்கவும்.',
  },
  pay_btn: { en: 'Pay & confirm repair', te: 'పే చేసి రిపేర్ నిర్ధారించండి', ta: 'பணம் செலுத்தி ரிப்பேரை உறுதி செய்யுங்கள்' },
  pay_processing: { en: 'Processing…', te: 'ప్రాసెస్ అవుతోంది…', ta: 'செயலாக்கப்படுகிறது…' },
  status_history: { en: 'Status history', te: 'స్టేటస్ హిస్టరీ', ta: 'நிலை வரலாறு' },
  no_quote_yet: {
    en: "Our technician hasn't shared a quote yet. Check back soon — you'll be able to pay online right here once the quote is ready.",
    te: 'మా టెక్నీషియన్ ఇంకా కోట్ ఇవ్వలేదు. కోట్ రెడీ అయినప్పుడు ఇక్కడే ఆన్‌లైన్‌లో పే చేయవచ్చు.',
    ta: 'எங்கள் தொழில்நுட்ப வல்லுநர் இன்னும் மேற்கோள் தரவில்லை. மேற்கோள் தயாரானதும் இங்கேயே ஆன்லைனில் பணம் செலுத்தலாம்.',
  },

  contact_title: { en: 'Visit', te: 'సందర్శించండి', ta: 'பார்வையிடுங்கள்' },
  contact_subtitle: {
    en: 'is your neighbourhood store for mobile sales and repairs in Nagari, Andhra Pradesh. Walk in for a hands-on demo of any phone, an instant exchange valuation, or to drop off a device for service — or reach us by phone or WhatsApp any time during store hours.',
    te: 'ఆంధ్రప్రదేశ్‌లోని నగరిలో మొబైల్ సేల్స్ మరియు రిపేర్ల కోసం మీ లోకల్ స్టోర్. ఏ ఫోన్‌నైనా చేతికి తీసుకుని చూడటానికి, తక్షణ ఎక్స్‌చేంజ్ వాల్యుయేషన్‌కి, లేదా సర్వీస్ కోసం డివైజ్ ఇవ్వటానికి రండి — లేదా స్టోర్ సమయాల్లో ఫోన్ లేదా వాట్సాప్‌లో మమ్మల్ని సంప్రదించండి.',
    ta: 'ஆந்திரப் பிரதேசம், நகரியில் மொபைல் விற்பனை மற்றும் ரிப்பேருக்கான உங்கள் அருகிலுள்ள கடை. எந்த போனையும் நேரடியாக பார்க்க, உடனடி எக்ஸ்சேஞ்ச் மதிப்பீட்டிற்கு, அல்லது சாதனத்தை சர்வீஸுக்கு தர வாருங்கள் — அல்லது கடை நேரங்களில் தொலைபேசி அல்லது வாட்ஸ்அப்பில் எங்களை தொடர்பு கொள்ளுங்கள்.',
  },
  label_address: { en: 'Address', te: 'చిరునామా', ta: 'முகவரி' },
  label_hours: { en: 'Store hours', te: 'స్టోర్ సమయాలు', ta: 'கடை நேரங்கள்' },
  label_phone: { en: 'Phone', te: 'ఫోన్', ta: 'தொலைபேசி' },
  label_whatsapp: { en: 'WhatsApp', te: 'వాట్సాప్', ta: 'வாட்ஸ்அப்' },
  whatsapp_chat: { en: 'Chat with us on WhatsApp', te: 'వాట్సాప్‌లో మాతో చాట్ చేయండి', ta: 'வாட்ஸ்அப்பில் எங்களுடன் பேசுங்கள்' },
  call_store_btn: { en: 'Call the store', te: 'స్టోర్‌కి కాల్ చేయండి', ta: 'கடைக்கு அழைக்கவும்' },
  get_directions_btn: { en: 'Get directions', te: 'దిక్కులు పొందండి', ta: 'திசைகளைப் பெறுங்கள்' },
  contact_buying_title: { en: 'Buying or booking a repair?', te: 'కొనుగోలు లేదా రిపేర్ బుక్ చేస్తున్నారా?', ta: 'வாங்குகிறீர்களா அல்லது ரிப்பேர் புக் செய்கிறீர்களா?' },
  contact_buying_text: {
    en: 'Browse our latest mobiles and current offers online, or register your device for service before you come in — either way, your visit to the Nagari store will be quicker.',
    te: 'మా తాజా మొబైల్స్ మరియు ఆఫర్లను ఆన్‌లైన్‌లో చూడండి, లేదా వచ్చే ముందు మీ డివైజ్‌ని సర్వీస్ కోసం రిజిస్టర్ చేయండి — దీనితో నగరి స్టోర్‌కి మీ విజిట్ వేగంగా ఉంటుంది.',
    ta: 'எங்கள் புதிய மொபைல்கள் மற்றும் தற்போதைய சலுகைகளை ஆன்லைனில் பார்வையிடுங்கள், அல்லது வருவதற்கு முன் உங்கள் சாதனத்தை சர்வீஸுக்கு பதிவு செய்யுங்கள் — அப்படியானால் நகரி கடைக்கு உங்கள் வருகை விரைவாக இருக்கும்.',
  },

  nav_launches: { en: 'New Launches', te: 'కొత్త లాంచ్‌లు', ta: 'புதிய வெளியீடுகள்' },
  demo_book_btn: { en: 'Book in-store demo', te: 'స్టోర్‌లో డెమో బుక్ చేయండి', ta: 'கடையில் டெமோ புக் செய்யுங்கள்' },
  demo_book_title: { en: 'Try before you buy', te: 'కొనే ముందు ప్రయత్నించండి', ta: 'வாங்குவதற்கு முன் முயற்சிக்கவும்' },
  demo_book_text: {
    en: 'Pick a date and time, and our staff will have this phone ready for you to try at the Nagari store.',
    te: 'తేదీ మరియు సమయం ఎంచుకోండి, మా సిబ్బంది ఈ ఫోన్‌ని నగరి స్టోర్‌లో మీరు ప్రయత్నించడానికి రెడీగా ఉంచుతారు.',
    ta: 'தேதி மற்றும் நேரத்தை தேர்வு செய்யுங்கள், எங்கள் ஊழியர்கள் இந்த போனை நகரி கடையில் நீங்கள் முயற்சிக்க தயார் செய்வார்கள்.',
  },
  demo_booking_pending: { en: 'Booking…', te: 'బుక్ చేస్తోంది…', ta: 'புக் செய்யப்படுகிறது…' },
  demo_confirm_title: { en: 'Demo reserved!', te: 'డెమో రిజర్వ్ చేయబడింది!', ta: 'டெமோ முன்பதிவு செய்யப்பட்டது!' },
  demo_confirm_text: {
    en: "We've reserved this phone for you. Show this code at the store when you arrive.",
    te: 'మేము ఈ ఫోన్‌ని మీ కోసం రిజర్వ్ చేసాము. మీరు వచ్చినప్పుడు ఈ కోడ్‌ని స్టోర్‌లో చూపించండి.',
    ta: 'இந்த போனை உங்களுக்காக முன்பதிவு செய்துள்ளோம். வரும்போது இந்த குறியீட்டை கடையில் காட்டவும்.',
  },
  cancel: { en: 'Cancel', te: 'రద్దు చేయండి', ta: 'ரத்து செய்' },

  launches_title: { en: 'Upcoming launches', te: 'రాబోయే లాంచ్‌లు', ta: 'வரவிருக்கும் வெளியீடுகள்' },
  launches_subtitle: {
    en: "Reserve tomorrow's phones today. Pay a small token online and we'll notify you the moment stock arrives at our Nagari store — the token is adjusted fully against your purchase.",
    te: 'రేపటి ఫోన్లను ఇప్పుడే రిజర్వ్ చేయండి. చిన్న టోకెన్ ఆన్‌లైన్‌లో చెల్లించండి, స్టాక్ నగరి స్టోర్‌కి వచ్చిన వెంటనే మేము మీకు తెలియజేస్తాము — టోకెన్ మీ కొనుగోలుపై పూర్తిగా సర్దుబాటు చేయబడుతుంది.',
    ta: 'நாளைய போன்களை இன்றே முன்பதிவு செய்யுங்கள். ஒரு சிறிய தொகையை ஆன்லைனில் செலுத்துங்கள், நகரி கடையில் இருப்பு வந்ததும் உங்களுக்குத் தெரிவிப்போம் — தொகை உங்கள் கொள்முதலில் முழுமையாக சரிசெய்யப்படும்.',
  },
  launches_expected_price: { en: 'Expected price', te: 'ఆశించిన ధర', ta: 'எதிர்பார்க்கப்படும் விலை' },
  launches_token_label: { en: 'Reserve with token', te: 'టోకెన్‌తో రిజర్వ్ చేయండి', ta: 'தொகையுடன் முன்பதிவு செய்யவும்' },
  prebook_btn: { en: 'Pre-book now', te: 'ఇప్పుడే ప్రీ-బుక్ చేయండి', ta: 'இப்போது முன்பதிவு செய்யுங்கள்' },
  prebook_title: { en: 'Reserve your spot', te: 'మీ స్థానాన్ని రిజర్వ్ చేయండి', ta: 'உங்கள் இடத்தை முன்பதிவு செய்யவும்' },
  prebook_confirm_title: { en: 'Pre-booking confirmed!', te: 'ప్రీ-బుకింగ్ నిర్ధారించబడింది!', ta: 'முன்பதிவு உறுதி செய்யப்பட்டது!' },
  prebook_confirm_text: {
    en: "We'll notify you the moment it arrives. Show this code at the store to collect your device.",
    te: 'అది వచ్చిన వెంటనే మేము మీకు తెలియజేస్తాము. మీ డివైజ్ తీసుకోవడానికి ఈ కోడ్‌ని స్టోర్‌లో చూపించండి.',
    ta: 'அது வந்ததும் உங்களுக்குத் தெரிவிப்போம். உங்கள் சாதனத்தை பெற இந்த குறியீட்டை கடையில் காட்டவும்.',
  },
  prebook_pending: { en: 'Reserving…', te: 'రిజర్వ్ చేస్తోంది…', ta: 'முன்பதிவு செய்யப்படுகிறது…' },
  no_launches_title: { en: 'No upcoming launches right now', te: 'ఇప్పుడు రాబోయే లాంచ్‌లు లేవు', ta: 'இப்போது வரவிருக்கும் வெளியீடுகள் இல்லை' },
  no_launches_sub: { en: 'Check back soon, or ask in-store about the next big launch.', te: 'త్వరలో మళ్ళీ చూడండి, లేదా తదుపరి లాంచ్ గురించి స్టోర్‌లో అడగండి.', ta: 'விரைவில் மீண்டும் பாருங்கள், அல்லது அடுத்த வெளியீடு பற்றி கடையில் கேளுங்கள்.' },

  field_delivery_mode: { en: 'How should we get your device?', te: 'మీ డివైజ్‌ని మేము ఎలా తీసుకోవాలి?', ta: 'உங்கள் சாதனத்தை நாங்கள் எப்படி பெற வேண்டும்?' },
  delivery_store_dropoff: { en: 'I will drop it off at the store', te: 'నేను దీన్ని స్టోర్‌లో వదిలివెళ్తాను', ta: 'நான் அதை கடையில் விட்டு விடுவேன்' },
  delivery_doorstep: { en: 'Doorstep pickup', te: 'డోర్‌స్టెప్ పికప్', ta: 'வீட்டு பிக்அப்' },
  field_pickup_address: { en: 'Pickup address', te: 'పికప్ చిరునామా', ta: 'பிக்அப் முகவரி' },
  pickup_address_placeholder: { en: 'House no, street, area, landmark…', te: 'ఇంటి నంబర్, వీధి, ప్రాంతం, ల్యాండ్‌మార్క్…', ta: 'வீட்டு எண், தெரு, பகுதி, லேண்ட்மார்க்…' },

  combos_title: { en: 'Combo bundles — save more together', te: 'కాంబో బండిల్స్ — కలిపి ఎక్కువ ఆదా చేయండి', ta: 'காம்போ பண்டில்கள் — ஒன்றாக மேலும் சேமிக்கவும்' },
  combos_subtitle: { en: 'Hand-picked accessory combos at a special bundle price.', te: 'ఒక ప్రత్యేక బండిల్ ధరకు ఎంచుకున్న యాక్సెసరీ కాంబోలు.', ta: 'சிறப்பு பண்டில் விலையில் தேர்ந்தெடுக்கப்பட்ட அணிகலன் காம்போக்கள்.' },
  combo_add_btn: { en: 'Add bundle to cart', te: 'బండిల్‌ని కార్ట్‌కి జోడించండి', ta: 'பண்டிலை கார்ட்டில் சேர்' },
  combo_added: { en: 'Bundle added', te: 'బండిల్ జోడించబడింది', ta: 'பண்டில் சேர்க்கப்பட்டது' },
  combo_you_save: { en: 'You save', te: 'మీరు ఆదా చేస్తారు', ta: 'நீங்கள் சேமிக்கிறீர்கள்' },

  whatsapp_float_label: { en: 'Chat on WhatsApp', te: 'వాట్సాప్‌లో చాట్ చేయండి', ta: 'வாட்ஸ்அப்பில் பேசுங்கள்' },
  whatsapp_ask_phone: { en: 'Ask about this on WhatsApp', te: 'దీని గురించి వాట్సాప్‌లో అడగండి', ta: 'இதைப் பற்றி வாட்ஸ்அப்பில் கேளுங்கள்' },
  whatsapp_ask_service: { en: 'Ask about my repair on WhatsApp', te: 'నా రిపేర్ గురించి వాట్సాప్‌లో అడగండి', ta: 'எனது ரிப்பேர் பற்றி வாட்ஸ்அப்பில் கேளுங்கள்' },

  repair_estimator_title: { en: 'Get an instant price range', te: 'తక్షణ ధర పరిధిని పొందండి', ta: 'உடனடி விலை வரம்பைப் பெறுங்கள்' },
  repair_estimator_text: {
    en: 'Pick your device brand and the issue to see a typical price range before you book — the exact quote comes after inspection.',
    te: 'బుక్ చేసే ముందు మీ డివైజ్ బ్రాండ్ మరియు సమస్యను ఎంచుకుని సాధారణ ధర పరిధిని చూడండి — ఖచ్చితమైన కోట్ ఇన్‌స్పెక్షన్ తర్వాత వస్తుంది.',
    ta: 'புக் செய்வதற்கு முன் உங்கள் சாதன பிராண்ட் மற்றும் சிக்கலை தேர்ந்து வழக்கமான விலை வரம்பைப் பாருங்கள் — சரியான மேற்கோள் ஆய்வுக்குப் பிறகு வரும்.',
  },
  repair_estimate_label: { en: 'Typical price range', te: 'సాధారణ ధర పరిధి', ta: 'வழக்கமான விலை வரம்பு' },
  repair_estimate_note: { en: 'Final price confirmed by our technician after inspecting the device.', te: 'డివైజ్‌ని పరిశీలించిన తర్వాత మా టెక్నీషియన్ చివరి ధరను నిర్ధారిస్తారు.', ta: 'சாதனத்தை ஆய்வு செய்த பிறகு எங்கள் தொழில்நுட்ப வல்லுநர் இறுதி விலையை உறுதி செய்வார்.' },

  loyalty_title: { en: 'Rewards & referrals', te: 'రివార్డులు & రెఫరల్స్', ta: 'ரிவார்டுகள் & பரிந்துரைகள்' },
  loyalty_subtitle: {
    en: 'Earn 1 point for every ₹100 you spend on a phone, accessory or repair. Every point is worth ₹1 towards your next purchase in store.',
    te: 'ఫోన్, యాక్సెసరీ లేదా రిపేర్‌పై ఖర్చు చేసే ప్రతి ₹100కి 1 పాయింట్ పొందండి. ప్రతి పాయింట్ మీ తదుపరి కొనుగోలుపై ₹1 విలువైనది.',
    ta: 'போன், அணிகலன் அல்லது ரிப்பேருக்கு செலவிடும் ஒவ்வொரு ₹100க்கும் 1 புள்ளியைப் பெறுங்கள். ஒவ்வொரு புள்ளியும் உங்கள் அடுத்த கொள்முதலில் ₹1 மதிப்புடையது.',
  },
  loyalty_check_title: { en: 'Check your points', te: 'మీ పాయింట్లను చెక్ చేయండి', ta: 'உங்கள் புள்ளிகளை சரிபார்க்கவும்' },
  loyalty_check_btn: { en: 'Check points', te: 'పాయింట్లను చెక్ చేయండి', ta: 'புள்ளிகளை சரிபார்க்க' },
  loyalty_checking: { en: 'Checking…', te: 'చెక్ చేస్తోంది…', ta: 'சரிபார்க்கப்படுகிறது…' },
  loyalty_points_label: { en: 'Your points balance', te: 'మీ పాయింట్ల బ్యాలెన్స్', ta: 'உங்கள் புள்ளி இருப்பு' },
  loyalty_worth_label: { en: 'Worth in-store', te: 'స్టోర్‌లో విలువ', ta: 'கடையில் மதிப்பு' },
  loyalty_your_code_label: { en: 'Your referral code', te: 'మీ రెఫరల్ కోడ్', ta: 'உங்கள் பரிந்துரை குறியீடு' },
  loyalty_your_code_note: {
    en: 'Share this with friends. When they use it on their first order, you get 100 bonus points.',
    te: 'దీన్ని ఫ్రెండ్స్‌తో షేర్ చేయండి. వారు తమ మొదటి ఆర్డర్‌లో దీన్ని ఉపయోగిస్తే, మీకు 100 బోనస్ పాయింట్లు లభిస్తాయి.',
    ta: 'இதை நண்பர்களுடன் பகிரவும். அவர்கள் தங்கள் முதல் ஆர்டரில் இதைப் பயன்படுத்தினால், உங்களுக்கு 100 போனஸ் புள்ளிகள் கிடைக்கும்.',
  },
  loyalty_redeem_title: { en: "Got a friend's code?", te: 'ఫ్రెండ్ కోడ్ ఉందా?', ta: 'நண்பரின் குறியீடு உள்ளதா?' },
  loyalty_redeem_text: { en: 'Enter it once and they get 100 bonus points added to their account.', te: 'దీన్ని ఒకసారి ఎంటర్ చేయండి, వారికి 100 బోనస్ పాయింట్లు జతచేయబడతాయి.', ta: 'ஒருமுறை உள்ளிடவும், அவர்களுக்கு 100 போனஸ் புள்ளிகள் சேர்க்கப்படும்.' },
  loyalty_redeem_btn: { en: 'Apply code', te: 'కోడ్ అప్లై చేయండి', ta: 'குறியீட்டை பயன்படுத்து' },
  loyalty_redeeming: { en: 'Applying…', te: 'అప్లై చేస్తోంది…', ta: 'பயன்படுத்தப்படுகிறது…' },
  loyalty_referral_field: { en: "Friend's referral code", te: 'ఫ్రెండ్ రెఫరల్ కోడ్', ta: 'நண்பரின் பரிந்துரை குறியீடு' },
  loyalty_already_used: { en: 'You already used a referral code with this number.', te: 'ఈ నంబర్‌తో మీరు ఇప్పటికే రెఫరల్ కోడ్ ఉపయోగించారు.', ta: 'இந்த எண்ணுடன் ஏற்கனவே ஒரு பரிந்துரை குறியீட்டைப் பயன்படுத்தியுள்ளீர்கள்.' },
  loyalty_success: { en: 'Applied! Your friend just earned 100 bonus points.', te: 'అప్లై చేయబడింది! మీ ఫ్రెండ్‌కి 100 బోనస్ పాయింట్లు వచ్చాయి.', ta: 'பயன்படுத்தப்பட்டது! உங்கள் நண்பருக்கு 100 போனஸ் புள்ளிகள் கிடைத்தன.' },
  loyalty_points_earned_note: { en: 'You earned loyalty points on this order — check them anytime on the Rewards page.', te: 'ఈ ఆర్డర్‌పై మీకు లాయల్టీ పాయింట్లు వచ్చాయి — రివార్డుల పేజీలో ఎప్పుడైనా చెక్ చేయండి.', ta: 'இந்த ஆர்டரில் லாயல்டி புள்ளிகளைப் பெற்றீர்கள் — ரிவார்ட்ஸ் பக்கத்தில் எப்போது வேண்டுமானாலும் சரிபார்க்கவும்.' },
} as const

type Key = keyof typeof dict

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: Key) => string }>({
  lang: 'en',
  setLang: () => {},
  t: (k) => dict[k].en,
})

const STORAGE_KEY = 'km-lang'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'te' || saved === 'ta') setLangState(saved)
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, l)
  }

  const t = (k: Key) => dict[k]?.[lang] ?? dict[k]?.en ?? String(k)

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>
}

export function useLang() {
  return useContext(LangContext)
}
