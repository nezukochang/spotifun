import type { Track } from '../../types/models';

/**
 * Service to handle remix logic as requested:
 * - Cartesian product approach for similarity joins
 * - Dichotomy search for efficient ID lookup
 */

/**
 * Finds the index of a track ID in a sorted array of IDs using binary search (dichotomy).
 */
export function findTrackIndexById(sortedIds: string[], targetId: string): number {
    let low = 0;
    let high = sortedIds.length - 1;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const midId = sortedIds[mid];

        if (midId === targetId) {
            return mid;
        } else if (midId < targetId) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }

    return -1;
}

/**
 * Groups tracks and their remixes using a "Cartesian product" like comparison.
 * In a real-world scenario, we'd optimize this, but following the specific
 * request to use Cartesian product logic for joining similar tracks.
 */
export function identifyRemixes(tracks: Track[]): Map<string, Track[]> {
    const remixGroups = new Map<string, Track[]>();

    // Sort tracks by ID for dichotomy search later if needed
    const sortedTracks = [...tracks].sort((a, b) => a.id.localeCompare(b.id));
    const sortedIds = sortedTracks.map(t => t.id);

    // We iterate through all pairs (Cartesian product)
    for (let i = 0; i < tracks.length; i++) {
        const trackA = tracks[i];

        // Check if this track is already an original in a group
        if (remixGroups.has(trackA.id)) continue;

        // A remix group starts with the original track (or the first found version)
        const group: Track[] = [trackA];

        for (let j = 0; j < tracks.length; j++) {
            if (i === j) continue;
            const trackB = tracks[j];

            // Criteria for "being a remix or version of the same song"
            // 1. Explicit link via originalTrackId
            // 2. Or very similar title (naive check for the demo)
            const isExplicitRemix = trackB.originalTrackId === trackA.id || trackA.originalTrackId === trackB.id;
            const sharesTitle = trackB.title.toLowerCase().includes(trackA.title.toLowerCase()) ||
                trackA.title.toLowerCase().includes(trackB.title.toLowerCase());

            const sameArtist = trackA.artistId === trackB.artistId;

            if (isExplicitRemix || (sharesTitle && sameArtist)) {
                // Use dichotomy to find the track in our sorted list (validating existence)
                const idx = findTrackIndexById(sortedIds, trackB.id);
                if (idx !== -1) {
                    group.push(trackB);
                }
            }
        }

        if (group.length > 1) {
            remixGroups.set(trackA.id, group);
        }
    }

    return remixGroups;
}
