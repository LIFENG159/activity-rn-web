import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

// 气泡浮动动画 Hook：控制缩放与上下浮动
export function useFloatingBubble(active) {
  const bubbleScale = useRef(new Animated.Value(0)).current;
  const bubbleFloat = useRef(new Animated.Value(0)).current;
  const floatLoopRef = useRef(null);

  useEffect(() => {
    if (active) {
      // 激活时弹出并开始浮动
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
      // 未激活时重置动画状态
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
