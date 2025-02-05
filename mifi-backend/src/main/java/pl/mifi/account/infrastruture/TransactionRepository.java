package pl.mifi.account.infrastruture;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.mifi.account.domain.Transaction;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, String> {
}
