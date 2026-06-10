import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
    interpolate,
    Extrapolate,
} from 'react-native-reanimated';
import { colors } from '../theme/tokens';

/**
 * Heartbeat animation for likes or music beats
 */
export const Heartbeat: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const scale = useSharedValue(1);

    useEffect(() => {
        scale.value = withRepeat(
            withSequence(
                withSpring(1.2, { damping: 2, stiffness: 80 }),
                withSpring(1, { damping: 2, stiffness: 80 }),
            ),
            -1,
            true,
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

/**
 * Glow/Radiance effect
 */
export const Radiance: React.FC<{ size: number; color?: string }> = ({
    size,
    color = colors.accent,
}) => {
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(
            withTiming(0.7, { duration: 2000 }),
            -1,
            true,
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: interpolate(opacity.value, [0.3, 0.7], [1, 1.5]) }],
    }));

    return (
        <Animated.View
            style={[
                styles.glow,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: color,
                    shadowColor: color,
                    shadowRadius: 20,
                    shadowOpacity: 1,
                },
                animatedStyle,
            ]}
        />
    );
};

/**
 * Sparkle effect (simple particle-like pulse)
 */
export const Sparkle: React.FC<{ style?: ViewStyle }> = ({ style }) => {
    const scale = useSharedValue(0);

    useEffect(() => {
        const delay = Math.random() * 2000;
        scale.value = withSequence(
            withTiming(0, { duration: delay }),
            withRepeat(
                withSequence(
                    withTiming(1, { duration: 600 }),
                    withTiming(0, { duration: 600 }),
                    withTiming(0, { duration: 1000 }),
                ),
                -1,
            ),
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: scale.value,
    }));

    return (
        <Animated.View
            style={[
                styles.sparkle,
                { backgroundColor: colors.precision },
                style,
                animatedStyle,
            ]}
        />
    );
};

/**
 * Morphing container (expands/contracts or changes shape)
 */
export const MorphingView: React.FC<{
    expanded: boolean;
    children: React.ReactNode;
    style?: ViewStyle;
}> = ({ expanded, children, style }) => {
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withSpring(expanded ? 1 : 0, {
            damping: 15,
            stiffness: 100,
        });
    }, [expanded]);

    const animatedStyle = useAnimatedStyle(() => ({
        borderRadius: interpolate(progress.value, [0, 1], [12, 32]),
        transform: [
            { scale: interpolate(progress.value, [0, 1], [1, 1.05]) },
        ],
    }));

    return (
        <Animated.View style={[style, animatedStyle]}>
            {children}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    glow: {
        position: 'absolute',
        zIndex: -1,
    },
    sparkle: {
        position: 'absolute',
        width: 4,
        height: 4,
        borderRadius: 2,
    },
});
