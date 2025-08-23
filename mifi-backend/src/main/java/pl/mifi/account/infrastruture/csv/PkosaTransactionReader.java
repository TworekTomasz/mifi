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
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Component
public class PkosaTransactionReader implements CsvTransactionReader{

    private static final DateTimeFormatter DATE_DOTS = DateTimeFormatter.ofPattern("dd.MM.yyyy");

    @Override
    public List<Transaction> read() {
        // 1) Open classpath resource as InputStream
        try (InputStream in = getClass().getResourceAsStream("/static/reports/pkosa.csv")) {
            if (in == null) {
                throw new IllegalStateException("CSV resource not found: /static/reports/pkosa.csv");
            }

            // 2) Read all lines using Windows-1250 (typical bank export)
            List<String> lines;
            try (BufferedReader br = new BufferedReader(new InputStreamReader(in, Charset.forName("windows-1250")))) {
                lines = br.lines().toList();
            }
            if (lines.isEmpty()) return List.of();

            // 3) Sanitize header: strip BOM + trailing semicolons
            String header = stripBom(lines.get(0)).replaceAll(";+$", "");
            String tail = header + "\n" + String.join("\n", lines.subList(1, lines.size()));

            // 4) Parser for semicolon CSV
            CSVFormat fmt = CSVFormat.newFormat(';')
                    .builder()
                    .setHeader()                   // first line is the header
                    .setSkipHeaderRecord(true)     // skip returning header as a record
                    .setTrim(true)
                    .setAllowMissingColumnNames(true)
                    .build();

            // 5) Parse rows -> Transactions
            List<Transaction> out = new ArrayList<>();
            try (Reader r = new StringReader(tail); CSVParser parser = new CSVParser(r, fmt)) {
                for (CSVRecord rec : parser) {
                    String booking   = get(rec, "Data księgowania");
                    String valueDate = get(rec, "Data waluty");
                    String counter   = get(rec, "Nadawca / Odbiorca");
                    String titleTxt  = get(rec, "Tytułem");
                    String amountRaw = get(rec, "Kwota operacji");
                    String currency  = get(rec, "Waluta");
                    String ref       = unquote(get(rec, "Numer referencyjny"));
                    String opType    = get(rec, "Typ operacji");
                    String srcAcc    = unquote(get(rec, "Rachunek źródłowy"));
                    String dstAcc    = unquote(get(rec, "Rachunek docelowy"));

                    if (isBlank(counter) && isBlank(titleTxt) && isBlank(amountRaw)) continue;

                    BigDecimal amount = parseAmount(amountRaw);        // handles comma decimals
                    Date date = pickDate(booking, valueDate);          // prefers booking date
                    String title = isBlank(counter) ? titleTxt : counter;

                    Transaction t = new Transaction();
                    t.setBank(Bank.PKO_SA);
                    t.setTitle(title);
                    t.setAmount(amount);
                    t.setType(amount.signum() < 0 ? "EXPENSE" : "INCOME");
                    t.setCategory(TitleCategoryClassifier.classify(title).name());
                    t.setAccount(firstNonBlank(srcAcc, dstAcc));
                    t.setDate(date);
                    t.setDescription(buildDescription(titleTxt, ref, opType, currency));

                    out.add(t);
                }
            }

            return out;

        } catch (IOException e) {
            throw new RuntimeException("Failed to read CSV /static/reports/pkosa.csv", e);
        }
    }

    // ----- helpers -----

    private static String get(CSVRecord r, String key) {
        try { String v = r.get(key); return v == null ? "" : v.trim(); }
        catch (IllegalArgumentException e) { return ""; }
    }

    private static boolean isBlank(String s) { return s == null || s.trim().isEmpty(); }

    private static String stripBom(String s) {
        return (s != null && !s.isEmpty() && s.charAt(0) == '\uFEFF') ? s.substring(1) : s;
    }

    private static String unquote(String s) {
        if (s == null) return null;
        s = s.strip();
        if (s.startsWith("'")) s = s.substring(1);
        if (s.endsWith("'"))  s = s.substring(0, s.length() - 1);
        return s;
    }

    private static String firstNonBlank(String a, String b) {
        return isBlank(a) ? (isBlank(b) ? null : b) : a;
    }

    private static BigDecimal parseAmount(String raw) {
        if (isBlank(raw)) return BigDecimal.ZERO;
        String normalized = raw.replace("\u00A0", " ").replace(" ", "").replace("'", "").replace(",", ".").trim();
        if (!normalized.matches("-?\\d+(\\.\\d+)?")) return BigDecimal.ZERO; // guard against headers/garbage
        return new BigDecimal(normalized);
    }

    private static Date pickDate(String booking, String value) {
        String chosen = isBlank(booking) ? value : booking;
        if (isBlank(chosen)) return new Date();
        LocalDate ld = (chosen.indexOf('-') >= 0) ? LocalDate.parse(chosen) : LocalDate.parse(chosen, DATE_DOTS);
        return Date.from(ld.atStartOfDay(ZoneId.systemDefault()).toInstant());
    }

    private static String buildDescription(String titleField, String ref, String opType, String currency) {
        List<String> parts = new ArrayList<>(3);
        if (!isBlank(titleField)) parts.add("Tytułem: " + titleField);
        if (!isBlank(ref))        parts.add("Ref: " + ref);
        if (!isBlank(opType))     parts.add(opType + (isBlank(currency) ? "" : " " + currency));
        return String.join(" | ", parts);
    }
}
