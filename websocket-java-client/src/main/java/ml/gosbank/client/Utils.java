package ml.gosbank.client;

public class Utils {
    private Utils() {}

    public static class AccountParts {
        public String country;
        public String bank;
        public int account;
    }

    public static AccountParts parseAccountParts(String account) {
        AccountParts accountParts = new AccountParts();
        accountParts.country = account.substring(0, 2);
        accountParts.bank = account.substring(3, 7);
        accountParts.account = Integer.parseInt(account.substring(8));
        return accountParts;
    }
}
