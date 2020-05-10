package ml.gosbank.client;

import java.net.URI;
import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;

public class Client extends WebSocketClient {
    public Client(URI uri) {
        super(uri);
    }

    public void onOpen(ServerHandshake handshakedata) {
        System.out.println("connection");
    }

    public void onMessage(String message) {
        System.out.println("message: " + message);
    }

    public void onClose(int code, String reason, boolean remote) {
        System.out.println("closed");
    }

    public void onError(Exception exception) {
        exception.printStackTrace();
    }
}
