package pl.mifi.account.infrastruture.csv;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Component;
import pl.mifi.account.domain.Bank;
import pl.mifi.account.domain.Transaction;
import pl.mifi.account.infrastruture.TitleCategoryClassifier;

import java.io.*;
import java.math.BigDecimal;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

import static org.apache.logging.log4j.util.Strings.isBlank;

/**
 * Reads an mBank CSV exported statement placed under:
 * src/main/resources/statements/mbank.csv
 *
 * Handles:
 *  - Preface lines before the header (#Data operacji / #Data księgowania)
 *  - Polish date format dd.MM.yyyy
 *  - Decimal comma and optional spaces/non-breaking spaces as thousands separators
 *  - Tab-delimited (default). If your file is semicolon-delimited, switch CSVFormat below.
 */
@Component
public class MBankTransactionReader implements CsvTransactionReader {

    // formatery
    private static final DateTimeFormatter DATE_DOTS = DateTimeFormatter.ofPattern("dd.MM.yyyy");
    private static final DateTimeFormatter DATE_ISO  = DateTimeFormatter.ISO_LOCAL_DATE; // yyyy-MM-dd

    // Column headers (trimmed) as they appear in the export
    private static final String COL_BOOKING = "#Data księgowania";
    private static final String COL_OPERATION = "#Data operacji";
    private static final String COL_DESC = "#Opis operacji";
    private static final String COL_TITLE = "#Tytuł";
    private static final String COL_COUNTERPARTY = "#Nadawca/Odbiorca";
    private static final String COL_ACCOUNT_NO = "#Numer konta";
    private static final String COL_AMOUNT = "#Kwota";

    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("dd.MM.yyyy");

    @Override
    public List<Transaction> read() {
        try (InputStream in = getClass().getResourceAsStream("/static/reports/82004086_250901_250930.csv")) {
            if (in == null) {
                throw new IllegalStateException("CSV resource not found: /statements/mbank.csv");
            }
            return parse(in);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read mBank CSV", e);
        }
    }

    // ---- parsing ----

    private List<Transaction> parse(InputStream csvInput) throws IOException {
        // 1) Wczytaj jako Windows-1250
        List<String> lines;
        try (BufferedReader br = new BufferedReader(
                new InputStreamReader(csvInput, Charset.forName("windows-1250")))) {
            lines = br.lines().toList();
        }

        int headerIdx = findHeaderIndex(lines);
        if (headerIdx < 0) return List.of();

        String tail = String.join("\n", lines.subList(headerIdx, lines.size()));

        // 2) mBank ma średniki
        CSVFormat fmt = CSVFormat.newFormat(';')
                .builder()
                .setHeader()                     // użyj pierwszego rekordu jako nagłówka
                .setSkipHeaderRecord(true)       // nie zwracaj nagłówka jako rekordu
                .setTrim(true)
                .setAllowMissingColumnNames(true) // <-- kluczowe
                .build();

        List<Transaction> out = new ArrayList<>();
        try (Reader r = new StringReader(tail); CSVParser parser = new CSVParser(r, fmt)) {
            for (CSVRecord rec : parser) {

                String booking      = getLoose(rec, COL_BOOKING);
                String operation    = getLoose(rec, COL_OPERATION);
                String opDesc       = getLoose(rec, COL_DESC);
                String title        = getLoose(rec, COL_TITLE);
                String counterparty = getLoose(rec, COL_COUNTERPARTY);
                String accountNo    = getLoose(rec, COL_ACCOUNT_NO);
                String amountRaw    = getLoose(rec, COL_AMOUNT);

                if (isBlank(amountRaw) && isBlank(title) && isBlank(opDesc)) continue;

                BigDecimal amount = parseAmount(amountRaw);
                Date date = pickDate(booking, operation);

                Transaction t = new Transaction();
                t.setBank(Bank.MBANK);
                t.setTitle(clean(title));
                t.setAmount(amount);
                t.setType(amount.signum() < 0 ? "EXPENSE" : "INCOME");
                t.setCategory(TitleCategoryClassifier.classify(title).name());
                t.setAccount(blankToNull(accountNo));
                t.setDate(date);
                t.setDescription(buildDescription(opDesc, title, counterparty));
                out.add(t);
            }
        }
        return out;
    }

    private static String buildDescription(String opDesc, String title, String counterparty) {
        List<String> parts = new ArrayList<>();
        if (!isBlank(opDesc)) parts.add(opDesc);
        if (!isBlank(counterparty)) parts.add(counterparty);
        if (!isBlank(title) && title.contains("DATA TRANSAKCJI")) {
            parts.add(title.substring(title.indexOf("DATA TRANSAKCJI")));
        }
        return String.join(" | ", parts);
    }
    private static String blankToNull(String s) { return isBlank(s) ? null : s; }
    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }


    private static BigDecimal parseAmount(String raw) {
        if (isBlank(raw)) return BigDecimal.ZERO;

        String normalized = clean(raw)
                .replace("'", "")
                .replace("\u00A0", " ")
                .replace(" ", "")
                .replace(",", ".")
                .trim();

        if (!normalized.matches("-?\\d+(\\.\\d+)?")) {
            System.err.println("Nieprawidłowa kwota: [" + raw + "]");
        }

        // Jeśli to nie wygląda na liczbę (np. zaczyna się od '#'), zwróć 0
        if (!normalized.matches("-?\\d+(\\.\\d+)?")) {
            return BigDecimal.ZERO;
        }

        return new BigDecimal(normalized);
    }

    private static Date pickDate(String booking, String operation) {
        String chosen = isBlank(booking) ? operation : booking;
        if (isBlank(chosen)) return new Date();
        LocalDate ld = parseLocalDate(chosen.trim());
        return Date.from(ld.atStartOfDay(ZoneId.systemDefault()).toInstant());
    }

    private static LocalDate parseLocalDate(String s) {
        // szybka heurystyka po separatorze
        try {
            if (s.indexOf('-') >= 0) return LocalDate.parse(s, DATE_ISO);
            return LocalDate.parse(s, DATE_DOTS);
        } catch (DateTimeParseException e) {
            // fallback – spróbuj oba formaty w pętli (na wypadek innych dziwności)
            for (DateTimeFormatter f : List.of(DATE_DOTS, DATE_ISO)) {
                try { return LocalDate.parse(s, f); } catch (Exception ignore) {}
            }
            throw e; // jeśli nic nie pasuje, pokaż oryginalny błąd
        }
    }

    private static String orDefault(String s, String def) {
        return isBlank(s) ? def : s;
    }

    private static String clean(String s) {
        return s == null ? null : s.replace('\u00A0', ' ').trim(); // NBSP -> space
    }

// --- helpers ---

    private static String stripBom(String s) {
        if (s != null && !s.isEmpty() && s.charAt(0) == '\uFEFF') {
            return s.substring(1);
        }
        return s;
    }

    private int findHeaderIndex(List<String> lines) {
        for (int i = 0; i < lines.size(); i++) {
            String l = stripBom(lines.get(i)).trim();
            if (l.contains(COL_OPERATION) || l.contains(COL_BOOKING)) return i;
        }
        return -1;
    }

    private boolean looksLikeHeader(CSVRecord r) {
        // zmapuj klucze: strip BOM + trim
        Set<String> keys = new HashSet<>();
        r.toMap().keySet().forEach(k -> keys.add(stripBom(k).trim()));
        return keys.contains(COL_OPERATION) || keys.contains(COL_BOOKING);
    }

    /** pobiera kolumnę po „luźnym” kluczu: trim + bez BOM */
    private static String getLoose(CSVRecord r, String expectedKey) {
        Map<String,String> map = r.toMap();
        for (Map.Entry<String,String> e : map.entrySet()) {
            String k = e.getKey() == null ? "" : stripBom(e.getKey()).trim();
            if (k.equals(expectedKey)) {
                return e.getValue() == null ? "" : e.getValue().trim();
            }
        }
        return "";
    }

}
