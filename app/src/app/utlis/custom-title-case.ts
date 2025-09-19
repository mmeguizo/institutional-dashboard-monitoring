export function customTitleCase(str: string): string {
    // Split the string into words
    const words = str.split(/\s+/);
    const formattedWords = words.map(
        (word: string) =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    );
    // Join the formatted words back into a string
    return formattedWords.join(' ');
}

export function RemoveUnderscoreInAstring(str: string): string {
    return str.replace(/_/g, ' ');
}
