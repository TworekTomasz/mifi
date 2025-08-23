package pl.mifi.account.application.transaction;

import org.springframework.stereotype.Component;
import pl.mifi.account.domain.Transaction;
import pl.mifi.account.infrastruture.csv.CsvTransactionReader;
import pl.mifi.cqrs.QueryHandler;

import java.util.*;

@Component
public class GetAllTransactionQueryHandler implements QueryHandler<GetAllTransactionQuery, List<Transaction>> {

    private final List<CsvTransactionReader> readers; // wszystkie implementacje

    public GetAllTransactionQueryHandler(List<CsvTransactionReader> readers) {
        this.readers = readers;
    }

    @Override
    public List<Transaction> handle(GetAllTransactionQuery query) {
        // 1) odpal wszystkich readerów i zbierz wyniki
        List<Transaction> merged = new ArrayList<>();
        for (CsvTransactionReader r : readers) {
            try {
                List<Transaction> chunk = r.read();
                if (chunk != null && !chunk.isEmpty()) {
                    merged.addAll(chunk);
                }
            } catch (Exception ex) {
                // izolujemy błąd jednego banku – log + jedziemy dalej
                // (tu użyj swojego loggera)
                System.err.println("Reader failed: " + r.getClass().getSimpleName() + " -> " + ex.getMessage());
            }
        }

        // 2) deduplikacja – fingerprint po (date, amount, normalized title)
        Set<String> seen = new HashSet<>();
        List<Transaction> unique = new ArrayList<>(merged.size());
        for (Transaction t : merged) {
            String fp = fingerprint(t);
            if (seen.add(fp)) {
                unique.add(t);
            }
        }

        // 3) sortowanie – najnowsze na górze, potem po kwocie malejąco
        unique.sort(Comparator
                .comparing(Transaction::getDate, Comparator.nullsLast(Comparator.naturalOrder())).reversed()
                .thenComparing(Transaction::getAmount, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(t -> normalizeTitle(t.getTitle()), Comparator.nullsLast(Comparator.naturalOrder()))
        );

        return unique;
    }

    private static String fingerprint(Transaction t) {
        String date = (t.getDate() == null) ? "?" :
                String.valueOf(t.getDate().getTime() / 1000); // do sekundy
        String amt  = (t.getAmount() == null) ? "0" : t.getAmount().stripTrailingZeros().toPlainString();
        String ttl  = normalizeTitle(t.getTitle());
        // możesz dorzucić account / currency jeśli masz
        return date + "|" + amt + "|" + ttl;
    }

    private static String normalizeTitle(String raw) {
        if (raw == null) return "";
        String s = raw;
        int idx = s.indexOf("DATA TRANSAKCJI");
        if (idx >= 0) s = s.substring(0, idx);
        s = java.text.Normalizer.normalize(s, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+","")
                .replace('/', ' ')
                .replaceAll("[^A-Za-z0-9 ]+"," ")
                .replaceAll("\\s+"," ")
                .trim()
                .toUpperCase();
        return s;
    }
}
