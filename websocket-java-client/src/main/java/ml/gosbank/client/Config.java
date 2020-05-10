package ml.gosbank.client;

public class Config {
    private Config() {}

    public static final boolean DEBUG = true;

    public static final String GOSBANK_URL = "wss://ws.gosbank.ml/";

    public static final String COUNTRY_CODE = "SU";
    public static final String BANK_CODE = "BANQ";

    public static final int RECONNECT_TIMEOUT = 2 * 1000;
}
