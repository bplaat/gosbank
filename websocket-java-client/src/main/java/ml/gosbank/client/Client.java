package ml.gosbank.client;

import java.net.URI;
import java.util.ArrayList;
import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;
import org.json.JSONObject;

public class Client extends WebSocketClient {
    public static interface OnResponseListener {
        public abstract void onResponse(JSONObject data);
    }

    public static class CallbackItem {
        public long id;
        public String type;
        public OnResponseListener onResponseListener;
    }

    private ArrayList<CallbackItem> pendingCallbacks;

    private void sendMessage(String type, JSONObject data, OnResponseListener onResponseListener) {
        long id = System.currentTimeMillis();

        if (onResponseListener != null) {
            CallbackItem callbackItem = new CallbackItem();
            callbackItem.id = id;
            callbackItem.type = type + "_response";
            callbackItem.onResponseListener = onResponseListener;
            pendingCallbacks.add(callbackItem);
        }

        JSONObject message = new JSONObject();
        message.put("id", id);
        message.put("type", type);
        message.put("data", data);
        String jsonMessage = message.toString();
        if (Config.DEBUG) System.out.println("[DEBUG] Sent: " + jsonMessage);
        send(jsonMessage);
    }

    public void sendBalanceMessage(String account, String pin, OnResponseListener onResponseListener) {
        Utils.AccountParts accountParts = Utils.parseAccountParts(account);

        JSONObject balanceMessage = new JSONObject();

        JSONObject balanceMessageHeader = new JSONObject();
        balanceMessageHeader.put("originCountry", Config.COUNTRY_CODE);
        balanceMessageHeader.put("originBank", Config.BANK_CODE);
        balanceMessageHeader.put("receiveCountry", accountParts.country);
        balanceMessageHeader.put("receiveBank", accountParts.bank);
        balanceMessage.put("header", balanceMessageHeader);

        JSONObject balanceMessageBody = new JSONObject();
        balanceMessageBody.put("account", account);
        balanceMessageBody.put("pin", pin);
        balanceMessage.put("body", balanceMessageBody);

        sendMessage("balance", balanceMessage, onResponseListener);
    }

    public void sendPaymentMessage(String fromAccount, String toAccount, String pin, float amount, OnResponseListener onResponseListener) {
        Utils.AccountParts formAccountParts = Utils.parseAccountParts(fromAccount);
        Utils.AccountParts toAccountParts = Utils.parseAccountParts(toAccount);

        JSONObject paymentMessage = new JSONObject();

        JSONObject paymentMessageHeader = new JSONObject();
        paymentMessageHeader.put("originCountry", Config.COUNTRY_CODE);
        paymentMessageHeader.put("originBank", Config.BANK_CODE);
        if (!formAccountParts.bank.equals(Config.BANK_CODE)) {
            paymentMessageHeader.put("receiveCountry", formAccountParts.country);
            paymentMessageHeader.put("receiveBank", formAccountParts.bank);
        }
        if (!toAccountParts.bank.equals(Config.BANK_CODE)) {
            paymentMessageHeader.put("receiveCountry", toAccountParts.country);
            paymentMessageHeader.put("receiveBank", toAccountParts.bank);
        }
        paymentMessage.put("header", paymentMessageHeader);

        JSONObject paymentMessageBody = new JSONObject();
        paymentMessageBody.put("fromAccount", fromAccount);
        paymentMessageBody.put("toAccount", toAccount);
        paymentMessageBody.put("pin", pin);
        paymentMessageBody.put("amount", amount);
        paymentMessage.put("body", paymentMessageBody);

        sendMessage("payment", paymentMessage, onResponseListener);
    }

    public void responseMessage(long id, String type, JSONObject data) {
        JSONObject message = new JSONObject();
        message.put("id", id);
        message.put("type", type);
        message.put("data", data);
        String jsonMessage = message.toString();
        if (Config.DEBUG) System.out.println("[DEBUG] Responed: " + jsonMessage);
        send(jsonMessage);
    }

    public Client(URI uri) {
        super(uri);

        pendingCallbacks = new ArrayList<CallbackItem>();
    }

    public void onOpen(ServerHandshake handshakedata) {
        if (Config.DEBUG) System.out.println("[DEBUG] Connected");

        JSONObject registerMessage = new JSONObject();

        JSONObject registerMessageHeader = new JSONObject();
        registerMessageHeader.put("originCountry", Config.COUNTRY_CODE);
        registerMessageHeader.put("originBank", Config.BANK_CODE);
        registerMessageHeader.put("receiveCountry", "SU");
        registerMessageHeader.put("receiveBank", "GOSB");
        registerMessage.put("header", registerMessageHeader);

        registerMessage.put("body", new JSONObject());

        sendMessage("register", registerMessage, new OnResponseListener() {
            public void onResponse(JSONObject data) {
                JSONObject body = data.getJSONObject("body");
                int code = body.getInt("code");
                if (code == Codes.SUCCESS) {
                    System.out.println("[INFO] Registered with Gosbank with bank code: " + Config.BANK_CODE);

                    // Do stuff
                }
                else {
                    System.out.println("[WARNING] Error with registering to Gosbank, code: " + code);
                }
            }
        });
    }

    public void onMessage(String jsonMessage) {
        try {
            if (Config.DEBUG) System.out.println("[DEBUG] Message: " + jsonMessage);

            // Parse message
            JSONObject message = new JSONObject(jsonMessage);
            long id = message.getLong("id");
            String type = message.getString("type");
            JSONObject data = message.getJSONObject("data");

            // Resolve pending callbacks
            for (int i = 0; i < pendingCallbacks.size(); i++) {
                CallbackItem callbackItem = pendingCallbacks.get(i);
                if (callbackItem.id == id && callbackItem.type.equals(type)) {
                    callbackItem.onResponseListener.onResponse(data);
                    pendingCallbacks.remove(i--);
                }
            }

            if (type.equals("balance")) {
                // Balance request
            }

            if (type.equals("payment")) {
                // Payment request
            }
        }
        catch (Exception exception) {
            exception.printStackTrace();
        }
    }

    public void onClose(int code, String reason, boolean remote) {
        System.out.println("[WARNING] Disconnected, try to reconnect in " + (Config.RECONNECT_TIMEOUT / 1000) + " seconds!");

        try {
            Thread.sleep(Config.RECONNECT_TIMEOUT);
        }
        catch (Exception exception) {
            exception.printStackTrace();
        }

        tryToConnect();
    }

    public void onError(Exception exception) {
        exception.printStackTrace();
    }

    public static void tryToConnect() {
        try {
            Client client = new Client(new URI(Config.GOSBANK_URL));
            client.connect();
        }
        catch (Exception exception) {
            exception.printStackTrace();
        }
    }
}
