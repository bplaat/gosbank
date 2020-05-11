package ml.gosbank.client;

// Static config class
public class Config {
    private Config() {}

    public static final boolean DEBUG = false;

    public static final String GOSBANK_URL = "wss://ws.gosbank.ml/";

    public static final String COUNTRY_CODE = "SU";
    public static final String BANK_CODE = "TEST";

    public static final int RECONNECT_TIMEOUT = 2 * 1000;
}
