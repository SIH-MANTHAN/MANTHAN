import type { DashboardSnapshot, LocaleCode } from '../types';

/**
 * Locale-aware editorial text for the (still-mock) dashboard content —
 * weather descriptions, alert titles/summaries, safety recommendations,
 * geofence warnings, marine-life notes, route summaries. Keyed by the
 * content's stable id so it survives regardless of which location profile
 * generated it. Zone/vessel/place PROPER NOUNS (PFZ names, geofence names,
 * vessel names, place labels) are deliberately left as-is in every locale,
 * matching how real INCOIS/IMD advisories keep official zone names and
 * institution names untranslated even in vernacular bulletins.
 */

type L<T> = Record<LocaleCode, T>;

function pick<T>(table: L<T> | undefined, locale: LocaleCode, fallback: T): T {
  if (!table) return fallback;
  return table[locale] ?? table.en ?? fallback;
}

/* ---------- Weather ---------- */
const weatherDescription: Record<string, L<string>> = {
  'wx-1': {
    en: 'Partly cloudy with light sea breeze',
    hi: 'हल्की समुद्री हवा के साथ आंशिक रूप से बादल छाए हुए',
    mr: 'हलक्या सागरी वाऱ्यासह अंशतः ढगाळ',
    ta: 'இலேசான கடல் காற்றுடன் ஓரளவு மேகமூட்டம்',
    te: 'తేలికపాటి సముద్ర గాలితో పాక్షిక మేఘావృతం',
    kn: 'ಲಘು ಸಮುದ್ರ ಗಾಳಿಯೊಂದಿಗೆ ಭಾಗಶಃ ಮೋಡ',
    ml: 'ലഘുവായ കടൽക്കാറ്റോടെ ഭാഗികമായി മേഘാവൃതം',
    bn: 'হালকা সমুদ্রের বাতাসসহ আংশিক মেঘলা',
    gu: 'હળવા દરિયાઈ પવન સાથે આંશિક વાદળછાયું',
  },
};

/* ---------- Alerts ---------- */
const alertText: Record<
  string,
  L<{ title: string; summary: string; actionable?: string }>
> = {
  'alert-1': {
    en: {
      title: 'Moderate swell advisory',
      summary: 'Swell heights of 1.5–2.0 m expected along the north Maharashtra coast through tomorrow morning.',
      actionable: 'Plan shorter trips and return before evening swell build-up.',
    },
    hi: {
      title: 'मध्यम स्वेल सलाह',
      summary: 'उत्तर महाराष्ट्र तट पर कल सुबह तक 1.5–2.0 मी की स्वेल ऊँचाई अपेक्षित है।',
      actionable: 'छोटी यात्राओं की योजना बनाएँ और शाम की स्वेल वृद्धि से पहले लौट आएँ।',
    },
    mr: {
      title: 'मध्यम स्वेल सल्ला',
      summary: 'उत्तर महाराष्ट्र किनाऱ्यावर उद्या सकाळपर्यंत 1.5–2.0 मी उंचीचे स्वेल अपेक्षित आहे.',
      actionable: 'लहान सहली आखा आणि संध्याकाळच्या स्वेल वाढीपूर्वी परत या.',
    },
    ta: {
      title: 'மிதமான சுவெல் ஆலோசனை',
      summary: 'வட மகாராஷ்டிரா கடற்கரையில் நாளை காலை வரை 1.5–2.0 மீ சுவெல் உயரம் எதிர்பார்க்கப்படுகிறது.',
      actionable: 'குறுகிய பயணங்களைத் திட்டமிட்டு, மாலை சுவெல் அதிகரிப்பதற்கு முன் திரும்பவும்.',
    },
    te: {
      title: 'మధ్యస్థ స్వెల్ సలహా',
      summary: 'ఉత్తర మహారాష్ట్ర తీరంలో రేపు ఉదయం వరకు 1.5–2.0 మీ స్వెల్ ఎత్తులు ఊహించబడుతున్నాయి.',
      actionable: 'తక్కువ వ్యవధి ప్రయాణాలు ప్రణాళిక చేసి, సాయంత్రం స్వెల్ పెరగకముందే తిరిగి రండి.',
    },
    kn: {
      title: 'ಮಧ್ಯಮ ಸ್ವೆಲ್ ಸಲಹೆ',
      summary: 'ಉತ್ತರ ಮಹಾರಾಷ್ಟ್ರ ಕರಾವಳಿಯಲ್ಲಿ ನಾಳೆ ಬೆಳಿಗ್ಗೆವರೆಗೆ 1.5–2.0 ಮೀ ಸ್ವೆಲ್ ಎತ್ತರ ನಿರೀಕ್ಷಿಸಲಾಗಿದೆ.',
      actionable: 'ಕಡಿಮೆ ಪ್ರಯಾಣಗಳನ್ನು ಯೋಜಿಸಿ ಮತ್ತು ಸಂಜೆ ಸ್ವೆಲ್ ಏರಿಕೆಗೆ ಮೊದಲು ಹಿಂತಿರುಗಿ.',
    },
    ml: {
      title: 'മിതമായ സ്വെൽ ഉപദേശം',
      summary: 'വടക്കൻ മഹാരാഷ്ട്ര തീരത്ത് നാളെ രാവിലെ വരെ 1.5–2.0 മീ സ്വെൽ ഉയരം പ്രതീക്ഷിക്കുന്നു.',
      actionable: 'ചെറിയ യാത്രകൾ ആസൂത്രണം ചെയ്ത് വൈകുന്നേരത്തെ സ്വെൽ വർധനയ്ക്ക് മുമ്പ് മടങ്ങുക.',
    },
    bn: {
      title: 'মাঝারি সোয়েল পরামর্শ',
      summary: 'উত্তর মহারাষ্ট্র উপকূলে আগামীকাল সকাল পর্যন্ত ১.৫–২.০ মি সোয়েল উচ্চতা প্রত্যাশিত।',
      actionable: 'ছোট ট্রিপ পরিকল্পনা করুন এবং সন্ধ্যার সোয়েল বৃদ্ধির আগে ফিরে আসুন।',
    },
    gu: {
      title: 'મધ્યમ સ્વેલ સલાહ',
      summary: 'ઉત્તર મહારાષ્ટ્ર કિનારે આવતીકાલે સવાર સુધી 1.5–2.0 મી સ્વેલ ઊંચાઈ અપેક્ષિત છે.',
      actionable: 'ટૂંકી સફરનું આયોજન કરો અને સાંજના સ્વેલ વધારા પહેલાં પાછા ફરો.',
    },
  },
  'alert-2': {
    en: {
      title: 'Isolated thunderstorm cells',
      summary: 'Isolated lightning possible 40–60 nm offshore west of Alibag after 16:00 IST.',
      actionable: 'Avoid prolonged exposure in open water during late afternoon.',
    },
    hi: {
      title: 'छिटपुट आंधी सेल',
      summary: '16:00 IST के बाद अलीबाग के पश्चिम में 40–60 nm दूर छिटपुट बिजली संभव।',
      actionable: 'देर दोपहर के दौरान खुले पानी में लंबे समय तक रहने से बचें।',
    },
    mr: {
      title: 'तुरळक वादळी पेशी',
      summary: '16:00 IST नंतर अलिबागच्या पश्चिमेला 40–60 nm अंतरावर तुरळक विजांची शक्यता.',
      actionable: 'दुपारी उशिरा खुल्या पाण्यात दीर्घकाळ राहणे टाळा.',
    },
    ta: {
      title: 'ஒற்றைப்பட்ட இடிமழை செல்கள்',
      summary: '16:00 IST-க்குப் பிறகு அலிபாக்கிற்கு மேற்கே 40–60 nm தொலைவில் ஒற்றைப்பட்ட மின்னல் சாத்தியம்.',
      actionable: 'மதிய பிற்பகுதியில் திறந்த நீரில் நீண்ட நேரம் தங்குவதைத் தவிர்க்கவும்.',
    },
    te: {
      title: 'ఒంటరి ఉరుములతో కూడిన తుఫాను కణాలు',
      summary: '16:00 IST తర్వాత అలిబాగ్‌కు పశ్చిమాన 40–60 nm దూరంలో ఒంటరి మెరుపులు సాధ్యం.',
      actionable: 'మధ్యాహ్నం చివర్లో బహిరంగ జలాల్లో ఎక్కువసేపు ఉండటం మానుకోండి.',
    },
    kn: {
      title: 'ಪ್ರತ್ಯೇಕ ಗುಡುಗು ಮಳೆ ಕೋಶಗಳು',
      summary: '16:00 IST ನಂತರ ಅಲಿಬಾಗ್‌ನ ಪಶ್ಚಿಮಕ್ಕೆ 40–60 nm ದೂರದಲ್ಲಿ ಪ್ರತ್ಯೇಕ ಮಿಂಚು ಸಾಧ್ಯ.',
      actionable: 'ಮಧ್ಯಾಹ್ನದ ತಡವಾಗಿ ತೆರೆದ ನೀರಿನಲ್ಲಿ ದೀರ್ಘಕಾಲ ಇರುವುದನ್ನು ತಪ್ಪಿಸಿ.',
    },
    ml: {
      title: 'ഒറ്റപ്പെട്ട ഇടിമിന്നൽ കോശങ്ങൾ',
      summary: '16:00 IST നു ശേഷം അലിബാഗിന് പടിഞ്ഞാറ് 40–60 nm അകലെ ഒറ്റപ്പെട്ട മിന്നൽ സാധ്യത.',
      actionable: 'ഉച്ചകഴിഞ്ഞ് തുറന്ന ജലത്തിൽ ദീർഘനേരം തുടരുന്നത് ഒഴിവാക്കുക.',
    },
    bn: {
      title: 'বিক্ষিপ্ত বজ্রঝড় কোষ',
      summary: '16:00 IST-এর পর আলিবাগের পশ্চিমে 40–60 nm দূরে বিক্ষিপ্ত বজ্রপাতের সম্ভাবনা।',
      actionable: 'বিকেলের শেষভাগে খোলা জলে দীর্ঘ সময় থাকা এড়িয়ে চলুন।',
    },
    gu: {
      title: 'છૂટાછવાયા વાવાઝોડા કોષો',
      summary: '16:00 IST પછી અલીબાગની પશ્ચિમે 40–60 nm દૂર છૂટાછવાયા વીજળીની શક્યતા.',
      actionable: 'બપોર પછી ખુલ્લા પાણીમાં લાંબો સમય રહેવાનું ટાળો.',
    },
  },
  'alert-3': {
    en: {
      title: 'Approach to restricted waters',
      summary: 'Vessel traffic near operational boundary — maintain watch and AIS.',
    },
    hi: {
      title: 'प्रतिबंधित जल के निकट पहुँच',
      summary: 'परिचालन सीमा के पास जलयान यातायात — निगरानी और AIS बनाए रखें।',
    },
    mr: {
      title: 'प्रतिबंधित जलाजवळ पोहोच',
      summary: 'परिचालन सीमेजवळ जहाज वाहतूक — निरीक्षण आणि AIS सुरू ठेवा.',
    },
    ta: {
      title: 'கட்டுப்படுத்தப்பட்ட நீரை நெருங்குதல்',
      summary: 'செயல்பாட்டு எல்லைக்கு அருகில் கப்பல் போக்குவரத்து — கண்காணிப்பையும் AIS-ஐயும் பராமரிக்கவும்.',
    },
    te: {
      title: 'నిషేధిత జలాల సమీపం',
      summary: 'కార్యాచరణ సరిహద్దు వద్ద నౌకా రద్దీ — నిఘా మరియు AIS కొనసాగించండి.',
    },
    kn: {
      title: 'ನಿರ್ಬಂಧಿತ ನೀರಿನ ಸಮೀಪ',
      summary: 'ಕಾರ್ಯಾಚರಣೆ ಗಡಿಯ ಬಳಿ ಹಡಗು ಸಂಚಾರ — ಕಣ್ಗಾವಲು ಮತ್ತು AIS ಕಾಯ್ದುಕೊಳ್ಳಿ.',
    },
    ml: {
      title: 'നിയന്ത്രിത ജലത്തിന്റെ സാമീപ്യം',
      summary: 'പ്രവർത്തന അതിർത്തിക്ക് സമീപം കപ്പൽ ഗതാഗതം — നിരീക്ഷണവും AIS-ഉം തുടരുക.',
    },
    bn: {
      title: 'সীমাবদ্ধ জলের নিকটবর্তী হওয়া',
      summary: 'পরিচালনাগত সীমানার কাছে জাহাজ চলাচল — নজরদারি ও AIS বজায় রাখুন।',
    },
    gu: {
      title: 'પ્રતિબંધિત પાણીની નજીક પહોંચ',
      summary: 'સંચાલન સીમા નજીક વહાણ ટ્રાફિક — નજર અને AIS જાળવો.',
    },
  },
};

/* ---------- Safety summary + recommendations ---------- */
const safetySummary: Record<string, L<string>> = {
  'safety-1': {
    en: 'Moderate sea conditions based on current wave and wind observations. Favourable for experienced crews with shorter operational windows.',
    hi: 'वर्तमान लहर और हवा अवलोकन के आधार पर मध्यम समुद्री स्थिति। छोटे परिचालन विंडो के साथ अनुभवी दल के लिए अनुकूल।',
    mr: 'सध्याच्या लाट आणि वारा निरीक्षणांवर आधारित मध्यम समुद्र स्थिती. कमी कालावधीच्या परिचालन खिडक्यांसह अनुभवी चालक दलासाठी अनुकूल.',
    ta: 'தற்போதைய அலை மற்றும் காற்று அவதானிப்புகளின் அடிப்படையில் மிதமான கடல் நிலைமைகள். குறுகிய செயல்பாட்டு காலத்துடன் அனுபவமிக்க குழுக்களுக்கு சாதகமானது.',
    te: 'ప్రస్తుత అల మరియు గాలి పరిశీలనల ఆధారంగా మధ్యస్థ సముద్ర పరిస్థితులు. తక్కువ కార్యాచరణ కాలవ్యవధితో అనుభవజ్ఞులైన సిబ్బందికి అనుకూలం.',
    kn: 'ಪ್ರಸ್ತುತ ಅಲೆ ಮತ್ತು ಗಾಳಿ ಅವಲೋಕನಗಳ ಆಧಾರದ ಮೇಲೆ ಮಧ್ಯಮ ಸಮುದ್ರ ಪರಿಸ್ಥಿತಿಗಳು. ಕಡಿಮೆ ಕಾರ್ಯಾಚರಣೆ ಅವಧಿಯೊಂದಿಗೆ ಅನುಭವಿ ಸಿಬ್ಬಂದಿಗೆ ಅನುಕೂಲಕರ.',
    ml: 'നിലവിലെ തിരമാലയും കാറ്റും നിരീക്ഷണങ്ങളെ അടിസ്ഥാനമാക്കി മിതമായ കടൽ അവസ്ഥകൾ. ചെറിയ പ്രവർത്തന സമയങ്ങളോടെ പരിചയസമ്പന്നരായ ജീവനക്കാർക്ക് അനുകൂലം.',
    bn: 'বর্তমান ঢেউ ও বাতাসের পর্যবেক্ষণের ভিত্তিতে মাঝারি সমুদ্র পরিস্থিতি। ছোট পরিচালনা সময়ের সাথে অভিজ্ঞ ক্রুদের জন্য অনুকূল।',
    gu: 'વર્તમાન મોજાં અને પવન અવલોકનોના આધારે મધ્યમ દરિયાઈ સ્થિતિ. ટૂંકા સંચાલન ગાળા સાથે અનુભવી ક્રૂ માટે અનુકૂળ.',
  },
};

const safetyRecommendations: Record<string, L<string[]>> = {
  'safety-1': {
    en: [
      'Depart after morning low swell period',
      'Carry VHF and monitor IMD coastal bulletins',
      'Avoid extended overnight stays offshore today',
    ],
    hi: [
      'सुबह की कम स्वेल अवधि के बाद प्रस्थान करें',
      'VHF साथ रखें और IMD तटीय बुलेटिन देखें',
      'आज अपतटीय रात्रिभर रुकने से बचें',
    ],
    mr: [
      'सकाळच्या कमी स्वेल कालावधीनंतर निघा',
      'VHF सोबत ठेवा आणि IMD किनारी बुलेटिन पहा',
      'आज अपतटावर रात्रभर मुक्काम टाळा',
    ],
    ta: [
      'காலை குறைந்த சுவெல் காலத்திற்குப் பிறகு புறப்படவும்',
      'VHF-ஐ எடுத்துச் சென்று IMD கடலோர புல்லட்டின்களை கண்காணிக்கவும்',
      'இன்று கடலில் நீண்ட நேரம் இரவு தங்குவதைத் தவிர்க்கவும்',
    ],
    te: [
      'ఉదయం తక్కువ స్వెల్ కాలం తర్వాత బయలుదేరండి',
      'VHF తీసుకెళ్లి IMD తీర బులెటిన్లను గమనించండి',
      'ఈరోజు తీరం వెలుపల రాత్రిపూట ఎక్కువసేపు ఉండటం మానుకోండి',
    ],
    kn: [
      'ಬೆಳಿಗ್ಗೆ ಕಡಿಮೆ ಸ್ವೆಲ್ ಅವಧಿಯ ನಂತರ ಹೊರಡಿ',
      'VHF ಜೊತೆ ಇಟ್ಟುಕೊಂಡು IMD ಕರಾವಳಿ ಬುಲೆಟಿನ್‌ಗಳನ್ನು ಗಮನಿಸಿ',
      'ಇಂದು ಕಡಲಾಚೆ ದೀರ್ಘ ರಾತ್ರಿ ವಾಸ್ತವ್ಯ ತಪ್ಪಿಸಿ',
    ],
    ml: [
      'രാവിലെ കുറഞ്ഞ സ്വെൽ കാലയളവിനു ശേഷം പുറപ്പെടുക',
      'VHF കരുതി IMD തീരദേശ ബുള്ളറ്റിനുകൾ നിരീക്ഷിക്കുക',
      'ഇന്ന് കടലിൽ രാത്രി മുഴുവൻ തങ്ങുന്നത് ഒഴിവാക്കുക',
    ],
    bn: [
      'সকালের কম সোয়েল সময়ের পর রওনা দিন',
      'VHF সঙ্গে রাখুন এবং IMD উপকূলীয় বুলেটিন পর্যবেক্ষণ করুন',
      'আজ সমুদ্রে দীর্ঘ রাত্রিযাপন এড়িয়ে চলুন',
    ],
    gu: [
      'સવારના ઓછા સ્વેલ સમયગાળા પછી પ્રસ્થાન કરો',
      'VHF સાથે રાખો અને IMD દરિયાકાંઠાના બુલેટિન જુઓ',
      'આજે દરિયામાં લાંબી રાત્રિ રોકાણ ટાળો',
    ],
  },
};

/* ---------- Geofences ---------- */
const geofenceText: Record<string, L<{ description: string; warningMessage: string }>> = {
  'geo-mpa-1': {
    en: { description: 'Marine protected area with seasonal fishing restrictions.', warningMessage: 'You are approaching a marine protected area. Verify permitted activities.' },
    hi: { description: 'मौसमी मत्स्य प्रतिबंधों वाला समुद्री संरक्षित क्षेत्र।', warningMessage: 'आप एक समुद्री संरक्षित क्षेत्र के निकट पहुँच रहे हैं। अनुमत गतिविधियों की पुष्टि करें।' },
    mr: { description: 'हंगामी मासेमारी निर्बंध असलेले सागरी संरक्षित क्षेत्र.', warningMessage: 'तुम्ही सागरी संरक्षित क्षेत्राजवळ पोहोचत आहात. परवानगी असलेल्या क्रियाकलापांची खात्री करा.' },
    ta: { description: 'பருவகால மீன்பிடி கட்டுப்பாடுகளுடன் கடல் பாதுகாக்கப்பட்ட பகுதி.', warningMessage: 'நீங்கள் ஒரு கடல் பாதுகாக்கப்பட்ட பகுதியை நெருங்குகிறீர்கள். அனுமதிக்கப்பட்ட செயல்பாடுகளை உறுதிப்படுத்தவும்.' },
    te: { description: 'కాలానుగుణ చేపల వేట ఆంక్షలతో సముద్ర సంరక్షిత ప్రాంతం.', warningMessage: 'మీరు సముద్ర సంరక్షిత ప్రాంతానికి సమీపిస్తున్నారు. అనుమతించబడిన కార్యకలాపాలను నిర్ధారించుకోండి.' },
    kn: { description: 'ಋತುಮಾನ ಮೀನುಗಾರಿಕೆ ನಿರ್ಬಂಧಗಳೊಂದಿಗೆ ಸಮುದ್ರ ಸಂರಕ್ಷಿತ ಪ್ರದೇಶ.', warningMessage: 'ನೀವು ಸಮುದ್ರ ಸಂರಕ್ಷಿತ ಪ್ರದೇಶವನ್ನು ಸಮೀಪಿಸುತ್ತಿದ್ದೀರಿ. ಅನುಮತಿಸಲಾದ ಚಟುವಟಿಕೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.' },
    ml: { description: 'സീസണൽ മത്സ്യബന്ധന നിയന്ത്രണങ്ങളുള്ള സമുദ്ര സംരക്ഷിത മേഖല.', warningMessage: 'നിങ്ങൾ ഒരു സമുദ്ര സംരക്ഷിത മേഖലയെ സമീപിക്കുന്നു. അനുവദനീയമായ പ്രവർത്തനങ്ങൾ സ്ഥിരീകരിക്കുക.' },
    bn: { description: 'ঋতুভিত্তিক মৎস্য নিষেধাজ্ঞাসহ সামুদ্রিক সংরক্ষিত এলাকা।', warningMessage: 'আপনি একটি সামুদ্রিক সংরক্ষিত এলাকার কাছে যাচ্ছেন। অনুমোদিত কার্যক্রম যাচাই করুন।' },
    gu: { description: 'મોસમી મત્સ્ય પ્રતિબંધો સાથે દરિયાઈ સંરક્ષિત વિસ્તાર.', warningMessage: 'તમે દરિયાઈ સંરક્ષિત વિસ્તારની નજીક પહોંચી રહ્યા છો. મંજૂર પ્રવૃત્તિઓ ચકાસો.' },
  },
  'geo-restricted-1': {
    en: { description: 'Restricted navigation corridor for commercial traffic.', warningMessage: 'Restricted waters ahead. Maintain designated channel.' },
    hi: { description: 'वाणिज्यिक यातायात के लिए प्रतिबंधित नौवहन गलियारा।', warningMessage: 'आगे प्रतिबंधित जल। निर्धारित चैनल बनाए रखें।' },
    mr: { description: 'व्यावसायिक वाहतुकीसाठी प्रतिबंधित नौवहन मार्गिका.', warningMessage: 'पुढे प्रतिबंधित जल. निर्दिष्ट वाहिनी कायम ठेवा.' },
    ta: { description: 'வணிக போக்குவரத்திற்கான கட்டுப்படுத்தப்பட்ட வழிசெலுத்தல் பாதை.', warningMessage: 'முன்னால் கட்டுப்படுத்தப்பட்ட நீர். நியமிக்கப்பட்ட வழியைப் பராமரிக்கவும்.' },
    te: { description: 'వాణిజ్య రద్దీ కోసం నిషేధిత నావిగేషన్ కారిడార్.', warningMessage: 'ముందు నిషేధిత జలాలు. నియమిత మార్గాన్ని కొనసాగించండి.' },
    kn: { description: 'ವಾಣಿಜ್ಯ ಸಂಚಾರಕ್ಕಾಗಿ ನಿರ್ಬಂಧಿತ ನ್ಯಾವಿಗೇಷನ್ ಕಾರಿಡಾರ್.', warningMessage: 'ಮುಂದೆ ನಿರ್ಬಂಧಿತ ನೀರು. ನಿಗದಿತ ಚಾನಲ್ ಕಾಯ್ದುಕೊಳ್ಳಿ.' },
    ml: { description: 'വാണിജ്യ ഗതാഗതത്തിനുള്ള നിയന്ത്രിത നാവിഗേഷൻ ഇടനാഴി.', warningMessage: 'മുന്നിൽ നിയന്ത്രിത ജലം. നിശ്ചിത ചാനൽ പിന്തുടരുക.' },
    bn: { description: 'বাণিজ্যিক চলাচলের জন্য সীমাবদ্ধ নৌ-করিডোর।', warningMessage: 'সামনে সীমাবদ্ধ জলাশয়। নির্ধারিত চ্যানেল বজায় রাখুন।' },
    gu: { description: 'વ્યાપારી ટ્રાફિક માટે પ્રતિબંધિત નેવિગેશન કોરિડોર.', warningMessage: 'આગળ પ્રતિબંધિત પાણી. નિયત ચેનલ જાળવો.' },
  },
  'geo-boundary-1': {
    en: { description: 'Placeholder international maritime boundary corridor.', warningMessage: 'Approaching maritime boundary. Do not cross without clearance.' },
    hi: { description: 'अस्थायी अंतरराष्ट्रीय समुद्री सीमा गलियारा।', warningMessage: 'समुद्री सीमा के निकट। मंजूरी के बिना पार न करें।' },
    mr: { description: 'तात्पुरता आंतरराष्ट्रीय सागरी सीमा मार्गिका.', warningMessage: 'सागरी सीमेजवळ. मंजुरीशिवाय ओलांडू नका.' },
    ta: { description: 'தற்காலிக சர்வதேச கடல் எல்லைப் பாதை.', warningMessage: 'கடல் எல்லையை நெருங்குகிறது. அனுமதி இல்லாமல் கடக்க வேண்டாம்.' },
    te: { description: 'తాత్కాలిక అంతర్జాతీయ సముద్ర సరిహద్దు కారిడార్.', warningMessage: 'సముద్ర సరిహద్దు సమీపం. అనుమతి లేకుండా దాటవద్దు.' },
    kn: { description: 'ತಾತ್ಕಾಲಿಕ ಅಂತರರಾಷ್ಟ್ರೀಯ ಸಮುದ್ರ ಗಡಿ ಕಾರಿಡಾರ್.', warningMessage: 'ಸಮುದ್ರ ಗಡಿ ಸಮೀಪಿಸುತ್ತಿದೆ. ಅನುಮತಿ ಇಲ್ಲದೆ ದಾಟಬೇಡಿ.' },
    ml: { description: 'താൽക്കാലിക അന്താരാഷ്ട്ര സമുദ്ര അതിർത്തി ഇടനാഴി.', warningMessage: 'സമുദ്ര അതിർത്തി സമീപം. അനുമതിയില്ലാതെ കടക്കരുത്.' },
    bn: { description: 'অস্থায়ী আন্তর্জাতিক সামুদ্রিক সীমানা করিডোর।', warningMessage: 'সামুদ্রিক সীমানার কাছাকাছি। অনুমতি ছাড়া অতিক্রম করবেন না।' },
    gu: { description: 'કામચલાઉ આંતરરાષ્ટ્રીય દરિયાઈ સીમા કોરિડોર.', warningMessage: 'દરિયાઈ સીમા નજીક. મંજૂરી વિના પાર ન કરો.' },
  },
  'geo-esa-1': {
    en: { description: 'Ecologically sensitive zone near turtle nesting habitat.', warningMessage: 'Ecologically sensitive zone — minimise disturbance and lighting.' },
    hi: { description: 'कछुआ नेस्टिंग आवास के निकट पारिस्थितिक रूप से संवेदनशील क्षेत्र।', warningMessage: 'पारिस्थितिक रूप से संवेदनशील क्षेत्र — व्यवधान और रोशनी कम करें।' },
    mr: { description: 'कासव घरटी अधिवासाजवळ पर्यावरणीयदृष्ट्या संवेदनशील क्षेत्र.', warningMessage: 'पर्यावरणीयदृष्ट्या संवेदनशील क्षेत्र — त्रास आणि प्रकाश कमी करा.' },
    ta: { description: 'ஆமை கூடு கட்டும் வாழிடத்திற்கு அருகில் சூழலியல் ரீதியாக உணர்திறன் மண்டலம்.', warningMessage: 'சூழலியல் ரீதியாக உணர்திறன் மண்டலம் — இடையூறு மற்றும் ஒளியைக் குறைக்கவும்.' },
    te: { description: 'తాబేలు గూడు నివాసానికి సమీపంలో పర్యావరణపరంగా సున్నితమైన మండలం.', warningMessage: 'పర్యావరణపరంగా సున్నితమైన మండలం — భంగం మరియు వెలుతురు తగ్గించండి.' },
    kn: { description: 'ಆಮೆ ಗೂಡಿನ ಆವಾಸಸ್ಥಾನದ ಬಳಿ ಪರಿಸರೀಯವಾಗಿ ಸೂಕ್ಷ್ಮ ವಲಯ.', warningMessage: 'ಪರಿಸರೀಯವಾಗಿ ಸೂಕ್ಷ್ಮ ವಲಯ — ಅಡಚಣೆ ಮತ್ತು ಬೆಳಕನ್ನು ಕಡಿಮೆ ಮಾಡಿ.' },
    ml: { description: 'ആമ കൂടുവയ്ക്കുന്ന ആവാസവ്യവസ്ഥയ്ക്ക് സമീപം പരിസ്ഥിതി സെൻസിറ്റീവ് മേഖല.', warningMessage: 'പരിസ്ഥിതി സെൻസിറ്റീവ് മേഖല — ശല്യവും വെളിച്ചവും കുറയ്ക്കുക.' },
    bn: { description: 'কচ্ছপের বাসা তৈরির আবাসস্থলের কাছে পরিবেশগতভাবে সংবেদনশীল অঞ্চল।', warningMessage: 'পরিবেশগতভাবে সংবেদনশীল অঞ্চল — বিঘ্ন ও আলো কমান।' },
    gu: { description: 'કાચબાના માળાના રહેઠાણ નજીક પર્યાવરણીય રીતે સંવેદનશીલ ઝોન.', warningMessage: 'પર્યાવરણીય રીતે સંવેદનશીલ ઝોન — ખલેલ અને પ્રકાશ ઘટાડો.' },
  },
};

/* ---------- Marine life ---------- */
const marineLifeText: Record<string, L<{ commonName: string; notes: string; observer: string }>> = {
  'life-1': {
    en: { commonName: 'Indo-Pacific bottlenose dolphin', notes: 'Pod travelling north parallel to shelf break.', observer: 'Coastal Observer Network' },
    hi: { commonName: 'इंडो-पैसिफिक बॉटलनोज़ डॉल्फिन', notes: 'शेल्फ ब्रेक के समानांतर उत्तर की ओर यात्रा करता झुंड।', observer: 'तटीय पर्यवेक्षक नेटवर्क' },
    mr: { commonName: 'इंडो-पॅसिफिक बॉटलनोज डॉल्फिन', notes: 'शेल्फ ब्रेकला समांतर उत्तरेकडे प्रवास करणारा कळप.', observer: 'किनारी निरीक्षक नेटवर्क' },
    ta: { commonName: 'இந்தோ-பசிபிக் பாட்டில்நோஸ் டால்பின்', notes: 'ஷெல்ஃப் பிரேக்கிற்கு இணையாக வடக்கு நோக்கி பயணிக்கும் கூட்டம்.', observer: 'கடலோர கண்காணிப்பு நெட்வொர்க்' },
    te: { commonName: 'ఇండో-పసిఫిక్ బాటిల్‌నోస్ డాల్ఫిన్', notes: 'షెల్ఫ్ బ్రేక్‌కు సమాంతరంగా ఉత్తరం వైపు ప్రయాణిస్తున్న గుంపు.', observer: 'తీర పరిశీలక నెట్‌వర్క్' },
    kn: { commonName: 'ಇಂಡೋ-ಪೆಸಿಫಿಕ್ ಬಾಟಲ್‌ನೋಸ್ ಡಾಲ್ಫಿನ್', notes: 'ಶೆಲ್ಫ್ ಬ್ರೇಕ್‌ಗೆ ಸಮಾನಾಂತರವಾಗಿ ಉತ್ತರಕ್ಕೆ ಪ್ರಯಾಣಿಸುತ್ತಿರುವ ಗುಂಪು.', observer: 'ಕರಾವಳಿ ವೀಕ್ಷಕ ಜಾಲ' },
    ml: { commonName: 'ഇന്തോ-പസഫിക് ബോട്ടിൽനോസ് ഡോൾഫിൻ', notes: 'ഷെൽഫ് ബ്രേക്കിന് സമാന്തരമായി വടക്കോട്ട് സഞ്ചരിക്കുന്ന കൂട്ടം.', observer: 'തീരദേശ നിരീക്ഷക ശൃംഖല' },
    bn: { commonName: 'ইন্দো-প্যাসিফিক বটলনোজ ডলফিন', notes: 'শেল্ফ ব্রেকের সমান্তরালে উত্তরে যাত্রারত দল।', observer: 'উপকূলীয় পর্যবেক্ষক নেটওয়ার্ক' },
    gu: { commonName: 'ઇન્ડો-પેસિફિક બોટલનોઝ ડોલ્ફિન', notes: 'શેલ્ફ બ્રેકને સમાંતર ઉત્તર તરફ મુસાફરી કરતું ટોળું.', observer: 'દરિયાકાંઠાનું નિરીક્ષક નેટવર્ક' },
  },
  'life-2': {
    en: { commonName: 'Green sea turtle', notes: 'Surface observation near reef fringe.', observer: 'Fisher report — Verified' },
    hi: { commonName: 'हरा समुद्री कछुआ', notes: 'रीफ किनारे के पास सतह अवलोकन।', observer: 'मछुआरा रिपोर्ट — सत्यापित' },
    mr: { commonName: 'हिरवा समुद्री कासव', notes: 'रीफ किनाऱ्याजवळ पृष्ठभाग निरीक्षण.', observer: 'मच्छीमार अहवाल — सत्यापित' },
    ta: { commonName: 'பச்சை கடல் ஆமை', notes: 'பாறை விளிம்பிற்கு அருகில் மேற்பரப்பு அவதானிப்பு.', observer: 'மீனவர் அறிக்கை — சரிபார்க்கப்பட்டது' },
    te: { commonName: 'ఆకుపచ్చ సముద్ర తాబేలు', notes: 'రీఫ్ అంచు వద్ద ఉపరితల పరిశీలన.', observer: 'మత్స్యకారుడి నివేదిక — ధృవీకరించబడింది' },
    kn: { commonName: 'ಹಸಿರು ಸಮುದ್ರ ಆಮೆ', notes: 'ರೀಫ್ ಅಂಚಿನ ಬಳಿ ಮೇಲ್ಮೈ ವೀಕ್ಷಣೆ.', observer: 'ಮೀನುಗಾರ ವರದಿ — ಪರಿಶೀಲಿಸಲಾಗಿದೆ' },
    ml: { commonName: 'പച്ച കടലാമ', notes: 'റീഫ് അരികിൽ ഉപരിതല നിരീക്ഷണം.', observer: 'മത്സ്യത്തൊഴിലാളി റിപ്പോർട്ട് — സ്ഥിരീകരിച്ചു' },
    bn: { commonName: 'সবুজ সামুদ্রিক কচ্ছপ', notes: 'প্রাচীরের কিনারার কাছে পৃষ্ঠ পর্যবেক্ষণ।', observer: 'জেলের প্রতিবেদন — যাচাইকৃত' },
    gu: { commonName: 'લીલો દરિયાઈ કાચબો', notes: 'રીફ કિનારે નજીક સપાટી અવલોકન.', observer: 'માછીમાર અહેવાલ — ચકાસાયેલ' },
  },
  'life-3': {
    en: { commonName: "Bryde's whale", notes: 'Single adult; feeding behaviour noted.', observer: 'Research transect' },
    hi: { commonName: 'ब्राइड्स व्हेल', notes: 'एकल वयस्क; भोजन व्यवहार दर्ज किया गया।', observer: 'शोध ट्रांसेक्ट' },
    mr: { commonName: 'ब्राइड्स व्हेल', notes: 'एकच प्रौढ; आहार वर्तन नोंदवले.', observer: 'संशोधन ट्रान्सेक्ट' },
    ta: { commonName: 'பிரைடின் திமிங்கிலம்', notes: 'ஒற்றை வயது வந்தவர்; உணவளிக்கும் நடத்தை குறிப்பிடப்பட்டது.', observer: 'ஆராய்ச்சி டிரான்செக்ட்' },
    te: { commonName: 'బ్రైడ్స్ తిమింగలం', notes: 'ఒకే వయోజన జీవి; ఆహార ప్రవర్తన గమనించబడింది.', observer: 'పరిశోధన ట్రాన్సెక్ట్' },
    kn: { commonName: 'ಬ್ರೈಡ್ಸ್ ತಿಮಿಂಗಿಲ', notes: 'ಒಂಟಿ ವಯಸ್ಕ; ಆಹಾರ ವರ್ತನೆ ಗಮನಿಸಲಾಗಿದೆ.', observer: 'ಸಂಶೋಧನಾ ಟ್ರಾನ್ಸೆಕ್ಟ್' },
    ml: { commonName: 'ബ്രൈഡ്സ് തിമിംഗലം', notes: 'ഒറ്റ മുതിർന്ന ജീവി; ഭക്ഷണരീതി രേഖപ്പെടുത്തി.', observer: 'ഗവേഷണ ട്രാൻസെക്ട്' },
    bn: { commonName: 'ব্রাইডস তিমি', notes: 'একক প্রাপ্তবয়স্ক; খাদ্যগ্রহণ আচরণ লক্ষ্য করা গেছে।', observer: 'গবেষণা ট্রানসেক্ট' },
    gu: { commonName: 'બ્રાઇડ્સ વ્હેલ', notes: 'એકલ પુખ્ત; ખોરાક વર્તન નોંધાયું.', observer: 'સંશોધન ટ્રાન્સેક્ટ' },
  },
};

/* ---------- Route ---------- */
const routeText: Record<string, L<{ weatherSummary: string; considerations: string[] }>> = {
  'route-1': {
    en: {
      weatherSummary: 'Light SW breeze, moderate visibility, rising tide on departure.',
      considerations: [
        'Avoids restricted harbour lane',
        'Routes west of isolated thunderstorm cell',
        'Wave heights remain below 1.5 m along track',
      ],
    },
    hi: {
      weatherSummary: 'हल्की दक्षिण-पश्चिमी हवा, मध्यम दृश्यता, प्रस्थान पर बढ़ता ज्वार।',
      considerations: [
        'प्रतिबंधित बंदरगाह गलियारे से बचता है',
        'छिटपुट आंधी सेल के पश्चिम में मार्ग',
        'मार्ग पर लहर ऊँचाई 1.5 मी से नीचे रहती है',
      ],
    },
    mr: {
      weatherSummary: 'हलकी नैऋत्य वारा, मध्यम दृश्यता, निघताना वाढती भरती.',
      considerations: [
        'प्रतिबंधित बंदर मार्गिका टाळतो',
        'तुरळक वादळी पेशीच्या पश्चिमेकडून मार्ग',
        'मार्गावर लाट उंची 1.5 मी खाली राहते',
      ],
    },
    ta: {
      weatherSummary: 'இலேசான தென்மேற்கு காற்று, மிதமான தெரிவுநிலை, புறப்படும்போது ஏறும் அலை.',
      considerations: [
        'கட்டுப்படுத்தப்பட்ட துறைமுக பாதையை தவிர்க்கிறது',
        'ஒற்றைப்பட்ட இடிமழை செல்லுக்கு மேற்கே பாதை',
        'பாதை முழுவதும் அலை உயரம் 1.5 மீக்கு கீழே உள்ளது',
      ],
    },
    te: {
      weatherSummary: 'తేలికపాటి నైరుతి గాలి, మధ్యస్థ దృశ్యమానత, బయలుదేరేటప్పుడు పెరుగుతున్న ఆటుపోటు.',
      considerations: [
        'నిషేధిత రేవు మార్గాన్ని నివారిస్తుంది',
        'ఒంటరి తుఫాను కణానికి పశ్చిమాన మార్గం',
        'మార్గం వెంబడి అల ఎత్తులు 1.5 మీ కంటే తక్కువగా ఉంటాయి',
      ],
    },
    kn: {
      weatherSummary: 'ಲಘು ನೈಋತ್ಯ ಗಾಳಿ, ಮಧ್ಯಮ ಗೋಚರತೆ, ಹೊರಡುವಾಗ ಏರುತ್ತಿರುವ ಉಬ್ಬರ.',
      considerations: [
        'ನಿರ್ಬಂಧಿತ ಬಂದರು ಮಾರ್ಗವನ್ನು ತಪ್ಪಿಸುತ್ತದೆ',
        'ಪ್ರತ್ಯೇಕ ಗುಡುಗು ಕೋಶದ ಪಶ್ಚಿಮಕ್ಕೆ ಮಾರ್ಗ',
        'ಮಾರ್ಗದುದ್ದಕ್ಕೂ ಅಲೆ ಎತ್ತರ 1.5 ಮೀ ಗಿಂತ ಕಡಿಮೆ ಇರುತ್ತದೆ',
      ],
    },
    ml: {
      weatherSummary: 'ലഘുവായ തെക്ക്-പടിഞ്ഞാറൻ കാറ്റ്, മിതമായ ദൃശ്യപരത, പുറപ്പെടുമ്പോൾ ഉയരുന്ന വേലിയേറ്റം.',
      considerations: [
        'നിയന്ത്രിത തുറമുഖ പാത ഒഴിവാക്കുന്നു',
        'ഒറ്റപ്പെട്ട ഇടിമിന്നൽ കോശത്തിന് പടിഞ്ഞാറായി പാത',
        'പാതയിലുടനീളം തിരമാല ഉയരം 1.5 മീറ്ററിനു താഴെ നിലനിൽക്കുന്നു',
      ],
    },
    bn: {
      weatherSummary: 'হালকা দক্ষিণ-পশ্চিমা বাতাস, মাঝারি দৃশ্যমানতা, রওনার সময় ক্রমবর্ধমান জোয়ার।',
      considerations: [
        'সীমাবদ্ধ বন্দর করিডোর এড়িয়ে যায়',
        'বিক্ষিপ্ত বজ্রঝড় কোষের পশ্চিমে পথ',
        'পথ জুড়ে ঢেউয়ের উচ্চতা ১.৫ মি-এর নিচে থাকে',
      ],
    },
    gu: {
      weatherSummary: 'હળવો નૈઋત્ય પવન, મધ્યમ દૃશ્યતા, પ્રસ્થાન સમયે વધતી ભરતી.',
      considerations: [
        'પ્રતિબંધિત બંદર માર્ગ ટાળે છે',
        'છૂટાછવાયા વાવાઝોડા કોષની પશ્ચિમે માર્ગ',
        'માર્ગ પર મોજાની ઊંચાઈ 1.5 મી થી નીચે રહે છે',
      ],
    },
  },
};

export function localizeDashboard(
  snapshot: DashboardSnapshot,
  locale: LocaleCode,
): DashboardSnapshot {
  if (locale === 'en') return snapshot;

  const weather = {
    ...snapshot.ocean.weather,
    description: pick(weatherDescription[snapshot.ocean.weather.id], locale, snapshot.ocean.weather.description),
  };

  const alerts = snapshot.alerts.map((a) => {
    const tr = alertText[a.id];
    if (!tr) return a;
    const localized = pick(tr, locale, { title: a.title, summary: a.summary, actionable: a.actionable });
    return { ...a, ...localized };
  });

  const safety = {
    ...snapshot.safety,
    weather,
    alerts,
    summary: pick(safetySummary[snapshot.safety.id], locale, snapshot.safety.summary),
    recommendations: pick(safetyRecommendations[snapshot.safety.id], locale, snapshot.safety.recommendations),
  };

  const geofences = snapshot.geofences.map((g) => {
    const tr = geofenceText[g.id];
    if (!tr) return g;
    const localized = pick(tr, locale, { description: g.description, warningMessage: g.warningMessage });
    return { ...g, ...localized };
  });

  const marineLife = snapshot.marineLife.map((m) => {
    const tr = marineLifeText[m.id];
    if (!tr) return m;
    const localized = pick(tr, locale, { commonName: m.commonName, notes: m.notes, observer: m.observer });
    return { ...m, ...localized };
  });

  const routes = snapshot.routes.map((r) => {
    const tr = routeText[r.id];
    if (!tr) return r;
    const localized = pick(tr, locale, { weatherSummary: r.weatherSummary, considerations: r.considerations });
    return { ...r, ...localized };
  });

  return {
    ...snapshot,
    ocean: { ...snapshot.ocean, weather },
    safety,
    alerts,
    geofences,
    marineLife,
    routes,
  };
}
