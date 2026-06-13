import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { navigateToHandoff } from '../../app/navigation/navigationRef';
import { PlayerScrubber } from '../../shared/ui/PlayerScrubber';
import { usePlayerStore } from '../../stores/playerStore';
import * as playerService from '../../services/audio/playerService';
import { colors, spacing } from '../../shared/theme/tokens';

import { Radiance, Heartbeat, Sparkle } from '../../shared/ui/Animations';
import { fetchComments } from '../../services/catalog/catalogService';
import type { Comment } from '../../types/models';

export function PlayerFullScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const track = usePlayerStore(s => s.currentTrack());
  const isPlaying = usePlayerStore(s => s.isPlaying);
  const positionSec = usePlayerStore(s => s.positionSec);
  const durationSec = usePlayerStore(s => s.durationSec);
  const [liked, setLiked] = React.useState(false);
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [showComments, setShowComments] = React.useState(false);

  React.useEffect(() => {
    if (track) {
      fetchComments(track.id, 0).then(setComments);
    }
  }, [track]);

  if (!track) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Aucune lecture en cours</Text>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <Pressable onPress={() => navigation.goBack()} style={styles.close}>
        <Text style={styles.closeText}>▼ Réduire</Text>
      </Pressable>

      <View style={styles.artContainer}>
        {isPlaying && <Radiance size={300} color={colors.accent} />}
        <Image source={{ uri: track.coverUrl }} style={styles.art} />
        {liked && <Sparkle style={{ top: 20, right: 20 }} />}
      </View>

      <View style={styles.headerInfo}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{track.title}</Text>
          <Text style={styles.artist}>
            {track.artistName} · {track.genre}
          </Text>
        </View>
        <Heartbeat>
          <Pressable onPress={() => setLiked(!liked)}>
            <Text style={[styles.likeIcon, { color: liked ? colors.punk : colors.muted }]}>
              {liked ? '❤️' : '🤍'}
            </Text>
          </Pressable>
        </Heartbeat>
      </View>

      <View style={styles.statsRow}>
        <Text style={styles.stat}>{track.views.toLocaleString()} vues</Text>
        <Text style={styles.stat}>{track.likes} j'aime</Text>
        <Pressable onPress={() => setShowComments(!showComments)}>
          <Text style={[styles.stat, { color: colors.precision }]}>
            {comments.length} commentaires
          </Text>
        </Pressable>
      </View>

      <PlayerScrubber
        positionSec={positionSec}
        durationSec={durationSec || track.durationMs / 1000}
        onSeek={sec => playerService.seekTo(sec)}
      />

      <View style={styles.controls}>
        <Pressable onPress={() => playerService.skipPrevious()}>
          <Text style={styles.controlIcon}>⏮</Text>
        </Pressable>
        <Pressable
          style={styles.playMain}
          onPress={() => playerService.togglePlayPause()}>
          <Text style={styles.playMainIcon}>{isPlaying ? '❚❚' : '▶'}</Text>
        </Pressable>
        <Pressable onPress={() => playerService.skipNext()}>
          <Text style={styles.controlIcon}>⏭</Text>
        </Pressable>
      </View>

      {showComments && (
        <View style={styles.commentsOverlay}>
          <Text style={styles.commentsTitle}>Commentaires (top 20)</Text>
          {comments.slice(0, 20).map(c => (
            <View key={c.id} style={styles.commentItem}>
              <Text style={styles.commentContent}>{c.content}</Text>
            </View>
          ))}
          {comments.length === 0 && <Text style={styles.noComments}>Aucun commentaire</Text>}
        </View>
      )}

      <Pressable style={styles.handoffBtn} onPress={navigateToHandoff}>
        <Text style={styles.handoffText}>Partager avec AfroBump 🤜🤛</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.void, paddingHorizontal: spacing.lg },
  empty: { flex: 1, backgroundColor: colors.void, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: colors.textDim },
  link: { color: colors.accent, marginTop: spacing.md },
  close: { alignSelf: 'center', padding: spacing.sm, marginBottom: spacing.md },
  closeText: { color: colors.muted, fontSize: 14, fontWeight: '600' },
  artContainer: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  art: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    backgroundColor: colors.surface,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: { color: colors.text, fontSize: 26, fontWeight: '800' },
  artist: { color: colors.textDim, fontSize: 16, marginTop: 4 },
  likeIcon: { fontSize: 28 },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  stat: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
    marginTop: spacing.xl,
  },
  controlIcon: { fontSize: 36, color: colors.text },
  playMain: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: colors.accent,
    shadowRadius: 15,
    shadowOpacity: 0.5,
  },
  playMainIcon: { fontSize: 32, color: colors.void },
  commentsOverlay: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 16,
    maxHeight: 200,
  },
  commentsTitle: { color: colors.text, fontWeight: '700', marginBottom: spacing.sm },
  commentItem: { paddingVertical: spacing.xs, borderBottomWidth: 0.5, borderBottomColor: colors.elevated },
  commentContent: { color: colors.textDim, fontSize: 13 },
  noComments: { color: colors.muted, fontStyle: 'italic', textAlign: 'center' },
  handoffBtn: {
    marginTop: 'auto',
    marginBottom: 40,
    padding: spacing.md,
    backgroundColor: colors.elevated,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  handoffText: { color: colors.text, fontWeight: '700' },
});
