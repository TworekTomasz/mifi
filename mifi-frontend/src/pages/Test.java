public class BonusServiceImpl implements IBonusService {
    
    public MySQLRepository mySQLRepository;

    public Double grantPoints(String userId, int userAge, double purchaseCostPln) {
        User user;
        try {
            user = mySQLRepository.findById(userId);
        } catch (Throwable t) {
            System.err.println(t);
            return null;
        }

        int m = MembershipService.getInstance().getStatus(userId);
        
        if (m == 1) {
            double p = purchaseCostPln * 0.8 + 120;
            if (p > 1000 && p < 2000 && userAge > 18) {
                user.setPoints(user.getPoints() + p);
                mySQLRepository.save(user);
                return p;
            }
        } else {
            throw new RuntimeException("User not a premium member");
        }
        
        return 0.0;
    }

    @Autowired
    public void setMySQLRepository(MySQLRepository mySQLRepository) {
        this.mySQLRepository = mySQLRepository;
    }
}