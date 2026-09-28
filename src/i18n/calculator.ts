import type { LocaleCode } from '../types';

type Key =
  | 'navCalc' | 'title' | 'sub' | 'sst' | 'chl' | 'front' | 'waves' | 'wind'
  | 'prefilled' | 'score' | 'high' | 'medium' | 'low' | 'unsafe'
  | 'factors' | 'fSst' | 'fChl' | 'fFront' | 'fSea' | 'reset' | 'disclaimer' | 'unsafeNote';

const d: Record<LocaleCode, Record<Key, string>> = {
  en: { navCalc: 'Catch', title: 'Fishing probability calculator', sub: 'Adjust the sea conditions to see how likely a productive fishing zone is, and why.', sst: 'Sea surface temp (°C)', chl: 'Chlorophyll-a (mg/m³)', front: 'Thermal front (°C per 10 km)', waves: 'Wave height (m)', wind: 'Wind (kt)', prefilled: 'Starting values come from the current dashboard reading.', score: 'Fishing probability', high: 'High', medium: 'Moderate', low: 'Low', unsafe: 'Unsafe', factors: 'What drives the score', fSst: 'Temperature suitability', fChl: 'Food availability (chlorophyll)', fFront: 'Thermal front strength', fSea: 'Sea-state safety', reset: 'Reset to current readings', disclaimer: 'Explainable heuristic based on how PFZ advisories correlate SST fronts and chlorophyll with fish aggregation. Not a validated catch prediction; always follow official INCOIS/IMD advisories.', unsafeNote: 'Sea state exceeds safe limits for small craft. Score capped.' },
  hi: { navCalc: 'पकड़', title: 'मछली पकड़ने की संभावना कैलकुलेटर', sub: 'समुद्री स्थितियाँ बदलकर देखें कि उत्पादक मत्स्य क्षेत्र की कितनी संभावना है, और क्यों।', sst: 'समुद्र सतह तापमान (°C)', chl: 'क्लोरोफिल-a (mg/m³)', front: 'तापीय फ्रंट (°C प्रति 10 किमी)', waves: 'लहर ऊँचाई (मी)', wind: 'हवा (kt)', prefilled: 'शुरुआती मान वर्तमान डैशबोर्ड रीडिंग से लिए गए हैं।', score: 'मछली पकड़ने की संभावना', high: 'उच्च', medium: 'मध्यम', low: 'कम', unsafe: 'असुरक्षित', factors: 'स्कोर किन बातों पर निर्भर है', fSst: 'तापमान अनुकूलता', fChl: 'भोजन उपलब्धता (क्लोरोफिल)', fFront: 'तापीय फ्रंट की ताकत', fSea: 'समुद्री स्थिति सुरक्षा', reset: 'वर्तमान रीडिंग पर रीसेट करें', disclaimer: 'यह PFZ सलाह की तरह SST फ्रंट और क्लोरोफिल को मछली एकत्रीकरण से जोड़ने वाला व्याख्यात्मक अनुमान है। सत्यापित पकड़ पूर्वानुमान नहीं; हमेशा आधिकारिक INCOIS/IMD सलाह मानें।', unsafeNote: 'समुद्री स्थिति छोटी नावों के लिए सुरक्षित सीमा से अधिक है। स्कोर सीमित।' },
  mr: { navCalc: 'पकड', title: 'मासेमारी शक्यता कॅल्क्युलेटर', sub: 'समुद्र स्थिती बदलून उत्पादक मासेमारी क्षेत्राची शक्यता किती आणि का ते पहा.', sst: 'समुद्र पृष्ठ तापमान (°C)', chl: 'क्लोरोफिल-a (mg/m³)', front: 'तापीय फ्रंट (°C प्रति 10 किमी)', waves: 'लाट उंची (मी)', wind: 'वारा (kt)', prefilled: 'सुरुवातीची मूल्ये सध्याच्या डॅशबोर्ड वाचनातून घेतली आहेत.', score: 'मासेमारी शक्यता', high: 'उच्च', medium: 'मध्यम', low: 'कमी', unsafe: 'असुरक्षित', factors: 'गुण कशावर अवलंबून आहे', fSst: 'तापमान अनुकूलता', fChl: 'अन्न उपलब्धता (क्लोरोफिल)', fFront: 'तापीय फ्रंट ताकद', fSea: 'समुद्र स्थिती सुरक्षा', reset: 'सध्याच्या वाचनावर रीसेट करा', disclaimer: 'PFZ सल्ल्याप्रमाणे SST फ्रंट व क्लोरोफिल यांचा माशांच्या जमावाशी संबंध जोडणारा स्पष्ट अंदाज. सत्यापित पकड अंदाज नाही; नेहमी अधिकृत INCOIS/IMD सल्ला पाळा.', unsafeNote: 'समुद्र स्थिती लहान नौकांसाठी सुरक्षित मर्यादेपेक्षा जास्त आहे. गुण मर्यादित.' },
  ta: { navCalc: 'பிடிப்பு', title: 'மீன்பிடி வாய்ப்பு கணிப்பான்', sub: 'கடல் நிலைமைகளை மாற்றி, பயனுள்ள மீன்பிடி மண்டலத்தின் வாய்ப்பையும் காரணத்தையும் காணுங்கள்.', sst: 'கடல் மேற்பரப்பு வெப்பநிலை (°C)', chl: 'குளோரோபில்-a (mg/m³)', front: 'வெப்ப முனை (°C / 10 கிமீ)', waves: 'அலை உயரம் (மீ)', wind: 'காற்று (kt)', prefilled: 'தொடக்க மதிப்புகள் தற்போதைய டேஷ்போர்டு அளவீட்டிலிருந்து எடுக்கப்பட்டவை.', score: 'மீன்பிடி வாய்ப்பு', high: 'உயர்', medium: 'மிதமான', low: 'குறைவு', unsafe: 'பாதுகாப்பற்றது', factors: 'மதிப்பெண்ணை தீர்மானிப்பவை', fSst: 'வெப்பநிலை பொருத்தம்', fChl: 'உணவு கிடைப்பு (குளோரோபில்)', fFront: 'வெப்ப முனை வலிமை', fSea: 'கடல் நிலை பாதுகாப்பு', reset: 'தற்போதைய அளவீட்டுக்கு மீட்டமை', disclaimer: 'PFZ ஆலோசனைகள் போல SST முனைகளையும் குளோரோபிலையும் மீன் திரளுடன் தொடர்புபடுத்தும் விளக்கக்கூடிய மதிப்பீடு. சரிபார்க்கப்பட்ட கணிப்பு அல்ல; அதிகாரப்பூர்வ INCOIS/IMD ஆலோசனையைப் பின்பற்றவும்.', unsafeNote: 'கடல் நிலை சிறு படகுகளுக்கான பாதுகாப்பு வரம்பை மீறுகிறது. மதிப்பெண் வரையறுக்கப்பட்டது.' },
  te: { navCalc: 'పట్టు', title: 'చేపల వేట సంభావ్యత కాలిక్యులేటర్', sub: 'సముద్ర పరిస్థితులను మార్చి, ఉత్పాదక చేపల మండలం ఎంత సంభావ్యమో, ఎందుకో చూడండి.', sst: 'సముద్ర ఉపరితల ఉష్ణోగ్రత (°C)', chl: 'క్లోరోఫిల్-a (mg/m³)', front: 'ఉష్ణ ఫ్రంట్ (°C / 10 కిమీ)', waves: 'అల ఎత్తు (మీ)', wind: 'గాలి (kt)', prefilled: 'ప్రారంభ విలువలు ప్రస్తుత డాష్‌బోర్డ్ రీడింగ్ నుండి వచ్చాయి.', score: 'చేపల వేట సంభావ్యత', high: 'అధికం', medium: 'మధ్యస్థం', low: 'తక్కువ', unsafe: 'అసురక్షితం', factors: 'స్కోర్‌ను నిర్ణయించేవి', fSst: 'ఉష్ణోగ్రత అనుకూలత', fChl: 'ఆహార లభ్యత (క్లోరోఫిల్)', fFront: 'ఉష్ణ ఫ్రంట్ బలం', fSea: 'సముద్ర స్థితి భద్రత', reset: 'ప్రస్తుత రీడింగ్‌లకు రీసెట్', disclaimer: 'PFZ సలహాల వలె SST ఫ్రంట్లు, క్లోరోఫిల్‌ను చేపల సమూహాలతో కలిపే వివరించదగిన అంచనా. ధృవీకరించబడిన అంచనా కాదు; అధికారిక INCOIS/IMD సలహాను పాటించండి.', unsafeNote: 'సముద్ర స్థితి చిన్న పడవలకు సురక్షిత పరిమితిని మించింది. స్కోర్ పరిమితం.' },
  kn: { navCalc: 'ಹಿಡಿತ', title: 'ಮೀನುಗಾರಿಕೆ ಸಂಭವನೀಯತೆ ಕ್ಯಾಲ್ಕುಲೇಟರ್', sub: 'ಸಮುದ್ರ ಪರಿಸ್ಥಿತಿಗಳನ್ನು ಬದಲಿಸಿ, ಉತ್ಪಾದಕ ಮೀನುಗಾರಿಕೆ ವಲಯದ ಸಾಧ್ಯತೆ ಮತ್ತು ಕಾರಣ ನೋಡಿ.', sst: 'ಸಮುದ್ರ ಮೇಲ್ಮೈ ತಾಪಮಾನ (°C)', chl: 'ಕ್ಲೋರೋಫಿಲ್-a (mg/m³)', front: 'ಉಷ್ಣ ಮುಂಭಾಗ (°C / 10 ಕಿಮೀ)', waves: 'ಅಲೆ ಎತ್ತರ (ಮೀ)', wind: 'ಗಾಳಿ (kt)', prefilled: 'ಆರಂಭಿಕ ಮೌಲ್ಯಗಳು ಪ್ರಸ್ತುತ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಓದುವಿಕೆಯಿಂದ ಬಂದಿವೆ.', score: 'ಮೀನುಗಾರಿಕೆ ಸಂಭವನೀಯತೆ', high: 'ಹೆಚ್ಚು', medium: 'ಮಧ್ಯಮ', low: 'ಕಡಿಮೆ', unsafe: 'ಅಸುರಕ್ಷಿತ', factors: 'ಅಂಕವನ್ನು ನಿರ್ಧರಿಸುವವು', fSst: 'ತಾಪಮಾನ ಹೊಂದಾಣಿಕೆ', fChl: 'ಆಹಾರ ಲಭ್ಯತೆ (ಕ್ಲೋರೋಫಿಲ್)', fFront: 'ಉಷ್ಣ ಮುಂಭಾಗದ ಬಲ', fSea: 'ಸಮುದ್ರ ಸ್ಥಿತಿ ಸುರಕ್ಷತೆ', reset: 'ಪ್ರಸ್ತುತ ಓದುವಿಕೆಗೆ ಮರುಹೊಂದಿಸಿ', disclaimer: 'PFZ ಸಲಹೆಗಳಂತೆ SST ಮುಂಭಾಗ ಮತ್ತು ಕ್ಲೋರೋಫಿಲ್ ಅನ್ನು ಮೀನು ಸಮೂಹದೊಂದಿಗೆ ಜೋಡಿಸುವ ವಿವರಿಸಬಹುದಾದ ಅಂದಾಜು. ಮೌಲ್ಯೀಕರಿಸಿದ ಮುನ್ಸೂಚನೆಯಲ್ಲ; ಅಧಿಕೃತ INCOIS/IMD ಸಲಹೆ ಅನುಸರಿಸಿ.', unsafeNote: 'ಸಮುದ್ರ ಸ್ಥಿತಿ ಸಣ್ಣ ದೋಣಿಗಳ ಸುರಕ್ಷಿತ ಮಿತಿ ಮೀರಿದೆ. ಅಂಕ ಸೀಮಿತ.' },
  ml: { navCalc: 'പിടിത്തം', title: 'മത്സ്യബന്ധന സാധ്യതാ കാൽക്കുലേറ്റർ', sub: 'കടൽ അവസ്ഥകൾ മാറ്റി, ഉൽപ്പാദനക്ഷമമായ മത്സ്യബന്ധന മേഖലയുടെ സാധ്യതയും കാരണവും കാണുക.', sst: 'കടൽ ഉപരിതല താപനില (°C)', chl: 'ക്ലോറോഫിൽ-a (mg/m³)', front: 'താപ മുന്നണി (°C / 10 കി.മീ)', waves: 'തിരമാല ഉയരം (മീ)', wind: 'കാറ്റ് (kt)', prefilled: 'പ്രാരംഭ മൂല്യങ്ങൾ നിലവിലെ ഡാഷ്ബോർഡ് റീഡിംഗിൽ നിന്നാണ്.', score: 'മത്സ്യബന്ധന സാധ്യത', high: 'ഉയർന്നത്', medium: 'മിതം', low: 'കുറവ്', unsafe: 'സുരക്ഷിതമല്ല', factors: 'സ്കോർ നിർണ്ണയിക്കുന്നവ', fSst: 'താപനില അനുയോജ്യത', fChl: 'ഭക്ഷ്യലഭ്യത (ക്ലോറോഫിൽ)', fFront: 'താപ മുന്നണി ശക്തി', fSea: 'കടൽ അവസ്ഥ സുരക്ഷ', reset: 'നിലവിലെ റീഡിംഗുകളിലേക്ക് പുനഃസജ്ജമാക്കുക', disclaimer: 'PFZ ഉപദേശങ്ങൾ പോലെ SST മുന്നണികളും ക്ലോറോഫില്ലും മത്സ്യ കൂട്ടങ്ങളുമായി ബന്ധിപ്പിക്കുന്ന വിശദീകരിക്കാവുന്ന ഏകദേശ കണക്ക്. സ്ഥിരീകരിച്ച പ്രവചനമല്ല; ഔദ്യോഗിക INCOIS/IMD ഉപദേശം പാലിക്കുക.', unsafeNote: 'കടൽ അവസ്ഥ ചെറു വള്ളങ്ങൾക്കുള്ള സുരക്ഷിത പരിധി കവിയുന്നു. സ്കോർ പരിമിതം.' },
  bn: { navCalc: 'ধরা', title: 'মাছ ধরার সম্ভাবনা ক্যালকুলেটর', sub: 'সমুদ্রের অবস্থা বদলে দেখুন উৎপাদনশীল মৎস্য অঞ্চলের সম্ভাবনা কতটা এবং কেন।', sst: 'সমুদ্র পৃষ্ঠের তাপমাত্রা (°C)', chl: 'ক্লোরোফিল-a (mg/m³)', front: 'তাপীয় ফ্রন্ট (°C / 10 কিমি)', waves: 'ঢেউয়ের উচ্চতা (মি)', wind: 'বাতাস (kt)', prefilled: 'প্রাথমিক মান বর্তমান ড্যাশবোর্ড রিডিং থেকে নেওয়া।', score: 'মাছ ধরার সম্ভাবনা', high: 'উচ্চ', medium: 'মাঝারি', low: 'কম', unsafe: 'অনিরাপদ', factors: 'স্কোর যেসবের উপর নির্ভর করে', fSst: 'তাপমাত্রার উপযোগিতা', fChl: 'খাদ্যের প্রাপ্যতা (ক্লোরোফিল)', fFront: 'তাপীয় ফ্রন্টের শক্তি', fSea: 'সমুদ্র অবস্থার নিরাপত্তা', reset: 'বর্তমান রিডিংয়ে রিসেট', disclaimer: 'PFZ পরামর্শের মতো SST ফ্রন্ট ও ক্লোরোফিলকে মাছের সমাবেশের সঙ্গে যুক্ত করা ব্যাখ্যাযোগ্য অনুমান। যাচাইকৃত পূর্বাভাস নয়; সবসময় অফিসিয়াল INCOIS/IMD পরামর্শ মানুন।', unsafeNote: 'সমুদ্র অবস্থা ছোট নৌকার নিরাপদ সীমা ছাড়িয়েছে। স্কোর সীমিত।' },
  gu: { navCalc: 'પકડ', title: 'માછીમારી સંભાવના કેલ્ક્યુલેટર', sub: 'દરિયાઈ સ્થિતિ બદલીને ઉત્પાદક માછીમારી ઝોનની સંભાવના કેટલી અને શા માટે તે જુઓ.', sst: 'સમુદ્ર સપાટી તાપમાન (°C)', chl: 'ક્લોરોફિલ-a (mg/m³)', front: 'થર્મલ ફ્રન્ટ (°C / 10 કિમી)', waves: 'મોજાની ઊંચાઈ (મી)', wind: 'પવન (kt)', prefilled: 'શરૂઆતના મૂલ્યો વર્તમાન ડેશબોર્ડ રીડિંગમાંથી લીધા છે.', score: 'માછીમારી સંભાવના', high: 'ઊંચી', medium: 'મધ્યમ', low: 'ઓછી', unsafe: 'અસુરક્ષિત', factors: 'સ્કોર શેના પર આધારિત છે', fSst: 'તાપમાન અનુકૂળતા', fChl: 'ખોરાક ઉપલબ્ધતા (ક્લોરોફિલ)', fFront: 'થર્મલ ફ્રન્ટ મજબૂતી', fSea: 'દરિયાઈ સ્થિતિ સલામતી', reset: 'વર્તમાન રીડિંગ પર રીસેટ', disclaimer: 'PFZ સલાહની જેમ SST ફ્રન્ટ અને ક્લોરોફિલને માછલી એકત્રીકરણ સાથે જોડતો સમજાવી શકાય એવો અંદાજ. પ્રમાણિત આગાહી નથી; હંમેશા સત્તાવાર INCOIS/IMD સલાહ અનુસરો.', unsafeNote: 'દરિયાઈ સ્થિતિ નાની નૌકાઓ માટે સલામત મર્યાદા કરતાં વધુ છે. સ્કોર મર્યાદિત.' },
};

export function tc(locale: LocaleCode, key: Key): string {
  return d[locale]?.[key] ?? d.en[key];
}

export interface CalcInput { sst: number; chl: number; front: number; waves: number; wind: number }
export interface CalcResult {
  score: number;
  band: 'high' | 'medium' | 'low' | 'unsafe';
  factors: { key: 'fSst' | 'fChl' | 'fFront' | 'fSea'; value: number }[];
  capped: boolean;
}

const clamp = (n: number) => Math.max(0, Math.min(1, n));

export function computeFishingProbability(i: CalcInput): CalcResult {
  const fSst = clamp(1 - Math.abs(i.sst - 28.3) / 4);
  const fChl = i.chl < 0.1 ? 0.1 : i.chl < 0.3 ? 0.1 + ((i.chl - 0.1) / 0.2) * 0.9 : i.chl <= 1.5 ? 1 : clamp(1 - (i.chl - 1.5) / 5) * 0.4 + 0.6 * clamp(1 - (i.chl - 1.5) / 5);
  const fFront = clamp(i.front / 1.5);
  const fSea = clamp(1 - Math.max(0, i.waves - 1) / 2) * 0.5 + clamp(1 - Math.max(0, i.wind - 15) / 20) * 0.5;
  let score = (fSst * 0.2 + fChl * 0.3 + fFront * 0.2 + fSea * 0.3) * 100;
  const capped = i.waves > 2.5 || i.wind > 30;
  if (capped) score = Math.min(score, 30);
  score = Math.round(score);
  const band = capped ? 'unsafe' : score >= 70 ? 'high' : score >= 45 ? 'medium' : 'low';
  return {
    score,
    band,
    capped,
    factors: [
      { key: 'fSst', value: fSst },
      { key: 'fChl', value: fChl },
      { key: 'fFront', value: fFront },
      { key: 'fSea', value: fSea },
    ],
  };
}

const trend: Record<'rising' | 'falling', Record<LocaleCode, string>> = {
  rising: { en: 'rising', hi: 'बढ़ता', mr: 'वाढती', ta: 'உயரும்', te: 'పెరుగుతున్న', kn: 'ಏರುತ್ತಿರುವ', ml: 'ഉയരുന്നു', bn: 'বাড়ছে', gu: 'વધતી' },
  falling: { en: 'falling', hi: 'घटता', mr: 'ओसरती', ta: 'குறையும்', te: 'తగ్గుతున్న', kn: 'ಇಳಿಯುತ್ತಿರುವ', ml: 'താഴുന്നു', bn: 'কমছে', gu: 'ઘટતી' },
};
export function tideTrendLabel(locale: LocaleCode, t: 'rising' | 'falling'): string {
  return trend[t][locale] ?? trend[t].en;
}
