const express = require("express");
const { Client, LocalAuth } = require("whatsapp-web.js");

const app = express();
app.use(express.json()); // For parsing JSON request bodies

let whatsappClient;

// Initialize WhatsApp Client
const initializeWhatsAppClient = () => {
  return new Promise((resolve, reject) => {
    whatsappClient = new Client({
      authStrategy: new LocalAuth(),
    });

    whatsappClient.on("qr", (qr) => {
      // Generate and resolve the QR code
      resolve(qr); // Send the QR code to the caller
    });

    whatsappClient.on("ready", () => {
      console.log("WhatsApp Client is ready!");
    });

    whatsappClient.on("authenticated", () => {
      console.log("Authenticated successfully!");
    });

    whatsappClient.on("auth_failure", (message) => {
      console.error("Authentication failed:", message);
      reject(new Error("Authentication failed: " + message));
    });

    whatsappClient.on("disconnected", (reason) => {
      console.log("Client disconnected:", reason);
    });

    whatsappClient.initialize();
  });
};

// Function to get the initialized WhatsApp client
const getClient = () => {
  if (!whatsappClient) {
    throw new Error("WhatsApp Client is not initialized.");
  }
  return whatsappClient;
};

// API Endpoints
// Initialize WhatsApp Client and send QR code
app.get("/initialize", async (req, res) => {
  try {
    res.status(200).json({ response: await initializeWhatsAppClient() }); // Send QR code in response
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send a message
app.post("/send-message", async (req, res) => {
  const { phone, message } = req.body;

  if (!phone || !message) {
    return res.status(400).json({ error: "Phone and message are required." });
  }

  try {
    const client = getClient();
    const formattedPhone = `${phone}@c.us`; // Format phone number
    await client.sendMessage(formattedPhone, message);
    res.status(200).json({ status: `Message sent successfully to ${phone}.` });
  } catch (error) {
    res.status(500).json({ error: `Failed to send message: ${error.message}` });
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
