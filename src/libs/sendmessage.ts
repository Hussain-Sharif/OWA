function buildGreenApiUrl(templateUrl: string, method: string): string {
    return templateUrl.replace("{method}", method);
}

export async function sendWhatsAppMessage({
    message,
    greenApiUrl,
    chatId,
}: {
    message: string;
    greenApiUrl: string;
    chatId: string;
}): Promise<void> {
    const apiUrl = buildGreenApiUrl(greenApiUrl, "sendMessage");

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
