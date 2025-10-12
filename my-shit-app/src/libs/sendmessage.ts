// ✅ TypeScript Version
export async function sendWhatsAppMessage(message: string): Promise<void> {
    const chatId = "120363169536263534@g.us"; 
    const apiUrl =
        "https://7105.api.greenapi.com/waInstance7105341467/sendMessage/d4a457b0df2a45adbf8f1dd0922f9e10d97be7e200bc4dd081";

    const headers = new Headers({
        "User-Agent": "GREEN-API_POSTMAN/1.0",
        "Content-Type": "application/json",
    });

    const body = JSON.stringify({
        chatId: chatId,
        message: message,
    });

    const requestOptions: RequestInit = {
        method: "POST",
        headers: headers,
        body: body,
        redirect: "follow",
    };

    try {
        const response = await fetch(apiUrl, requestOptions);
        const result = await response.text();
        console.log("Message sent successfully:", result);
    } catch (error) {
        console.error("Error sending message:", error);
    }
}
