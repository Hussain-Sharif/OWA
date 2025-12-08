export const ALL_USERS_NO_COMMITS_MESSAGES: string[] = [
    "Hey team! No commits from anyone today. Time to get coding! 💻",
    "No commits detected from anyone. Let's step it up! 🚀",
    "Everyone's taking a break today? No commits from anyone! 😴",
    "Zero commits across the board. Time to push some code! 📝",
    "No activity today. Let's make tomorrow more productive! 💪",
];

export const SOME_USERS_NO_COMMITS_MESSAGES: string[] = [
    "Hey {names}! No commits from you today. Time to code! 💻",
    "No new commits detected from {names}. Keep up the great work! 🚀",
    "{names}, you're slacking today! No commits detected. 😅",
    "Hey {name}! No commits from you today. Everything okay? 🤔",
    "{names}, no commits today. Let's get back on track! 📈",
];

function formatNames(names: string[]): string {
    if (names.length === 0) {
        return "team";
    }
    if (names.length === 1) {
        return names[0];
    }
    if (names.length === 2) {
        return `${names[0]} and ${names[1]}`;
    }
    const last = names[names.length - 1];
    const rest = names.slice(0, -1).join(", ");
    return `${rest}, and ${last}`;
}

export function getRandomAllUsersNoCommitsMessage(): string {
    if (ALL_USERS_NO_COMMITS_MESSAGES.length === 0) {
        return "Hey team! No commits from anyone today. Keep coding! 💻";
    }
    const randomIndex = Math.floor(Math.random() * ALL_USERS_NO_COMMITS_MESSAGES.length);
    return ALL_USERS_NO_COMMITS_MESSAGES[randomIndex];
}

export function getRandomSomeUsersNoCommitsMessage(names: string[]): string {
    let message: string;
    if (SOME_USERS_NO_COMMITS_MESSAGES.length === 0) {
        message = "Hey {names}! No commits detected from you today. Keep coding! 💻";
    } else {
        const randomIndex = Math.floor(Math.random() * SOME_USERS_NO_COMMITS_MESSAGES.length);
        message = SOME_USERS_NO_COMMITS_MESSAGES[randomIndex];
    }

    const formattedNames = formatNames(names);
    const firstName = names.length > 0 ? names[0] : "team";

    message = message.replace(/{names}/g, formattedNames);
    message = message.replace(/{name}/g, firstName);

    return message;
}
