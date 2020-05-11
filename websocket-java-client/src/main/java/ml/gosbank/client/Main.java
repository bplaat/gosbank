package ml.gosbank.client;

public class Main {
    // Main entry point
    public static void main(String[] args) {
        Log.info("Gosbank Java Client Example");

        // Try to connect to Gosbank
        Client.tryToConnect();
    }
}
