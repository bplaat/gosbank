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
        String[] parts = account.split("-");
        AccountParts accountParts = new AccountParts();
        accountParts.country = parts[0];
        accountParts.bank = parts[1];
        accountParts.account = Integer.parseInt(parts[2]);
        return accountParts;
    }
}
