// ✅ TypeScript Version
export async function sendWhatsAppMessage({message,greenApiUrl}:{message: string,greenApiUrl:string}): Promise<void> {
    const chatId = "120363169536263534@g.us";
    // console.log(greenApiUrl)
    const apiUrl = greenApiUrl;
    
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
