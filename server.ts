import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

app.post("/api/chat", async (req, res) => {
  try {
    const { messages, scenarioContext } = req.body;
    
    // Get the last user message text
    const currentMessage = messages[messages.length - 1].text.toLowerCase();
    
    let responseText = "I'm sorry, I don't understand that request. Could you please rephrase it?";

    if (scenarioContext.includes("Priya Nair")) {
      if (currentMessage.includes("upgrade") || currentMessage.includes("business class") || currentMessage.includes("furious")) {
        responseText = "I completely understand the frustration, Priya. I can definitely process a **full refund** to your original payment method for the cancelled flight. However, I **cannot approve a free upgrade** to business class on your return flight, as this is beyond our stated policy amounts.\n\nWould you like me to go ahead and initiate the refund?";
      } else {
        responseText = "I can rebook you on the next available flight within 24 hours at no extra cost, or process a full refund to your original payment method. Which would you prefer?";
      }
    } else if (scenarioContext.includes("Arvind Kulkarni")) {
      if (currentMessage.includes("hotel") || currentMessage.includes("accommodation") || currentMessage.includes("meeting")) {
        responseText = "I'm sorry for the disruption, Arvind. Your flight is delayed 4 hours, which qualifies for a **₹500 meal voucher and lounge access** under our policy. I've applied both to your account now.\n\nUnfortunately, I **cannot arrange hotel accommodation**, as that is only provided for delays of more than 5 hours.";
      } else {
        responseText = "I'm sorry for the disruption. Your flight is delayed 4 hours, which qualifies for a meal voucher and lounge access under our policy. I've applied both to your account now.";
      }
    } else if (scenarioContext.includes("Meher Kaur")) {
      if (currentMessage.includes("full night") || currentMessage.includes("waive") || currentMessage.includes("different") || currentMessage.includes("2,000") || currentMessage.includes("2000")) {
        responseText = "I hear you, Meher, and I'm sorry this has been such a frustrating experience. Under our policy, I can arrange hotel accommodation **only for the delayed hours**, not a full night's stay.\n\nAdditionally, I **cannot waive the fare difference of ₹2,000**, as it exceeds my limit of ₹1,500.\n\nI want to make sure this gets the right attention — **I'm escalating this to our specialist support team right now**, and they'll reach out to you directly.";
      } else {
        responseText = "I'm sorry for the disruption. Your flight is delayed 6 hours, which qualifies for a meal voucher and hotel accommodation for the delayed hours. I've applied these to your account now.";
      }
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    // Simulate streaming the hardcoded text back to the client
    const words = responseText.split(" ");
    for (const word of words) {
      res.write(word + " ");
      await new Promise(r => setTimeout(r, 40)); // slight artificial delay for typewriter effect
    }

    res.end();
  } catch (error: any) {
    console.error("Error processing chat message:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to process chat message." });
    } else {
      res.end("\\n\\n[Connection Error]");
    }
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
