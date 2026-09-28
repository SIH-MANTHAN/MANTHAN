import type { LocaleCode } from '../types';

export type ChatIntent = 'pfz' | 'safety' | 'chlorophyll' | 'alerts' | 'route' | 'conditions' | 'default';

interface LocalizedChat {
  content: string;
  interpretation: string;
  safety?: string;
  actionable: string[];
  planning: string;
  suggestions: string[];
}

type Vars = Record<string, string | number>;

function fill(template: string, vars: Vars): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? `{${key}}`));
}

const suggestions: Record<'en' | 'hi' | 'mr' | 'ta' | 'te' | 'kn', string[]> = {
  en: [
    'Where is the nearest PFZ today?',
    'Is it safe to go fishing tomorrow morning?',
    'What are the sea conditions near me?',
    'Show areas with high chlorophyll.',
    'Are there any alerts nearby?',
    'What is the safest route to Konkan PFZ-A?',
  ],
  hi: [
    'आज निकटतम PFZ कहाँ है?',
    'क्या कल सुबह मछली पकड़ने जाना सुरक्षित है?',
    'मेरे पास समुद्री स्थिति कैसी है?',
    'उच्च क्लोरोफिल वाले क्षेत्र दिखाएँ।',
    'क्या आसपास कोई अलर्ट है?',
    'कोंकण PFZ-A के लिए सबसे सुरक्षित मार्ग क्या है?',
  ],
  mr: [
    'आज जवळचे PFZ कुठे आहे?',
    'उद्या सकाळी मासेमारीसाठी जाणे सुरक्षित आहे का?',
    'माझ्या जवळ समुद्राची स्थिती कशी आहे?',
    'उच्च क्लोरोफिल असलेले प्रदेश दाखवा.',
    'जवळ कुठले अलर्ट आहेत का?',
    'कोंकण PFZ-A साठी सर्वात सुरक्षित मार्ग कोणता?',
  ],
  ta: [
    'இன்று அருகிலுள்ள PFZ எங்கே?',
    'நாளை காலை மீன்பிடிக்க செல்வது பாதுகாப்பானதா?',
    'என் அருகில் கடல் நிலை என்ன?',
    'அதிக குளோரோபில் உள்ள பகுதிகளைக் காட்டு.',
    'அருகில் ஏதேனும் எச்சரிக்கை உள்ளதா?',
    'கொங்கன் PFZ-A க்கான பாதுகாப்பான வழி என்ன?',
  ],
  te: [
    'ఈరోజు సమీప PFZ ఎక్కడ?',
    'రేపు ఉదయం చేపలు పట్టడానికి వెళ్లడం సురక్షితమా?',
    'నా దగ్గర సముద్ర పరిస్థితులు ఎలా ఉన్నాయి?',
    'అధిక క్లోరోఫిల్ ఉన్న ప్రాంతాలు చూపించు.',
    'సమీపంలో ఏవైనా హెచ్చరికలు ఉన్నాయా?',
    'కొంకణ్ PFZ-A కి అత్యంత సురక్షిత మార్గం ఏది?',
  ],
  kn: [
    'ಇಂದು ಹತ್ತಿರದ PFZ ಎಲ್ಲಿದೆ?',
    'ನಾಳೆ ಬೆಳಿಗ್ಗೆ ಮೀನುಗಾರಿಕೆಗೆ ಹೋಗುವುದು ಸುರಕ್ಷಿತವೇ?',
    'ನನ್ನ ಹತ್ತಿರ ಸಮುದ್ರ ಪರಿಸ್ಥಿತಿ ಹೇಗಿದೆ?',
    'ಹೆಚ್ಚು ಕ್ಲೋರೋಫಿಲ್ ಇರುವ ಪ್ರದೇಶಗಳನ್ನು ತೋರಿಸಿ.',
    'ಹತ್ತಿರ ಯಾವುದೇ ಎಚ್ಚರಿಕೆಗಳಿವೆಯೇ?',
    'ಕೊಂಕಣ್ PFZ-A ಗೆ ಅತ್ಯಂತ ಸುರಕ್ಷಿತ ಮಾರ್ಗ ಯಾವುದು?',
  ],
};

function pack(
  locale: LocaleCode,
  en: LocalizedChat,
  local?: Partial<LocalizedChat>,
): LocalizedChat {
  const baseSuggestions = suggestions[locale as keyof typeof suggestions] ?? suggestions.en;
  return {
    ...en,
    ...local,
    suggestions: local?.suggestions ?? baseSuggestions,
    actionable: local?.actionable ?? en.actionable,
  };
}

export function getSuggestedQuestionsForLocale(locale: LocaleCode): string[] {
  return suggestions[locale as keyof typeof suggestions] ?? suggestions.en;
}

export function localizeChat(
  intent: ChatIntent,
  locale: LocaleCode,
  vars: Vars,
): LocalizedChat {
  const en: Record<ChatIntent, LocalizedChat> = {
    pfz: {
      content: fill(
        'The nearest Potential Fishing Zone is **{name}**, approximately **{distance} km** from your location. Productivity is assessed as **{productivity}** with a **{safety}** safety condition for the current advisory window.',
        vars,
      ),
      interpretation:
        'Elevated chlorophyll together with a moderate SST gradient supports a favourable productivity assessment for this shelf PFZ during the current advisory period.',
      safety: fill(
        'Operational safety is rated {safety} based on wave height {wave} m and wind {wind} kt.',
        vars,
      ),
      actionable: [
        'View the PFZ polygon on the map',
        'Cross-check swell advisory before departure',
        'Request a route if you plan to transit',
      ],
      planning: 'Coordinating marine agents…',
      suggestions: suggestions.en,
    },
    safety: {
      content: fill(
        'For tomorrow morning, conditions are assessed as **{overall}**. {summary}',
        vars,
      ),
      interpretation:
        'Wave and wind fields remain within a workable band for coastal operations, but afternoon swell build-up and isolated thunderstorm risk reduce confidence for longer offshore windows.',
      safety: String(vars.summary ?? ''),
      actionable: String(vars.recommendations ?? '')
        .split('|')
        .filter(Boolean),
      planning: 'Coordinating marine agents…',
      suggestions: suggestions.en,
    },
    chlorophyll: {
      content: fill(
        'Near your location, SST is **{sst}°C** with a **{gradient}** gradient, and chlorophyll-a is **{chl} mg/m³** ({level}). Together these support a constructive productivity signal along the inner shelf.',
        vars,
      ),
      interpretation:
        'The observed SST gradient together with elevated chlorophyll concentration contributes to the current productivity assessment.',
      actionable: ['Enable SST and chlorophyll map layers', 'Compare with nearest PFZ advisories'],
      planning: 'Coordinating marine agents…',
      suggestions: suggestions.en,
    },
    alerts: {
      content: fill(
        'There are **{count} active notices** near your area. Primary: {title} — {summary}',
        vars,
      ),
      interpretation:
        'No cyclone warning is active in the placeholder feed. Attention should focus on moderate swell and isolated afternoon lightning cells offshore.',
      safety: 'Overall risk remains moderate; severe visual treatment is not warranted at this time.',
      actionable: String(vars.actions ?? '')
        .split('|')
        .filter(Boolean),
      planning: 'Coordinating marine agents…',
      suggestions: suggestions.en,
    },
    route: {
      content: fill(
        'A candidate route **{name}** covers **{distance} nm** in about **{hours} h**. Safety is assessed as **{safety}**. {weather}',
        vars,
      ),
      interpretation: String(vars.considerations ?? ''),
      safety: fill('Route avoids: {avoided}.', vars),
      actionable: ['View route on map', 'Review avoided restricted waters', 'Confirm departure tide'],
      planning: 'Coordinating marine agents…',
      suggestions: suggestions.en,
    },
    conditions: {
      content: fill(
        'Near your fishing location: waves **{wave} m**, wind **{wind} kt**, SST **{sst}°C**, tide **{tideTrend}** at **{tideHeight} m**. {weather}.',
        vars,
      ),
      interpretation:
        'Local ocean state is coherent across wave, wind, and tide observations, with no single parameter in the severe band.',
      safety: 'Moderate sea conditions based on current wave and wind observations.',
      actionable: ['Open Safety panel for advisories', 'Toggle wave and wind layers'],
      planning: 'Coordinating marine agents…',
      suggestions: suggestions.en,
    },
    default: {
      content: fill(
        'I correlated available marine layers for your question. Current shelf conditions show SST **{sst}°C**, chlorophyll **{chl} mg/m³**, and waves **{wave} m**. Ask about PFZ, safety, alerts, chlorophyll, or routes for a focused briefing.',
        vars,
      ),
      interpretation:
        'MANTHAN combines ocean colour, temperature, and sea-state context rather than answering from a single dataset.',
      actionable: ['Try a suggested question', 'Enable relevant map layers'],
      planning: 'Coordinating marine agents…',
      suggestions: suggestions.en,
    },
  };

  if (locale === 'en') return en[intent];

  const hi: Partial<Record<ChatIntent, Partial<LocalizedChat>>> = {
    pfz: {
      content: fill(
        'निकटतम संभावित मत्स्य क्षेत्र **{name}** है, आपके स्थान से लगभग **{distance} किमी**. उत्पादकता **{productivity}** आँकी गई है और सुरक्षा स्थिति **{safety}** है।',
        vars,
      ),
      interpretation:
        'उन्नत क्लोरोफिल और मध्यम SST प्रवणता मिलकर इस शेल्फ PFZ के लिए अनुकूल उत्पादकता संकेत देती है।',
      safety: fill('संचालन सुरक्षा {safety} है — लहर {wave} मी और हवा {wind} नॉट।', vars),
      actionable: ['मानचित्र पर PFZ देखें', 'प्रस्थान से पहले लहर सलाह जाँचें', 'मार्ग का अनुरोध करें'],
      planning: 'समुद्री एजेंट समन्वय…',
    },
    safety: {
      content: fill('कल सुबह की स्थितियाँ **{overall}** आँकी गई हैं। {summary}', vars),
      interpretation:
        'लहर और हवा तटीय संचालन के लिए कार्यशील सीमा में हैं, पर दोपहर की लहर वृद्धि और तूफान जोखिम लंबी समुद्री यात्रा के विश्वास को घटाते हैं।',
      planning: 'समुद्री एजेंट समन्वय…',
    },
    chlorophyll: {
      content: fill(
        'आपके पास SST **{sst}°C** ({gradient} प्रवणता) और क्लोरोफिल-a **{chl} mg/m³** ({level}) है। ये आंतरिक शेल्फ पर उत्पादकता संकेत को मजबूत करते हैं।',
        vars,
      ),
      interpretation: 'देखी गई SST प्रवणता और उन्नत क्लोरोफिल वर्तमान उत्पादकता आकलन में योगदान करते हैं।',
      planning: 'समुद्री एजेंट समन्वय…',
    },
    alerts: {
      content: fill('आपके क्षेत्र में **{count} सक्रिय सूचनाएँ** हैं। मुख्य: {title} — {summary}', vars),
      interpretation: 'कोई चक्रवात चेतावनी सक्रिय नहीं। मध्यम लहर और दूर समुद्र में बिजली पर ध्यान दें।',
      safety: 'कुल जोखिम मध्यम है; गंभीर दृश्य उपचार आवश्यक नहीं।',
      planning: 'समुद्री एजेंट समन्वय…',
    },
    route: {
      content: fill(
        'उम्मीदवार मार्ग **{name}** लगभग **{distance} समुद्री मील** और **{hours} घंटे** का है। सुरक्षा **{safety}**. {weather}',
        vars,
      ),
      planning: 'समुद्री एजेंट समन्वय…',
    },
    conditions: {
      content: fill(
        'आपके पास: लहरें **{wave} मी**, हवा **{wind} नॉट**, SST **{sst}°C**, ज्वार **{tideTrend}** **{tideHeight} मी**. {weather}.',
        vars,
      ),
      interpretation: 'लहर, हवा और ज्वार के अवलोकन सुसंगत हैं; कोई पैरामीटर गंभीर नहीं।',
      safety: 'वर्तमान लहर और हवा के आधार पर मध्यम समुद्री स्थिति।',
      planning: 'समुद्री एजेंट समन्वय…',
    },
    default: {
      content: fill(
        'आपके प्रश्न के लिए समुद्री परतें सहसंबद्ध की गईं। SST **{sst}°C**, क्लोरोफिल **{chl} mg/m³**, लहरें **{wave} मी**. PFZ, सुरक्षा, अलर्ट या मार्ग के बारे में पूछें।',
        vars,
      ),
      planning: 'समुद्री एजेंट समन्वय…',
    },
  };

  const mr: Partial<Record<ChatIntent, Partial<LocalizedChat>>> = {
    pfz: {
      content: fill(
        'सर्वात जवळचे संभाव्य मत्स्य क्षेत्र **{name}** आहे, तुमच्यापासून सुमारे **{distance} किमी**. उत्पादकता **{productivity}** आणि सुरक्षा **{safety}** आहे.',
        vars,
      ),
      interpretation: 'उच्च क्लोरोफिल आणि मध्यम SST ग्रेडियंट या शेल्फ PFZ साठी अनुकूल उत्पादकता दर्शवतात.',
      safety: fill('कार्यरत सुरक्षा {safety} — लाट {wave} मी आणि वारा {wind} नॉट.', vars),
      actionable: ['नकाशावर PFZ पहा', 'प्रस्थानपूर्वी लाट सल्ला तपासा', 'मार्ग विनंती करा'],
      planning: 'सागरी एजंट समन्वय…',
    },
    safety: {
      content: fill('उद्या सकाळची स्थिती **{overall}** आहे. {summary}', vars),
      planning: 'सागरी एजंट समन्वय…',
    },
    conditions: {
      content: fill(
        'तुमच्या जवळ: लाटा **{wave} मी**, वारा **{wind} नॉट**, SST **{sst}°C**, भरती **{tideTrend}** **{tideHeight} मी**. {weather}.',
        vars,
      ),
      planning: 'सागरी एजंट समन्वय…',
    },
    default: {
      content: fill(
        'समुद्री स्तर सहसंबंधित केले. SST **{sst}°C**, क्लोरोफिल **{chl}**, लाटा **{wave} मी**. PFZ, सुरक्षा किंवा मार्ग विचारा.',
        vars,
      ),
      planning: 'सागरी एजंट समन्वय…',
    },
  };

  const ta: Partial<Record<ChatIntent, Partial<LocalizedChat>>> = {
    pfz: {
      content: fill(
        'அருகிலுள்ள சாத்திய மீன்பிடி மண்டலம் **{name}**, உங்களிடமிருந்து சுமார் **{distance} கிமீ**. உற்பத்தித்திறன் **{productivity}**, பாதுகாப்பு **{safety}**.',
        vars,
      ),
      interpretation: 'உயர் குளோரோபில் மற்றும் மிதமான SST சாய்வு இந்த PFZ க்கு சாதகமான உற்பத்தி சமிக்ஞையைத் தருகிறது.',
      safety: fill('செயல்பாட்டு பாதுகாப்பு {safety} — அலை {wave} மீ மற்றும் காற்று {wind} நாட்.', vars),
      actionable: ['வரைபடத்தில் PFZ காண்', 'புறப்படுவதற்கு முன் அலை அறிவிப்பைச் சரிபார்', 'பாதை கோரு'],
      planning: 'கடல் முகவர்கள் ஒருங்கிணைப்பு…',
    },
    safety: {
      content: fill('நாளை காலை நிலை **{overall}** என மதிப்பிடப்பட்டுள்ளது. {summary}', vars),
      planning: 'கடல் முகவர்கள் ஒருங்கிணைப்பு…',
    },
    conditions: {
      content: fill(
        'உங்கள் அருகில்: அலைகள் **{wave} மீ**, காற்று **{wind} நாட்**, SST **{sst}°C**, அலை **{tideTrend}** **{tideHeight} மீ**. {weather}.',
        vars,
      ),
      planning: 'கடல் முகவர்கள் ஒருங்கிணைப்பு…',
    },
    default: {
      content: fill(
        'கடல் அடுக்குகள் இணைக்கப்பட்டன. SST **{sst}°C**, குளோரோபில் **{chl}**, அலைகள் **{wave} மீ**. PFZ, பாதுகாப்பு அல்லது பாதை கேளுங்கள்.',
        vars,
      ),
      planning: 'கடல் முகவர்கள் ஒருங்கிணைப்பு…',
    },
  };

  const te: Partial<Record<ChatIntent, Partial<LocalizedChat>>> = {
    pfz: {
      content: fill(
        'సమీప సంభావ్య చేపల మండలం **{name}**, మీ నుండి సుమారు **{distance} కి.మీ**. ఉత్పాదకత **{productivity}**, భద్రత **{safety}**.',
        vars,
      ),
      interpretation: 'ఎక్కువ క్లోరోఫిల్ మరియు మధ్యస్థ SST గ్రేడియంట్ ఈ PFZ కి అనుకూల ఉత్పాదకతను సూచిస్తాయి.',
      safety: fill('కార్యాచరణ భద్రత {safety} — అలలు {wave} మీ మరియు గాలి {wind} నాట్.', vars),
      actionable: ['మ్యాప్‌లో PFZ చూడండి', 'బయలుదేరే ముందు అలల సలహా తనిఖీ చేయండి', 'మార్గం అభ్యర్థించండి'],
      planning: 'సముద్ర ఏజెంట్ల సమన్వయం…',
    },
    safety: {
      content: fill('రేపు ఉదయం పరిస్థితులు **{overall}**గా అంచనా. {summary}', vars),
      planning: 'సముద్ర ఏజెంట్ల సమన్వయం…',
    },
    conditions: {
      content: fill(
        'మీ దగ్గర: అలలు **{wave} మీ**, గాలి **{wind} నాట్**, SST **{sst}°C**, ఆటుపోటు **{tideTrend}** **{tideHeight} మీ**. {weather}.',
        vars,
      ),
      planning: 'సముద్ర ఏజెంట్ల సమన్వయం…',
    },
    default: {
      content: fill(
        'సముద్ర పొరలు సహసంబంధం చేయబడ్డాయి. SST **{sst}°C**, క్లోరోఫిల్ **{chl}**, అలలు **{wave} మీ**. PFZ, భద్రత లేదా మార్గం అడగండి.',
        vars,
      ),
      planning: 'సముద్ర ఏజెంట్ల సమన్వయం…',
    },
  };

  const kn: Partial<Record<ChatIntent, Partial<LocalizedChat>>> = {
    pfz: {
      content: fill(
        'ಹತ್ತಿರದ ಸಂಭಾವ್ಯ ಮೀನುಗಾರಿಕೆ ವಲಯ **{name}**, ನಿಮ್ಮಿಂದ ಸುಮಾರು **{distance} ಕಿ.ಮೀ**. ಉತ್ಪಾದಕತೆ **{productivity}**, ಸುರಕ್ಷತೆ **{safety}**.',
        vars,
      ),
      interpretation: 'ಹೆಚ್ಚು ಕ್ಲೋರೋಫಿಲ್ ಮತ್ತು ಮಧ್ಯಮ SST ಗ್ರೇಡಿಯಂಟ್ ಈ PFZ ಗೆ ಅನುಕೂಲಕರ ಉತ್ಪಾದಕತೆಯನ್ನು ಸೂಚಿಸುತ್ತವೆ.',
      safety: fill('ಕಾರ್ಯಾಚರಣೆ ಸುರಕ್ಷತೆ {safety} — ಅಲೆ {wave} ಮೀ ಮತ್ತು ಗಾಳಿ {wind} ನಾಟ್.', vars),
      actionable: ['ನಕ್ಷೆಯಲ್ಲಿ PFZ ನೋಡಿ', 'ಹೊರಡುವ ಮೊದಲು ಅಲೆ ಸಲಹೆ ಪರಿಶೀಲಿಸಿ', 'ಮಾರ್ಗ ವಿನಂತಿಸಿ'],
      planning: 'ಸಮುದ್ರ ಏಜೆಂಟ್ ಸಮನ್ವಯ…',
    },
    safety: {
      content: fill('ನಾಳೆ ಬೆಳಿಗ್ಗೆಯ ಪರಿಸ್ಥಿತಿ **{overall}** ಎಂದು ಅಂದಾಜು. {summary}', vars),
      planning: 'ಸಮುದ್ರ ಏಜೆಂಟ್ ಸಮನ್ವಯ…',
    },
    conditions: {
      content: fill(
        'ನಿಮ್ಮ ಹತ್ತಿರ: ಅಲೆಗಳು **{wave} ಮೀ**, ಗಾಳಿ **{wind} ನಾಟ್**, SST **{sst}°C**, ಉಬ್ಬರ **{tideTrend}** **{tideHeight} ಮೀ**. {weather}.',
        vars,
      ),
      planning: 'ಸಮುದ್ರ ಏಜೆಂಟ್ ಸಮನ್ವಯ…',
    },
    default: {
      content: fill(
        'ಸಮುದ್ರ ಪದರಗಳನ್ನು ಸಹಸಂಬಂಧಿಸಲಾಗಿದೆ. SST **{sst}°C**, ಕ್ಲೋರೋಫಿಲ್ **{chl}**, ಅಲೆಗಳು **{wave} ಮೀ**. PFZ, ಸುರಕ್ಷತೆ ಅಥವಾ ಮಾರ್ಗ ಕೇಳಿ.',
        vars,
      ),
      planning: 'ಸಮುದ್ರ ಏಜೆಂಟ್ ಸಮನ್ವಯ…',
    },
  };

  const table: Partial<Record<LocaleCode, Partial<Record<ChatIntent, Partial<LocalizedChat>>>>> = {
    hi,
    mr,
    ta,
    te,
    kn,
  };

  return pack(locale, en[intent], table[locale]?.[intent]);
}

/** Intent keywords across languages */
export function detectIntent(question: string): ChatIntent {
  const q = question.toLowerCase();
  if (
    /pfz|fishing zone|मत्स्य|मछली|मासे|மீன்|చేప|ಮೀನು|nearest|निकट|जवळ|அருக|సమీప|ಹತ್ತಿರ/.test(q)
  ) {
    return 'pfz';
  }
  if (/safe|tomorrow|venture|सुरक्षित|सुरक्षित|பாதுகாப்பு|సురక్షిత|ಸುರಕ್ಷಿತ|कल|उद्या|நாளை|రేపు|ನಾಳೆ/.test(q)) {
    return 'safety';
  }
  if (/chlorophyll|sst|productivity|क्लोरोफिल|குளோரோபில்|క్లోరోఫిల్|ಕ್ಲೋರೋಫಿಲ್/.test(q)) {
    return 'chlorophyll';
  }
  if (/alert|lightning|cyclone|अलर्ट|चेतावनी|எச்சரிக்கை|హెచ్చరిక|ಎಚ್ಚರಿಕೆ/.test(q)) {
    return 'alerts';
  }
  if (/route|safest|navigate|मार्ग|मार्ग|பாதை|మార్గం|ಮಾರ್ಗ/.test(q)) {
    return 'route';
  }
  if (/sea condition|weather|tide|near me|समुद्र|स्थिति|கடல்|సముద్ర|ಸಮುದ್ರ/.test(q)) {
    return 'conditions';
  }
  return 'default';
}

export function resolveChatLocale(text: string, preferred: LocaleCode): LocaleCode {
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te';
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn';
  if (/[\u0D00-\u0D7F]/.test(text)) return 'ml';
  if (/[\u0980-\u09FF]/.test(text)) return 'bn';
  if (/[\u0A80-\u0AFF]/.test(text)) return 'gu';
  if (/[\u0900-\u097F]/.test(text)) {
    return preferred === 'mr' ? 'mr' : preferred === 'hi' ? 'hi' : 'hi';
  }
  return preferred;
}
