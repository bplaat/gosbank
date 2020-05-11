package ml.gosbank.client;

import org.json.JSONObject;

public class Main {
    // Main entry point
    public static void main(String[] args) {
        Log.info("Gosbank Java Client Example");

        // Try to connect to Gosbank
        Client.getInstance().connect();

        // Request random data in a loop
        String[] bankCodes = { "BANQ", "DASB", "GETB", "TEST" };
        int number = 1;
        while (true) {
            // Check if we are connected
            if (Client.getInstance().isConnected()) {
                String account = String.format("SU-%s-%08d", bankCodes[(int)(Math.random() * bankCodes.length)], number++);
                Client.getInstance().sendBalanceMessage(account, "1234", (JSONObject data) -> {
                    JSONObject body = data.getJSONObject("body");
                    int code = body.getInt("code");
                    if (code == Codes.SUCCESS) {
                        Log.info("Balance " + account + ": " + body.getFloat("balance"));
                    }
                    else {
                        Log.warning("Balance error code: " + code);
                    }
                });

                String fromAccount = String.format("SU-%s-%08d", Config.BANK_CODE, number++);
                String toAccount = String.format("SU-%s-%08d", bankCodes[(int)(Math.random() * bankCodes.length)], number++);
                float amount = (float)(Math.random() * 500);
                Client.getInstance().sendPaymentMessage(fromAccount, toAccount, "1234", amount, (JSONObject data) -> {
                    JSONObject body = data.getJSONObject("body");
                    int code = body.getInt("code");
                    if (code == Codes.SUCCESS) {
                        Log.info("Payment success");
                    }
                    else {
                        Log.warning("Payment error code: " + code);
                    }
                });
            }

            // Wait a short time
            try {
                Thread.sleep(2000);
            }
            catch (Exception exception) {
                Log.error(exception);
            }
        }
    }
}
