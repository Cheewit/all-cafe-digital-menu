export const normalizeLang = (code: string): string => {
    const c = (code || '').trim().toLowerCase();
    if (!c) return 'Unknown';

    // Direct full code matches (e.g., 'ms-my' -> 'ms-MY')
    const fullCodeMapping: { [key: string]: string } = {
        'th-th': 'th-TH', 'en-us': 'en-US', 'ja-jp': 'ja-JP', 'zh-cn': 'zh-CN',
        'ko-kr': 'ko-KR', 'ms-my': 'ms-MY', 'fr-fr': 'fr-FR', 'vi-vn': 'vi-VN', 'hi-in': 'hi-IN',
        'en-gb': 'en-US', // Handle common regional variants
    };
    if (fullCodeMapping[c]) return fullCodeMapping[c];

    // Get primary language part (e.g., 'en' from 'en-gb')
    const mainLang = c.split(/[-_]/)[0];
    
    // Map primary language to the canonical form used in the app
    const mainLangMapping: { [key: string]: string } = {
        'th': 'th-TH',
        'en': 'en-US',
        'ja': 'ja-JP', 'jp': 'ja-JP',
        'zh': 'zh-CN', 'cn': 'zh-CN',
        'ko': 'ko-KR', 'kr': 'ko-KR',
        'ms': 'ms-MY', 'my': 'ms-MY',
        'fr': 'fr-FR',
        'vi': 'vi-VN', 'vn': 'vi-VN',
        'hi': 'hi-IN', 'in': 'hi-IN'
    };
    if (mainLangMapping[mainLang]) return mainLangMapping[mainLang];

    // Fallback for codes not in map (e.g., 'de-DE')
    return code;
};
