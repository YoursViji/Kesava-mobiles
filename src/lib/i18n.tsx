// A small hand-rolled English/Telugu switcher for the store's own wording (menus, headings,
// buttons, form labels). Product names, descriptions and specifications come from the database
// and stay in English. The choice is remembered in the browser and defaults to English on the
// server so there is no mismatch when the page hydrates.
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Lang = 'en' | 'te'

const dict = {
  nav_mobiles: { en: 'Buy Mobiles', te: 'మొబైల్స్ కొనుగోలు' },
  nav_accessories: { en: 'Accessories', te: 'యాక్సెసరీస్' },
  nav_offers: { en: 'Offers', te: 'ఆఫర్లు' },
  nav_compare: { en: 'Compare', te: 'పోల్చండి' },
  nav_service: { en: 'Book Service', te: 'సర్వీస్ బుక్ చేయండి' },
  nav_track: { en: 'Track Service', te: 'సర్వీస్ ట్రాక్ చేయండి' },
  nav_contact: { en: 'Store & Contact', te: 'స్టోర్ & సంప్రదింపు' },
  nav_exchange: { en: 'Exchange', te: 'ఎక్స్‌చేంజ్' },
  nav_book_service_short: { en: 'Book a Service', te: 'సర్వీస్ బుక్ చేయండి' },

  add_to_cart: { en: 'Add to cart', te: 'కార్ట్‌కి జోడించండి' },
  added_short: { en: 'Added', te: 'జోడించబడింది' },
  each: { en: 'each', te: 'ఒక్కొక్కటి' },
  items_label: { en: 'items', te: 'ఐటమ్‌లు' },

  cart_title: { en: 'Your cart', te: 'మీ కార్ట్' },
  cart_pickup_note: { en: 'Every order is prepared for pickup at {store} — pay when you collect it.', te: '{store} వద్ద పికప్ కోసం ప్రతి ఆర్డర్ సిద్ధం చేయబడుతుంది — తీసుకునేటప్పుడు చెల్లించండి.' },
  cart_empty_title: { en: 'Your cart is empty', te: 'మీ కార్ట్ ఖాళీగా ఉంది' },
  cart_empty_sub: { en: 'Add a phone or an accessory to reserve it for store pickup.', te: 'స్టోర్ పికప్ కోసం రిజర్వ్ చేయడానికి ఫోన్ లేదా యాక్సెసరీ జోడించండి.' },
  order_summary: { en: 'Order summary', te: 'ఆర్డర్ సారాంశం' },
  place_pickup_order: { en: 'Place pickup order', te: 'పికప్ ఆర్డర్ పెట్టండి' },
  placing_order: { en: 'Placing order…', te: 'ఆర్డర్ పెడుతోంది…' },
  pay_at_store_note: { en: 'No online payment needed — pay in store when you collect your order.', te: 'ఆన్‌లైన్ పేమెంట్ అవసరం లేదు — ఆర్డర్ తీసుకునేటప్పుడు స్టోర్‌లో చెల్లించండి.' },
  order_confirm_title: { en: 'Order placed!', te: 'ఆర్డర్ పెట్టబడింది!' },
  order_confirm_text: { en: 'Show this code at {store} to collect your order. We will keep it ready for you.', te: 'మీ ఆర్డర్ తీసుకోవడానికి {store} వద్ద ఈ కోడ్ చూపించండి. మేము దాన్ని మీ కోసం సిద్ధంగా ఉంచుతాము.' },
  order_total_label: { en: 'Total to pay at store', te: 'స్టోర్‌లో చెల్లించాల్సిన మొత్తం' },
  continue_shopping: { en: 'Continue shopping', te: 'షాపింగ్ కొనసాగించండి' },

  emi_title: { en: 'EMI calculator', te: 'EMI కాలిక్యులేటర్' },
  emi_down_payment: { en: 'Down payment', te: 'డౌన్ పేమెంట్' },
  emi_tenure: { en: 'Choose tenure', te: 'వ్యవధి ఎంచుకోండి' },
  months: { en: 'months', te: 'నెలలు' },
  month: { en: 'month', te: 'నెల' },
  emi_monthly_estimate: { en: 'Estimated monthly EMI', te: 'అంచనా నెలవారీ EMI' },
  emi_disclaimer: { en: 'Indicative only at ~13% p.a. Final EMI depends on the bank/card at checkout.', te: 'ఇది సూచనాత్మకం మాత్రమే, ~13% వార్షిక రేటుతో. చివరి EMI బ్యాంక్/కార్డ్ మీద ఆధారపడి ఉంటుంది.' },

  reviews_title: { en: 'Customer reviews', te: 'కస్టమర్ రివ్యూలు' },
  reviews_count_label: { en: 'reviews', te: 'రివ్యూలు' },
  no_reviews_yet: { en: 'No reviews yet — be the first to share your experience.', te: 'ఇంకా రివ్యూలు లేవు — మీ అనుభవాన్ని షేర్ చేసిన మొదటి వ్యక్తి అవ్వండి.' },
  write_review: { en: 'Write a review', te: 'రివ్యూ రాయండి' },
  your_rating: { en: 'Your rating', te: 'మీ రేటింగ్' },
  your_review: { en: 'Your review', te: 'మీ రివ్యూ' },
  review_placeholder: { en: 'What did you like about this phone?', te: 'ఈ ఫోన్ గురించి మీకు ఏమి నచ్చింది?' },
  submitting: { en: 'Submitting…', te: 'సమర్పిస్తోంది…' },
  submit_review: { en: 'Submit review', te: 'రివ్యూ సమర్పించండి' },

  exchange_badge_label: { en: 'Exchange Estimator', te: 'ఎక్స్‌చేంజ్ అంచనా' },
  exchange_title: { en: 'What is your old phone worth?', te: 'మీ పాత ఫోన్ ఎంత విలువైనది?' },
  exchange_subtitle: {
    en: 'Answer a few quick questions to get an instant exchange bonus estimate you can use towards any phone at our Nagari store.',
    te: 'తక్షణ ఎక్స్‌చేంజ్ బోనస్ అంచనా పొందడానికి కొన్ని ప్రశ్నలకు సమాధానం ఇవ్వండి, దీన్ని నగరి స్టోర్‌లో ఏ ఫోన్‌కైనా ఉపయోగించవచ్చు.',
  },
  exchange_field_brand: { en: 'Old phone brand', te: 'పాత ఫోన్ బ్రాండ్' },
  exchange_field_model: { en: 'Model (optional)', te: 'మోడల్ (ఆప్షనల్)' },
  exchange_field_year: { en: 'Purchase year', te: 'కొనుగోలు సంవత్సరం' },
  exchange_field_condition: { en: 'Condition', te: 'పరిస్థితి' },
  exchange_estimate_label: { en: 'Instant estimate', te: 'తక్షణ అంచనా' },
  exchange_disclaimer: { en: 'Final value confirmed after in-store inspection.', te: 'స్టోర్‌లో పరిశీలన తర్వాత చివరి విలువ నిర్ధారించబడుతుంది.' },
  exchange_claim_title: { en: 'Claim this estimate', te: 'ఈ అంచనాను క్లెయిమ్ చేయండి' },
  exchange_claim_text: { en: "Leave your details and we'll hold this offer for you at the store.", te: 'మీ వివరాలు ఇవ్వండి, మేము ఈ ఆఫర్‌ని స్టోర్‌లో మీ కోసం ఉంచుతాము.' },
  claiming: { en: 'Claiming…', te: 'క్లెయిమ్ చేస్తోంది…' },
  claim_estimate_btn: { en: 'Claim my estimate', te: 'నా అంచనా క్లెయిమ్ చేయండి' },
  claim_valid_note: { en: 'Valid for 7 days when you bring the claim code in-store.', te: 'క్లెయిమ్ కోడ్‌ని స్టోర్‌కి తీసుకువస్తే 7 రోజులు చెల్లుతుంది.' },
  exchange_claimed_title: { en: 'Estimate claimed!', te: 'అంచనా క్లెయిమ్ చేయబడింది!' },
  exchange_claimed_text: { en: 'Bring your old phone and this code to {store} within 7 days to redeem your exchange bonus.', te: 'మీ పాత ఫోన్ మరియు ఈ కోడ్‌ని 7 రోజుల్లో {store}కి తీసుకువచ్చి మీ ఎక్స్‌చేంజ్ బోనస్ పొందండి.' },
  exchange_bonus_label: { en: 'Your exchange bonus', te: 'మీ ఎక్స్‌చేంజ్ బోనస్' },
  claim_code_label: { en: 'Claim code', te: 'క్లెయిమ్ కోడ్' },

  home_title: { en: '{store} — the best deals on mobiles, accessories and repairs done right.', te: '{store} — మొబైల్స్, యాక్సెసరీస్ మరియు రిపేర్లకు ఉత్తమ ఆఫర్లు.' },
  home_subtitle: {
    en: 'Browse the latest smartphones and accessories from every top brand with real offers, or book a doorstep-quality repair and track it online from quote to pickup — all from your neighbourhood store in Nagari.',
    te: 'నిజమైన ఆఫర్లతో అన్ని టాప్ బ్రాండ్ల తాజా స్మార్ట్‌ఫోన్‌లు మరియు యాక్సెసరీస్ చూడండి, లేదా నాణ్యమైన రిపేర్ బుక్ చేసి, కోట్ నుండి పికప్ వరకు ఆన్‌లైన్‌లో ట్రాక్ చేయండి — ఇదంతా నగరిలోని మీ లోకల్ స్టోర్ నుండి.',
  },
  home_find_mobile: { en: 'Find your mobile', te: 'మీ మొబైల్ కనుగొనండి' },
  home_book_service: { en: 'Book a service', te: 'సర్వీస్ బుక్ చేయండి' },
  feature_genuine_title: { en: '100% Genuine', te: '100% జెన్యూయిన్' },
  feature_genuine_text: { en: 'Original phones with full manufacturer warranty.', te: 'పూర్తి తయారీదారు వారంటీతో ఒరిజినల్ ఫోన్లు.' },
  feature_pickup_title: { en: 'Fast Store Pickup', te: 'వేగవంతమైన స్టోర్ పికప్' },
  feature_pickup_text: { en: 'Reserve online, collect from our Nagari store same day.', te: 'ఆన్‌లైన్‌లో రిజర్వ్ చేసి, అదే రోజు నగరి స్టోర్ నుండి తీసుకోండి.' },
  feature_exchange_title: { en: 'Exchange & Bank Offers', te: 'ఎక్స్‌చేంజ్ & బ్యాంక్ ఆఫర్లు' },
  feature_exchange_text: { en: 'Trade in your old phone and save more instantly.', te: 'మీ పాత ఫోన్‌ని ఎక్స్‌చేంజ్ చేసి వెంటనే ఎక్కువ ఆదా చేయండి.' },
  home_offers_title: { en: "Today's best offers", te: 'ఈరోజు ఉత్తమ ఆఫర్లు' },
  home_see_all_offers: { en: 'See all offers →', te: 'అన్ని ఆఫర్లు చూడండి →' },
  home_bestselling_title: { en: 'Best-selling mobiles', te: 'బెస్ట్ సెల్లింగ్ మొబైల్స్' },
  home_view_all_mobiles: { en: 'View all mobiles →', te: 'అన్ని మొబైల్స్ చూడండి →' },
  home_accessories_title: { en: 'Popular accessories', te: 'ప్రముఖ యాక్సెసరీస్' },
  home_view_all_accessories: { en: 'View all accessories →', te: 'అన్ని యాక్సెసరీస్ చూడండి →' },
  home_service_badge: { en: 'Mobile Service', te: 'మొబైల్ సర్వీస్' },
  home_service_title: { en: "Screen cracked? Battery draining fast? We fix it.", te: 'స్క్రీన్ పగిలిందా? బ్యాటరీ వేగంగా అయిపోతుందా? మేము రిపేర్ చేస్తాం.' },
  home_service_text: {
    en: 'Register your device online in under a minute, get a transparent quote from our technicians, and track every step — inspection, repair and pay — right here on our site.',
    te: 'ఒక నిమిషంలో మీ డివైజ్‌ని ఆన్‌లైన్‌లో రిజిస్టర్ చేయండి, మా టెక్నీషియన్ల నుండి క్లియర్ కోట్ పొందండి, ఇన్‌స్పెక్షన్, రిపేర్ మరియు పే — ప్రతి స్టెప్‌ని ఇక్కడే ట్రాక్ చేయండి.',
  },
  home_service_cta: { en: 'Book a service appointment', te: 'సర్వీస్ అపాయింట్‌మెంట్ బుక్ చేయండి' },
  home_rating_text: { en: '4.6 / 5 service rating', te: '4.6 / 5 సర్వీస్ రేటింగ్' },
  home_rating_sub: { en: 'from customers in Nagari & nearby towns', te: 'నగరి & చుట్టుపక్కల టౌన్ల కస్టమర్ల నుండి' },
  home_parts_title: { en: 'Genuine spare parts', te: 'జెన్యూయిన్ స్పేర్ పార్ట్స్' },
  home_parts_sub: { en: 'with a repair warranty on every job', te: 'ప్రతి పనిపై రిపేర్ వారంటీతో' },
  home_visit_title: { en: 'Visit our store', te: 'మా స్టోర్‌ని సందర్శించండి' },
  home_directions: { en: 'Get directions →', te: 'దిక్కులు పొందండి →' },

  mobiles_title: { en: 'Find your mobile', te: 'మీ మొబైల్ కనుగొనండి' },
  search_placeholder: { en: 'Search by phone name or brand, e.g. iPhone, Redmi…', te: 'ఫోన్ పేరు లేదా బ్రాండ్ ద్వారా వెతకండి, ఉదా. iPhone, Redmi…' },
  sort_popular: { en: 'Most popular', te: 'అత్యంత ప్రసిద్ధమైనవి' },
  sort_price_asc: { en: 'Price: Low to High', te: 'ధర: తక్కువ నుండి ఎక్కువ' },
  sort_price_desc: { en: 'Price: High to Low', te: 'ధర: ఎక్కువ నుండి తక్కువ' },
  sort_rating: { en: 'Top rated', te: 'టాప్ రేటెడ్' },
  all_brands: { en: 'All brands', te: 'అన్ని బ్రాండ్లు' },
  any_price: { en: 'Any price', te: 'ఏ ధర అయినా' },
  no_match_title: { en: 'No phones match these filters', te: 'ఈ ఫిల్టర్లకు సరిపోయే ఫోన్లు లేవు' },
  no_match_sub: { en: 'Try a different brand or a higher price range.', te: 'వేరే బ్రాండ్ లేదా ఎక్కువ ధర పరిధిని ప్రయత్నించండి.' },
  reset_filters: { en: 'Reset filters', te: 'ఫిల్టర్లను రీసెట్ చేయండి' },

  accessories_title: { en: 'Mobile accessories', te: 'మొబైల్ యాక్సెసరీస్' },
  accessories_subtitle: {
    en: 'Earphones, earbuds, covers, tempered glass, chargers, cables, power banks and batteries — all in stock.',
    te: 'ఇయర్‌ఫోన్లు, ఇయర్‌బడ్స్, కవర్లు, టెంపర్డ్ గ్లాస్, చార్జర్లు, కేబుల్స్, పవర్ బ్యాంక్‌లు మరియు బ్యాటరీలు — అన్నీ స్టాక్‌లో ఉన్నాయి.',
  },
  all_categories: { en: 'All categories', te: 'అన్ని కేటగరీలు' },
  no_accessory_match_title: { en: 'No accessories match these filters', te: 'ఈ ఫిల్టర్లకు సరిపోయే యాక్సెసరీస్ లేవు' },

  add_to_compare: { en: 'Add to compare', te: 'పోల్చడానికి జోడించండి' },
  added_to_compare: { en: 'Added to compare', te: 'పోల్చడానికి జోడించబడింది' },
  product_specifications: { en: 'Specifications', te: 'స్పెసిఫికేషన్లు' },
  call_to_reserve: { en: 'Call to reserve', te: 'రిజర్వ్ చేయడానికి కాల్ చేయండి' },
  warranty_badge: { en: '1-year warranty', te: '1 సంవత్సరం వారంటీ' },
  pickup_badge: { en: 'Same-day pickup', te: 'అదే రోజు పికప్' },
  exchange_badge: { en: 'Exchange available', te: 'ఎక్స్‌చేంజ్ అందుబాటులో ఉంది' },
  more_from: { en: 'More from', te: 'మరిన్ని' },
  in_stock_note: { en: 'Inclusive of all taxes · In stock at Nagari store', te: 'అన్ని పన్నులు కలుపుకుని · నగరి స్టోర్‌లో స్టాక్‌లో ఉంది' },

  compare_title: { en: 'Compare mobiles', te: 'మొబైల్స్ పోల్చండి' },
  compare_subtitle: { en: 'Pick up to 4 phones and see their specifications side by side.', te: '4 ఫోన్ల వరకు ఎంచుకుని వాటి స్పెసిఫికేషన్లను పక్కపక్కనే చూడండి.' },
  compare_none_title: { en: 'No phones selected yet', te: 'ఇంకా ఫోన్లు ఎంచుకోలేదు' },
  compare_none_sub: { en: "Add phones from the list below, or from any mobile's page.", te: 'దిగువ లిస్ట్ నుండి లేదా ఏ మొబైల్ పేజీ నుండైనా ఫోన్లను జోడించండి.' },
  compare_add_another: { en: 'Add another phone', te: 'మరో ఫోన్ జోడించండి' },
  compare_now: { en: 'Compare now', te: 'ఇప్పుడు పోల్చండి' },
  compare_selected: { en: 'phone(s) selected to compare', te: 'పోల్చడానికి ఫోన్(లు) ఎంచుకోబడ్డాయి' },
  clear: { en: 'Clear', te: 'క్లియర్' },

  offers_title: { en: 'Offers & promotions', te: 'ఆఫర్లు & ప్రమోషన్లు' },
  offers_subtitle: {
    en: 'Live discounts at Kesava Mobiles, Nagari — plus exchange and bank offers you can combine at checkout.',
    te: 'కేసవ మొబైల్స్, నగరిలో లైవ్ డిస్కౌంట్లు — చెక్అవుట్‌లో కలిపి ఉపయోగించే ఎక్స్‌చేంజ్ & బ్యాంక్ ఆఫర్లు.',
  },
  offer_exchange_title: { en: 'Exchange bonus', te: 'ఎక్స్‌చేంజ్ బోనస్' },
  offer_exchange_text: { en: 'Trade in any working smartphone and get up to ₹4,000 extra off, on top of the listed price.', te: 'పనిచేసే ఏ స్మార్ట్‌ఫోన్‌నైనా ఎక్స్‌చేంజ్ చేసి, లిస్ట్ చేసిన ధరపై అదనంగా ₹4,000 వరకు తగ్గింపు పొందండి.' },
  offer_bank_title: { en: 'Bank & EMI offers', te: 'బ్యాంక్ & EMI ఆఫర్లు' },
  offer_bank_text: { en: 'No-cost EMI on 3/6/9 months with major banks. Ask in-store which card gives instant cashback.', te: 'ప్రధాన బ్యాంకులతో 3/6/9 నెలలకు నో-కాస్ట్ EMI. ఏ కార్డ్ వెంటనే క్యాష్‌బ్యాక్ ఇస్తుందో స్టోర్‌లో అడగండి.' },
  offer_refer_title: { en: 'Bring-a-friend', te: 'ఫ్రెండ్‌ని తీసుకురండి' },
  offer_refer_text: { en: 'Refer a friend who buys with us and both of you get a free screen guard + case.', te: 'మా వద్ద కొనుగోలు చేసే ఫ్రెండ్‌ని రెఫర్ చేయండి, ఇద్దరికీ ఫ్రీ స్క్రీన్ గార్డ్ + కవర్ లభిస్తుంది.' },
  offers_all_title: { en: 'All discounted phones', te: 'డిస్కౌంట్‌లో ఉన్న అన్ని ఫోన్లు' },
  offers_none_title: { en: 'No live discounts right now', te: 'ఇప్పుడు లైవ్ డిస్కౌంట్లు లేవు' },
  offers_none_sub: { en: 'Check back soon, or call the store for the latest price.', te: 'త్వరలో మళ్ళీ చూడండి, లేదా తాజా ధర కోసం స్టోర్‌కి కాల్ చేయండి.' },

  service_badge: { en: 'Register for service', te: 'సర్వీస్ కోసం రిజిస్టర్ చేయండి' },
  service_book_title: { en: 'Book a repair appointment', te: 'రిపేర్ అపాయింట్‌మెంట్ బుక్ చేయండి' },
  service_book_text: {
    en: 'Tell us about your device and the issue. Our technicians will inspect it and share a transparent quote before doing any work — track everything online with your code.',
    te: 'మీ డివైజ్ మరియు సమస్య గురించి మాకు చెప్పండి. మా టెక్నీషియన్లు దాన్ని పరిశీలించి, ఏ పని చేయకముందే క్లియర్ కోట్ ఇస్తారు — మీ కోడ్‌తో ఆన్‌లైన్‌లో ప్రతిదీ ట్రాక్ చేయండి.',
  },
  service_li_warranty: { en: 'Genuine spare parts with repair warranty', te: 'రిపేర్ వారంటీతో జెన్యూయిన్ స్పేర్ పార్ట్స్' },
  service_li_time: { en: 'Most repairs done within 24–48 hours', te: 'చాలా రిపేర్లు 24–48 గంటల్లో పూర్తవుతాయి' },
  field_name: { en: 'Your name', te: 'మీ పేరు' },
  field_phone: { en: 'Phone number', te: 'ఫోన్ నంబర్' },
  field_email: { en: 'Email (optional)', te: 'ఇమెయిల్ (ఆప్షనల్)' },
  field_brand: { en: 'Device brand', te: 'డివైజ్ బ్రాండ్' },
  field_model: { en: 'Device model', te: 'డివైజ్ మోడల్' },
  field_type: { en: 'Service type', te: 'సర్వీస్ రకం' },
  field_issue: { en: 'Describe the issue', te: 'సమస్యను వివరించండి' },
  field_date: { en: 'Preferred date', te: 'కావలసిన తేదీ' },
  field_time: { en: 'Preferred time', te: 'కావలసిన సమయం' },
  book_btn: { en: 'Book service appointment', te: 'సర్వీస్ అపాయింట్‌మెంట్ బుక్ చేయండి' },
  booking_pending: { en: 'Booking…', te: 'బుక్ చేస్తోంది…' },
  confirm_title: { en: 'Booking confirmed!', te: 'బుకింగ్ నిర్ధారించబడింది!' },
  confirm_text: { en: 'Your device is registered for service. Save this tracking code to follow every step online.', te: 'మీ డివైజ్ సర్వీస్ కోసం రిజిస్టర్ చేయబడింది. ఈ ట్రాకింగ్ కోడ్‌ని సేవ్ చేసుకోండి.' },
  track_this: { en: 'Track this service', te: 'ఈ సర్వీస్‌ని ట్రాక్ చేయండి' },
  back_home: { en: 'Back to home', te: 'హోమ్‌కి తిరిగి వెళ్లండి' },

  track_title: { en: 'Track my service', te: 'నా సర్వీస్‌ని ట్రాక్ చేయండి' },
  track_subtitle: { en: 'Enter the tracking code you received when you booked, to see live status, your quote and to pay online.', te: 'బుక్ చేసినప్పుడు మీకు వచ్చిన ట్రాకింగ్ కోడ్‌ను ఎంటర్ చేసి, స్టేటస్, కోట్ చూసి ఆన్‌లైన్‌లో పే చేయండి.' },
  track_btn: { en: 'Track service', te: 'సర్వీస్ ట్రాక్ చేయండి' },
  track_notfound_title: { en: "We couldn't find that tracking code", te: 'ఆ ట్రాకింగ్ కోడ్ కనుగొనబడలేదు' },
  track_notfound_sub: { en: 'Double-check the code from your booking confirmation, or call the store for help.', te: 'మీ బుకింగ్ నిర్ధారణ నుండి కోడ్‌ని మళ్ళీ చెక్ చేయండి, లేదా సహాయం కోసం స్టోర్‌కి కాల్ చేయండి.' },
  pay_btn: { en: 'Pay & confirm repair', te: 'పే చేసి రిపేర్ నిర్ధారించండి' },
  pay_processing: { en: 'Processing…', te: 'ప్రాసెస్ అవుతోంది…' },
  status_history: { en: 'Status history', te: 'స్టేటస్ హిస్టరీ' },
  no_quote_yet: {
    en: "Our technician hasn't shared a quote yet. Check back soon — you'll be able to pay online right here once the quote is ready.",
    te: 'మా టెక్నీషియన్ ఇంకా కోట్ ఇవ్వలేదు. కోట్ రెడీ అయినప్పుడు ఇక్కడే ఆన్‌లైన్‌లో పే చేయవచ్చు.',
  },

  contact_title: { en: 'Visit', te: 'సందర్శించండి' },
  contact_subtitle: {
    en: 'is your neighbourhood store for mobile sales and repairs in Nagari, Andhra Pradesh. Walk in for a hands-on demo of any phone, an instant exchange valuation, or to drop off a device for service — or reach us by phone or WhatsApp any time during store hours.',
    te: 'ఆంధ్రప్రదేశ్‌లోని నగరిలో మొబైల్ సేల్స్ మరియు రిపేర్ల కోసం మీ లోకల్ స్టోర్. ఏ ఫోన్‌నైనా చేతికి తీసుకుని చూడటానికి, తక్షణ ఎక్స్‌చేంజ్ వాల్యుయేషన్‌కి, లేదా సర్వీస్ కోసం డివైజ్ ఇవ్వటానికి రండి — లేదా స్టోర్ సమయాల్లో ఫోన్ లేదా వాట్సాప్‌లో మమ్మల్ని సంప్రదించండి.',
  },
  label_address: { en: 'Address', te: 'చిరునామా' },
  label_hours: { en: 'Store hours', te: 'స్టోర్ సమయాలు' },
  label_phone: { en: 'Phone', te: 'ఫోన్' },
  label_whatsapp: { en: 'WhatsApp', te: 'వాట్సాప్' },
  whatsapp_chat: { en: 'Chat with us on WhatsApp', te: 'వాట్సాప్‌లో మాతో చాట్ చేయండి' },
  call_store_btn: { en: 'Call the store', te: 'స్టోర్‌కి కాల్ చేయండి' },
  get_directions_btn: { en: 'Get directions', te: 'దిక్కులు పొందండి' },
  contact_buying_title: { en: 'Buying or booking a repair?', te: 'కొనుగోలు లేదా రిపేర్ బుక్ చేస్తున్నారా?' },
  contact_buying_text: {
    en: 'Browse our latest mobiles and current offers online, or register your device for service before you come in — either way, your visit to the Nagari store will be quicker.',
    te: 'మా తాజా మొబైల్స్ మరియు ఆఫర్లను ఆన్‌లైన్‌లో చూడండి, లేదా వచ్చే ముందు మీ డివైజ్‌ని సర్వీస్ కోసం రిజిస్టర్ చేయండి — దీనితో నగరి స్టోర్‌కి మీ విజిట్ వేగంగా ఉంటుంది.',
  },

  nav_launches: { en: 'New Launches', te: 'కొత్త లాంచ్‌లు' },
  demo_book_btn: { en: 'Book in-store demo', te: 'స్టోర్‌లో డెమో బుక్ చేయండి' },
  demo_book_title: { en: 'Try before you buy', te: 'కొనే ముందు ప్రయత్నించండి' },
  demo_book_text: { en: 'Pick a date and time, and our staff will have this phone ready for you to try at the Nagari store.', te: 'తేదీ మరియు సమయం ఎంచుకోండి, మా సిబ్బంది ఈ ఫోన్‌ని నగరి స్టోర్‌లో మీరు ప్రయత్నించడానికి రెడీగా ఉంచుతారు.' },
  demo_booking_pending: { en: 'Booking…', te: 'బుక్ చేస్తోంది…' },
  demo_confirm_title: { en: 'Demo reserved!', te: 'డెమో రిజర్వ్ చేయబడింది!' },
  demo_confirm_text: { en: "We've reserved this phone for you. Show this code at the store when you arrive.", te: 'మేము ఈ ఫోన్‌ని మీ కోసం రిజర్వ్ చేసాము. మీరు వచ్చినప్పుడు ఈ కోడ్‌ని స్టోర్‌లో చూపించండి.' },
  cancel: { en: 'Cancel', te: 'రద్దు చేయండి' },

  launches_title: { en: 'Upcoming launches', te: 'రాబోయే లాంచ్‌లు' },
  launches_subtitle: {
    en: "Reserve tomorrow's phones today. Pay a small token online and we'll notify you the moment stock arrives at our Nagari store — the token is adjusted fully against your purchase.",
    te: 'రేపటి ఫోన్లను ఇప్పుడే రిజర్వ్ చేయండి. చిన్న టోకెన్ ఆన్‌లైన్‌లో చెల్లించండి, స్టాక్ నగరి స్టోర్‌కి వచ్చిన వెంటనే మేము మీకు తెలియజేస్తాము — టోకెన్ మీ కొనుగోలుపై పూర్తిగా సర్దుబాటు చేయబడుతుంది.',
  },
  launches_expected_price: { en: 'Expected price', te: 'ఆశించిన ధర' },
  launches_token_label: { en: 'Reserve with token', te: 'టోకెన్‌తో రిజర్వ్ చేయండి' },
  prebook_btn: { en: 'Pre-book now', te: 'ఇప్పుడే ప్రీ-బుక్ చేయండి' },
  prebook_title: { en: 'Reserve your spot', te: 'మీ స్థానాన్ని రిజర్వ్ చేయండి' },
  prebook_confirm_title: { en: 'Pre-booking confirmed!', te: 'ప్రీ-బుకింగ్ నిర్ధారించబడింది!' },
  prebook_confirm_text: { en: "We'll notify you the moment it arrives. Show this code at the store to collect your device.", te: 'అది వచ్చిన వెంటనే మేము మీకు తెలియజేస్తాము. మీ డివైజ్ తీసుకోవడానికి ఈ కోడ్‌ని స్టోర్‌లో చూపించండి.' },
  prebook_pending: { en: 'Reserving…', te: 'రిజర్వ్ చేస్తోంది…' },
  no_launches_title: { en: 'No upcoming launches right now', te: 'ఇప్పుడు రాబోయే లాంచ్‌లు లేవు' },
  no_launches_sub: { en: 'Check back soon, or ask in-store about the next big launch.', te: 'త్వరలో మళ్ళీ చూడండి, లేదా తదుపరి లాంచ్ గురించి స్టోర్‌లో అడగండి.' },

  field_delivery_mode: { en: 'How should we get your device?', te: 'మీ డివైజ్‌ని మేము ఎలా తీసుకోవాలి?' },
  delivery_store_dropoff: { en: 'I will drop it off at the store', te: 'నేను దీన్ని స్టోర్‌లో వదిలివెళ్తాను' },
  delivery_doorstep: { en: 'Doorstep pickup', te: 'డోర్‌స్టెప్ పికప్' },
  field_pickup_address: { en: 'Pickup address', te: 'పికప్ చిరునామా' },
  pickup_address_placeholder: { en: 'House no, street, area, landmark…', te: 'ఇంటి నంబర్, వీధి, ప్రాంతం, ల్యాండ్‌మార్క్…' },

  combos_title: { en: 'Combo bundles — save more together', te: 'కాంబో బండిల్స్ — కలిపి ఎక్కువ ఆదా చేయండి' },
  combos_subtitle: { en: 'Hand-picked accessory combos at a special bundle price.', te: 'ఒక ప్రత్యేక బండిల్ ధరకు ఎంచుకున్న యాక్సెసరీ కాంబోలు.' },
  combo_add_btn: { en: 'Add bundle to cart', te: 'బండిల్‌ని కార్ట్‌కి జోడించండి' },
  combo_added: { en: 'Bundle added', te: 'బండిల్ జోడించబడింది' },
  combo_you_save: { en: 'You save', te: 'మీరు ఆదా చేస్తారు' },
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
    if (saved === 'en' || saved === 'te') setLangState(saved)
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
