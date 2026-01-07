export const PERSONALIZED_NO_COMMITS_MESSAGES: string[] = [
    "{name} is on holiday today",
    "{name} is on sick leave today",
    "{name} is on vacation today",
    "{name} is on leave today",
    "{name} is on personal day today",
    "{name} is on day off today",
    "{name} is on a business trip today",
    "{name} is on a business meeting today",
    "{name} is on a business conference today",
    "{name} is on a business trip today",
    "{name} is on a business meeting today",
    "{name} is on a business conference today",
];

export function getRandomSingleUserNoCommitsMessage(name: string): string {
    let message: string;
    if (PERSONALIZED_NO_COMMITS_MESSAGES.length === 0) {
        message = "Hey {name}! No commits detected from you today. Keep coding! 💻";
    } else {
        const randomIndex = Math.floor(Math.random() * PERSONALIZED_NO_COMMITS_MESSAGES.length);
        message = PERSONALIZED_NO_COMMITS_MESSAGES[randomIndex];
    }

    return message.replace(/{name}/g, name);
}

// Fisher-Yates shuffle algorithm for proper randomization
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export function getUniqueMessagesForUsers(names: string[]): Map<string, string> {
    const messageMap = new Map<string, string>();

    if (PERSONALIZED_NO_COMMITS_MESSAGES.length === 0) {
        names.forEach((name) => {
            messageMap.set(
                name,
                "Hey {name}! No commits detected from you today. Keep coding! 💻".replace(
                    /{name}/g,
                    name,
                ),
            );
        });
        return messageMap;
    }

    const shuffledMessages = shuffleArray(PERSONALIZED_NO_COMMITS_MESSAGES);

    const numUsers = names.length;
    const numMessages = shuffledMessages.length;
    if (numUsers <= numMessages) {
        names.forEach((name, index) => {
            const messageTemplate = shuffledMessages[index];
            const personalizedMessage = messageTemplate.replace(/{name}/g, name);
            messageMap.set(name, personalizedMessage);
        });
    } else {
        const usedTemplates = new Set<string>();
        names.forEach((name, index) => {
            let messageTemplate: string = shuffledMessages[0];
            if (usedTemplates.size < numMessages) {
                for (let i = 0; i < numMessages; i++) {
                    if (!usedTemplates.has(shuffledMessages[i])) {
                        messageTemplate = shuffledMessages[i];
                        usedTemplates.add(shuffledMessages[i]);
                        break;
                    }
                }
            } else {
                const messageIndex = Math.floor(Math.random() * numMessages);
                messageTemplate = shuffledMessages[messageIndex];
            }

            const personalizedMessage = messageTemplate.replace(/{name}/g, name);
            messageMap.set(name, personalizedMessage);
        });
    }

    return messageMap;
}
