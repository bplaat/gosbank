package ml.gosbank.client;

// Static utils class
public class Utils {
    private Utils() {}

    // The account parts data holder
    public static class AccountParts {
        public String country;
        public String bank;
        public int account;
    }

    // Parses an account string to its parts
    public static AccountParts parseAccountParts(String account) {
        AccountParts accountParts = new AccountParts();
        accountParts.country = account.substring(0, 2);
        accountParts.bank = account.substring(3, 7);
        accountParts.account = Integer.parseInt(account.substring(8));
        return accountParts;
    }
}
