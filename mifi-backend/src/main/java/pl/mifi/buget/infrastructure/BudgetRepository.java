package pl.mifi.buget.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.mifi.buget.domain.Budget;
import pl.mifi.buget.domain.Type;

import java.util.List;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, String> {
    List<Budget> findAllByType(Type type);
}
