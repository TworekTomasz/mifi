package pl.mifi.buget.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import pl.mifi.buget.domain.Budget;
import pl.mifi.buget.domain.Type;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, String> {
    List<Budget> findAllByType(Type type);

    @Query("""
            select b from Budget b
            where b.type = :type
            and b.periodStart = :start
            and b.periodEnd = :end
            """)
    Optional<Budget> findByTypeAndPeriod(Type type, LocalDate start, LocalDate end);

    default Optional<Budget> findMonthly(YearMonth month) {
        return findByTypeAndPeriod(Type.MONTHLY, month.atDay(1), month.atEndOfMonth());
    }

    Optional<Budget> findByIsDefaultTemplateTrue();
}
