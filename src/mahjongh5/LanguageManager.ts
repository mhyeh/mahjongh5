/**
 * Get the browser's language
 * @returns {string}
 */
export function GetCurrentLanguage(): string {
    const nav: any = navigator;
    let language: string = nav.language || nav.userLanguage;
    if (language) {
        language = language.toLowerCase();
        for (const languagePack of languages) {
            for (const region of languagePack.regions) {
                let languagePrefix: string = language;
                if (!region.includes("-") && language.includes("-")) {
                    languagePrefix = language.substring(0, language.indexOf("-"));
                }
                if (region.indexOf(languagePrefix) === 0) {
                    return languagePack.language;
                }
            }
        }
    }
    return languages[languages.length - 1].language;
}
/**
 * The Language Mapping
 */
const languages = [
    {
        language: "por",
        regions: [
            "pt",
        ],
    },
    {
        language: "sch",
        regions: [
            "ar",
            "zh-cn",
            "zh-sg",
            "id",
            "ja",
            "ko",
            "th",
            "vi",
        ],
    },
    {
        language: "tch",
        regions: [
            "zh-tw",
            "zh-hk",
        ],
    },
    {
        language: "eng",
        regions: [
            "en",
        ],
    },
    {
        language: "esp",
        regions: [
            "af",
            "sq",
            "eu",
            "bg",
            "be",
            "ca",
            "hr",
            "cs",
            "da",
            "nl",
            "et",
            "fo",
            "fa",
            "fi",
            "fr",
            "gd",
            "de",
            "el",
            "he",
            "hi",
            "hu",
            "is",
            "it",
            "lv",
            "lt",
            "mk",
            "mt",
            "no",
            "pl",
            "rm",
            "ro",
            "ru",
            "sz",
            "sr",
            "sk",
            "sl",
            "sb",
            "es",
            "sx",
            "sv",
            "ts",
            "tn",
            "tr",
            "uk",
            "ur",
            "ve",
            "xh",
            "ji",
            "zu",
        ],
    },
];
