package ml.gosbank.client;

import java.net.URI;
import java.net.URISyntaxException;

public class Main {
    public static void main(String[] args) {
        try {
            Client client = new Client(new URI("wss://ws.gosbank.ml"));
            client.connect();
        } catch (URISyntaxException exception) {
            exception.printStackTrace();
        }
	}
}
