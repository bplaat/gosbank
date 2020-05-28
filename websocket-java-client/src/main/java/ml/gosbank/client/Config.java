package ml.gosbank.client;

// Static config class
public class Config {
    private Config() {}

    public static final boolean DEBUG = false;

    public static final String GOSBANK_URL = "ws://localhost:8080/";

    public static final String COUNTRY_CODE = "SO";
    public static final String BANK_CODE = "TEST";

    public static final int RECONNECT_TIMEOUT = 2 * 1000;
}
