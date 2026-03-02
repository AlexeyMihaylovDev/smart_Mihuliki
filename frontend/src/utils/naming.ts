/**
 * Cleans up entity names by removing domain prefixes (e.g., "Switch ", "Light ")
 * and formatting entity IDs nicely if no friendly name is provided.
 */
export const cleanEntityName = (friendlyName: string, entityId: string): string => {
    let name = friendlyName || '';

    // If no friendly name, use the part of entity_id after the dot
    if (!name && entityId.includes('.')) {
        name = entityId.split('.')[1].replace(/_/g, ' ');
    }

    // List of prefixes to strip (case-insensitive)
    const prefixes = [
        'switch',
        'light',
        'sensor',
        'binary sensor',
        'climate',
        'cover',
        'vacuum',
        'camera',
        'media player',
        'scene',
        'script',
        'automation'
    ];

    let cleaned = name;

    // Strip common prefixes like "Switch ", "Light: ", etc.
    for (const prefix of prefixes) {
        const regex = new RegExp(`^${prefix}[:\\s-]*`, 'i');
        cleaned = cleaned.replace(regex, '');
    }

    // Capitalize first letter if it was stripped
    if (cleaned.length > 0) {
        cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }

    return cleaned.trim() || name;
};
