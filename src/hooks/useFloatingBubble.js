import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

export function useFloatingBubble(active) {
  const bubbleScale = useRef(new Animated.Value(0)).current;
  const bubbleFloat = useRef(new Animated.Value(0)).current;
  const floatLoopRef = useRef(null);

  useEffect(() => {
    if (active) {
      Animated.spring(bubbleScale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: false,
      }).start();

      if (!floatLoopRef.current) {
        floatLoopRef.current = Animated.loop(
          Animated.sequence([
            Animated.timing(bubbleFloat, {
              toValue: 1,
              duration: 1200,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
            }),
            Animated.timing(bubbleFloat, {
              toValue: 0,
              duration: 1200,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
            }),
          ])
        );
        floatLoopRef.current.start();
      }
    } else {
      bubbleScale.setValue(0);
      if (floatLoopRef.current) {
        floatLoopRef.current.stop();
        floatLoopRef.current = null;
      }
      bubbleFloat.setValue(0);
    }

    return () => {
      if (floatLoopRef.current) {
        floatLoopRef.current.stop();
        floatLoopRef.current = null;
      }
    };
  }, [active, bubbleFloat, bubbleScale]);

  const bubbleTranslate = bubbleFloat.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  return {
    bubbleStyle: {
      transform: [{ scale: bubbleScale }, { translateY: bubbleTranslate }],
    },
  };
}
