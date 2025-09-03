package pl.mifi.buget.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.mifi.buget.domain.Budget;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, String> {
}
