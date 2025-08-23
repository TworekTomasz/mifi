package pl.mifi.account.infrastruture;

import pl.mifi.account.domain.TransactionCategory;

import java.text.Normalizer;
import java.util.List;
import java.util.regex.Pattern;

public final class TitleCategoryClassifier {

    public static TransactionCategory classify(String rawTitle) {
        if (rawTitle == null || rawTitle.isBlank()) return TransactionCategory.UNKNOWN;

        String title = normalizeTitle(rawTitle);

        // Priorytety: najpierw specyficzne (fast-food), potem szersze (groceries), na końcu fallbacki
        for (Rule r : RULES) {
            if (r.pattern().matcher(title).find()) {
                return r.category();
            }
        }
        return TransactionCategory.UNKNOWN;
    }

    /** usuwa "DATA TRANSAKCJI: ..." i normalizuje */
    static String normalizeTitle(String s) {
        String t = s;
        int idx = t.indexOf("DATA TRANSAKCJI");
        if (idx >= 0) t = t.substring(0, idx);

        // do ASCII (bez ogonków), wielkie litery
        String noDiacritics = Normalizer.normalize(t, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        // ujednolicenie białych znaków i slashy
        noDiacritics = noDiacritics.replace('/', ' ').replace('\\', ' ');

        // usuwamy wszystko poza literami/cyframi/spacjami i kompresujemy spacje
        noDiacritics = noDiacritics.replaceAll("[^A-Za-z0-9 ]+", " ").replaceAll("\\s+", " ").trim();

        return noDiacritics.toUpperCase();
    }

    record Rule(Pattern pattern, TransactionCategory category) {}

    private static Rule r(String regex, TransactionCategory c) {
        return new Rule(Pattern.compile(regex), c);
    }

    // Zestaw startowy reguł – dopisuj/porządkuj wg potrzeb
    private static final List<Rule> RULES = List.of(
            // --- FAST FOOD
            r("\\bMCDONALD|MC\\s*DONALD|KFC\\b|POPEYES|BURGER\\s*KING|DURMAK\\s*KEBAB|MACZANE\\b|FRYTKI\\bSALAD\\s*STORY\\b", TransactionCategory.FAST_FOOD),

            // --- RESTAURANT / FOOD PLACES (każda pozycja osobno)
            r("\\bRESTAURACJA\\b", TransactionCategory.RESTAURANT),
            r("PIZZERIA", TransactionCategory.RESTAURANT),
            r("SUSHI", TransactionCategory.RESTAURANT),
            r("THAI", TransactionCategory.RESTAURANT),
            r("NAI\\s*THA", TransactionCategory.RESTAURANT),
            r("CHMELI\\s*SUNELI", TransactionCategory.RESTAURANT),
            r("\\bNURT\\b", TransactionCategory.RESTAURANT),
            r("\\bMASISO\\b", TransactionCategory.RESTAURANT),
            r("GAJOWA\\s*12\\b", TransactionCategory.RESTAURANT),
            r("BAR\\s*A\\s*BOO", TransactionCategory.RESTAURANT),
            r("BURGS\\s*CHEF", TransactionCategory.RESTAURANT),
            r(".*RAFAMARINA.*", TransactionCategory.RESTAURANT),
            r("\\bTATA\\b", TransactionCategory.RESTAURANT),
            r("TIFFANY\\s*FRESH", TransactionCategory.RESTAURANT),
            r("FRESH\\s*BAR", TransactionCategory.RESTAURANT),
            // tolerancja literówki AUTMOATY:
            r("VEMAT\\s*A(?:UTOMATY|UTMOATY)", TransactionCategory.RESTAURANT),
            r("\\bRUSALKA\\b", TransactionCategory.RESTAURANT),
            r("SISI\\s*FOOD", TransactionCategory.RESTAURANT),
            r("\\bGOSPODA\\b", TransactionCategory.RESTAURANT),

            // --- CAFE
            r("\\bKAWIARNIA\\b", TransactionCategory.CAFE),
            r("\\bKAWIARENKA\\b", TransactionCategory.CAFE),
            r("\\bCOFFEE\\b", TransactionCategory.CAFE),
            r("\\bSTARBUCKS\\b", TransactionCategory.CAFE),
            r("PIJALNIA\\s*CZEKOLADY", TransactionCategory.CAFE),
            r("\\bTCHIBO\\b", TransactionCategory.CAFE),

            // --- DESSERTS / SWEETS / ICE CREAM
            r("\\bLODY\\b", TransactionCategory.DESSERTS),
            r("YOGOLAND", TransactionCategory.DESSERTS),
            r("SWEET\\s*FACTORY", TransactionCategory.DESSERTS),
            r("CUKIERNIA", TransactionCategory.DESSERTS),
            r("KARMELLO", TransactionCategory.DESSERTS),
            r("MOJA\\s*SLODYCZ", TransactionCategory.DESSERTS),
            r("DESEROWNIA", TransactionCategory.DESSERTS),
            r("\\bWYPIEKI\\b", TransactionCategory.DESSERTS),

            // --- GROCERIES (supermarkety)
            r("\\bLIDL\\b", TransactionCategory.GROCERIES),
            r("BIEDRONKA", TransactionCategory.GROCERIES),
            r("CARREFOUR", TransactionCategory.GROCERIES),
            r("\\bALDI\\b", TransactionCategory.GROCERIES),
            r("AUCHAN", TransactionCategory.GROCERIES),
            r("\\bDINO\\b", TransactionCategory.GROCERIES),
            r("\\bNETTO\\b", TransactionCategory.GROCERIES),
            r("STOKROTKA", TransactionCategory.GROCERIES),
            r("CHATA\\s*POLSKA", TransactionCategory.GROCERIES),
            r("EUROSPAR", TransactionCategory.GROCERIES),
            r("\\bSPAR\\b", TransactionCategory.GROCERIES),
            r("KAUFLAND", TransactionCategory.GROCERIES),

            // --- CONVENIENCE (Żabka)
            r("\\bZABKA\\b", TransactionCategory.ZABKA),

            // --- PHARMACY / DRUGSTORES
            r("\\bAPTEKA\\b", TransactionCategory.PHARMACY),
            r(".*APTEKA.*", TransactionCategory.PHARMACY),
            r("SUPER\\s*PHARM", TransactionCategory.PHARMACY),
            r("\\bHEBE\\b", TransactionCategory.PHARMACY),
            r("\\bDM\\b", TransactionCategory.PHARMACY),
            r("APTEKA\\s*ONLINE", TransactionCategory.PHARMACY),
            r("\\bOLMED\\b", TransactionCategory.PHARMACY),

            // --- BEAUTY / PERSONAL CARE
            r("\\bROSSMANN\\b", TransactionCategory.BEAUTY_PERSONAL_CARE),
            r("NEO\\s*NAIL", TransactionCategory.BEAUTY_PERSONAL_CARE),
            r("\\bRITUALS\\b", TransactionCategory.BEAUTY_PERSONAL_CARE),
            r("\\bSEPHORA\\b", TransactionCategory.BEAUTY_PERSONAL_CARE),
            r("\\bDOUGLAS\\b", TransactionCategory.BEAUTY_PERSONAL_CARE),
            r("PEPCO\\s*BEAUTY?", TransactionCategory.BEAUTY_PERSONAL_CARE),

            // --- FUEL / STATIONS
            r("\\bORLEN\\b", TransactionCategory.FUEL),
            r("STACJA\\s*PALIW", TransactionCategory.FUEL),
            r("\\bBP\\b", TransactionCategory.FUEL),
            r("\\bMOYA\\b", TransactionCategory.FUEL),
            r("\\bAVIA\\b", TransactionCategory.FUEL),
            r("\\bSHELL\\b", TransactionCategory.FUEL),

            // --- PARKING / TOLLS
            r("\\bPARKING\\b", TransactionCategory.PARKING_TOLLS),
            r("KASA\\s*PARKINGOWA", TransactionCategory.PARKING_TOLLS),
            r("\\bSPP\\b", TransactionCategory.PARKING_TOLLS),
            r("SYSTEMY\\s*POB\\s*OPLAT", TransactionCategory.PARKING_TOLLS),
            r("POSIR\\s*MLODZIEZOWY\\s*O", TransactionCategory.PARKING_TOLLS),

            // --- TRANSPORT / RIDEHAIL
            r("\\bBOLT\\b", TransactionCategory.TRANSPORT_RIDEHAIL),
            r("\\bUBER\\b", TransactionCategory.TRANSPORT_RIDEHAIL),
            r("\\bJAKDOJADE\\b", TransactionCategory.TRANSPORT_RIDEHAIL),
            r("\\bBILET\\b", TransactionCategory.TRANSPORT_RIDEHAIL),

            // --- ENTERTAINMENT / CULTURE
            r("CINEMA\\s*CITY", TransactionCategory.ENTERTAINMENT),
            r("\\bKINO\\b", TransactionCategory.ENTERTAINMENT),
            r("\\bMUZEUM\\b", TransactionCategory.ENTERTAINMENT),
            r("GMACH\\s*GLOWNY\\s*MNP", TransactionCategory.ENTERTAINMENT),
            r("WWW\\.CINEMA\\-CITY\\.PL", TransactionCategory.ENTERTAINMENT),
            r("\\bBOSIR\\b", TransactionCategory.ENTERTAINMENT),

            // --- SUBSCRIPTIONS
            r("\\bSPOTIFY\\b", TransactionCategory.SUBSCRIPTION),
            r("AMAZON\\s*PRIME", TransactionCategory.SUBSCRIPTION),
            r("\\bNETFLIX\\b", TransactionCategory.SUBSCRIPTION),
            r("YOUTUBE\\s*PREMIUM", TransactionCategory.SUBSCRIPTION),

            // --- HOME / GENERAL MERCH
            r("\\bIKEA\\b", TransactionCategory.HOME_GOODS),
            r("\\bHOMLA\\b", TransactionCategory.HOME_GOODS),
            r("\\bPEPCO\\b", TransactionCategory.HOME_GOODS),
            r("\\bDEALZ\\b", TransactionCategory.HOME_GOODS),
            r("\\bACTION\\b", TransactionCategory.HOME_GOODS),
            r("TK\\s*MAXX", TransactionCategory.HOME_GOODS),
            r("\\bSINSAY\\b", TransactionCategory.HOME_GOODS),
            r("\\bKIK\\b", TransactionCategory.HOME_GOODS),
            r("\\bH&M\\b", TransactionCategory.HOME_GOODS),

            // --- FITNESS / WELLNESS
            r("\\bZDROFIT\\b", TransactionCategory.FITNESS_WELLNESS),
            r("TERMY\\s*MALTANSKIE", TransactionCategory.FITNESS_WELLNESS),
            r("\\bMASAZ\\b", TransactionCategory.FITNESS_WELLNESS),
            r("\\bFITNESS\\b", TransactionCategory.FITNESS_WELLNESS),

            // --- FLOWERS / GIFTS
            r("\\bKWIACIARNIA\\b", TransactionCategory.FLOWERS_GIFTS),
            r("\\bFLOWERS\\b", TransactionCategory.FLOWERS_GIFTS),
            r("BALLO?N\\b", TransactionCategory.FLOWERS_GIFTS),
            r("\\bPREZENT\\b", TransactionCategory.FLOWERS_GIFTS),
            r("\\bGIFT\\b", TransactionCategory.FLOWERS_GIFTS),
            r("\\bZRZUTKA\\b", TransactionCategory.FLOWERS_GIFTS),

            // --- GOVERNMENT / FEES
            r("\\bURZAD\\b", TransactionCategory.GOVERNMENT_FEES),
            r("PODATK", TransactionCategory.GOVERNMENT_FEES),
            r("OPLATE", TransactionCategory.GOVERNMENT_FEES),
            r("\\bOPLATA\\b", TransactionCategory.GOVERNMENT_FEES),
            r("WIELKOPOLSKI\\s*URZAD", TransactionCategory.GOVERNMENT_FEES),

            // --- ONLINE SHOPS / GENERIC WWW
            r("^WWW\\.", TransactionCategory.ONLINE_SERVICES),
            r("\\.PL\\b", TransactionCategory.ONLINE_SERVICES),
            r("\\.COM\\b", TransactionCategory.ONLINE_SERVICES),

            // --- TRANSFERS
            r("\\bPRZELEW\\b", TransactionCategory.TRANSFER),
            r("\\bBLIK\\b", TransactionCategory.TRANSFER),
            r("PRZELEW\\s*NA\\s*TELEFON", TransactionCategory.TRANSFER),
            r("PRZELEW\\s*SRODKOW", TransactionCategory.TRANSFER)
    );
}
