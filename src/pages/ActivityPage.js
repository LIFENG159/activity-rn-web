import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, Text, View } from 'react-native';

import PointsBubble from '../components/PointsBubble';
import PrizeWheel from '../components/PrizeWheel';
import StatCard from '../components/StatCard';
import TaskCard from '../components/TaskCard';
import { useCountdownTask } from '../hooks/useCountdownTask';
import { useFloatingBubble } from '../hooks/useFloatingBubble';
import TaskSdk from 'task-sdk';
import { BROWSE_DURATION, BROWSE_POINTS, ORDER_POINTS, PRIZES } from '../utils/constants';

export default function ActivityPage() {
  const [pendingPoints, setPendingPoints] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [spinChances, setSpinChances] = useState(0);
  const [orderComplete, setOrderComplete] = useState(false);
  const [lastPrize, setLastPrize] = useState(null);
  const [serviceTasks, setServiceTasks] = useState([]);

  const sdkRef = useRef(null);
  const bubbleTriggeredRef = useRef(new Set());
  const sdkSectionRef = useRef(null);
  const scrollAreaRef = useRef(null);

  const spinValue = useRef(new Animated.Value(0)).current;
  const spinDegree = useRef(0);

  const awardPoints = (points) => {
    setPendingPoints((prev) => prev + points);
    setSpinChances((prev) => prev + 1);
  };

  const browseTask = useCountdownTask({
    duration: BROWSE_DURATION,
    onComplete: () => awardPoints(BROWSE_POINTS),
  });

  const { bubbleStyle } = useFloatingBubble(pendingPoints > 0);

  useEffect(() => {
    const baseUrl = process.env.REACT_APP_TASK_API_BASE;
    if (!baseUrl) {
      return undefined;
    }

    const sdk = new TaskSdk({
      baseUrl,
      activityId: 'activity-demo',
      userId: 'user-demo',
      callbacks: {
        onTasksUpdated: (tasks) => {
          setServiceTasks(tasks);
          tasks.forEach((task) => {
            if (task.type === 'delayed_claim' && task.status !== 'claimable' && task.status !== 'claimed') {
              sdk.startTask(task.id);
            }
          });
        },
        onTaskStatusChanged: (task) => {
          setServiceTasks((prev) =>
            prev.map((item) => (item.id === task.id ? { ...item, ...task } : item))
          );
        },
        onCountdownTick: (taskId, remainingSeconds) => {
          setServiceTasks((prev) =>
            prev.map((item) =>
              item.id === taskId
                ? {
                    ...item,
                    progress: { ...(item.progress || {}), remainingSeconds },
                  }
                : item
            )
          );
        },
        onError: (error) => {
          console.warn('Task SDK error', error);
        },
      },
    });

    sdkRef.current = sdk;

    sdk.fetchTasks();

    return () => {
      sdkRef.current = null;
      sdk.destroy();
    };
  }, []);

  const completeOrderTask = () => {
    if (orderComplete) {
      return;
    }
    setOrderComplete(true);
    awardPoints(ORDER_POINTS);
  };

  const claimBubble = () => {
    if (pendingPoints <= 0) {
      return;
    }
    setTotalPoints((prev) => prev + pendingPoints);
    setPendingPoints(0);
  };

  const spinWheel = () => {
    if (spinChances <= 0) {
      return;
    }
    const index = Math.floor(Math.random() * PRIZES.length);
    const prize = PRIZES[index];
    setSpinChances((prev) => prev - 1);
    setPendingPoints((prev) => prev + prize.points);
    setLastPrize(prize);

    const slice = 360 / PRIZES.length;
    const rotation = 720 + index * slice + slice / 2;
    spinDegree.current += rotation;
    Animated.timing(spinValue, {
      toValue: spinDegree.current,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  };

  const spinStyle = {
    transform: [
      {
        rotate: spinValue.interpolate({
          inputRange: [0, 360],
          outputRange: ['0deg', '360deg'],
          extrapolate: 'extend',
        }),
      },
    ],
  };

  const browseMeta = browseTask.completed
    ? 'Completed'
    : browseTask.countdown > 0
      ? `Browsing... ${browseTask.countdown}s`
      : `Reward ${BROWSE_POINTS} pts + 1 spin`;
  const browseActionLabel = browseTask.countdown > 0
    ? 'In Progress'
    : browseTask.completed
      ? 'Done'
      : 'Start Browse';

  const scrollToNode = (ref) => {
    if (!ref.current || typeof ref.current.scrollIntoView !== 'function') {
      return;
    }
    ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleServiceAction = (task) => {
    if (!sdkRef.current) {
      return;
    }
    if (task.status === 'claimable' || task.status === 'completed') {
      sdkRef.current.claimReward(task.id);
      return;
    }
    if (task.type === 'browse_jump_countdown') {
      if (task.config && task.config.jumpUrl && typeof window !== 'undefined') {
        window.open(task.config.jumpUrl, '_blank', 'noopener,noreferrer');
      }
      sdkRef.current.startTask(task.id);
      return;
    }
    if (task.type === 'bubble_scroll_countdown') {
      scrollToNode(scrollAreaRef);
      return;
    }
    if (task.type === 'diversion_order') {
      sdkRef.current.completeTask(task.id);
      return;
    }
    if (task.type === 'delayed_claim') {
      sdkRef.current.startTask(task.id);
    }
  };

  const handleScrollTrigger = (event) => {
    const offsetY = event.nativeEvent?.contentOffset?.y || 0;
    if (offsetY < 20 || !sdkRef.current) {
      return;
    }
    serviceTasks
      .filter((task) => task.type === 'bubble_scroll_countdown')
      .forEach((task) => {
        if (bubbleTriggeredRef.current.has(task.id)) {
          return;
        }
        bubbleTriggeredRef.current.add(task.id);
        sdkRef.current.startTask(task.id);
      });
  };


  return (
    <View style={styles.app}>
      <View style={styles.header}>
        <Text style={styles.title}>任务中心</Text>
        <Text style={styles.subtitle}>完成任务领取积分，转盘抽奖赢奖励。</Text>
      </View>

      <View style={styles.dashboard}>
        <StatCard label="Total Points" value={totalPoints} testID="total-points" />
        <StatCard label="Pending" value={pendingPoints} testID="pending-points" />
        <StatCard label="Spin Chances" value={spinChances} testID="spin-chances" />
        {pendingPoints > 0 ? (
          <PointsBubble value={pendingPoints} onClaim={claimBubble} style={bubbleStyle} />
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>任务列表</Text>
        <TaskCard
          title="浏览倒计时任务"
          meta={browseMeta}
          actionLabel={browseActionLabel}
          onAction={browseTask.start}
          disabled={browseTask.completed || browseTask.countdown > 0}
        />
        <TaskCard
          title="下单任务"
          meta={`奖励 ${ORDER_POINTS} 积分 + 1 次抽奖`}
          actionLabel={orderComplete ? '已完成' : '模拟下单'}
          onAction={completeOrderTask}
          disabled={orderComplete}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>大奖转盘</Text>
        <PrizeWheel
          prizes={PRIZES}
          spinStyle={spinStyle}
          onSpin={spinWheel}
          disabled={spinChances <= 0}
          lastPrize={lastPrize}
        />
      </View>

      <View ref={sdkSectionRef} style={styles.section}>
        <Text style={styles.sectionTitle}>SDK 任务</Text>
        {serviceTasks.length === 0 ? (
          <Text style={styles.taskMeta}>请先配置接口地址以加载任务。</Text>
        ) : (
          serviceTasks.map((task) => {
            const remaining = task.progress?.remainingSeconds;
            const isCounting =
              task.type === 'delayed_claim' &&
              task.status === 'in_progress' &&
              typeof remaining === 'number';
            const formattedRemaining = isCounting
              ? new Date(remaining * 1000).toISOString().slice(11, 19)
              : '';
            const actionLabel =
              task.type === 'diversion_order'
                ? '模拟下单'
                : task.type === 'delayed_claim'
                  ? task.status === 'claimable'
                    ? '领取奖励'
                    : '开始倒计时'
                  : task.status === 'completed' || task.status === 'claimable'
                    ? '领取奖励'
                    : '开始任务';
            const disabled =
              task.status === 'claimed' || task.status === 'in_progress';
            const actionContent = isCounting ? (
              <Text style={styles.actionCountdown}>{formattedRemaining}</Text>
            ) : null;
            return (
              <TaskCard
                key={task.id}
                title={task.title || task.type}
                meta={`状态：${task.status}`}
                actionLabel={actionLabel}
                actionContent={actionContent}
                onAction={() => handleServiceAction(task)}
                disabled={disabled}
              />
            );
          })
        )}
        <View style={styles.scrollHint}>
          <Text style={styles.taskMeta}>向下滑动触发浏览任务。</Text>
          <ScrollView
            ref={scrollAreaRef}
            style={styles.scrollBox}
            contentContainerStyle={styles.scrollContent}
            onScroll={handleScrollTrigger}
            scrollEventThrottle={16}
          >
            <Text style={styles.scrollText}>继续下滑…</Text>
            <Text style={styles.scrollText}>继续下滑…</Text>
            <Text style={styles.scrollText}>继续下滑…</Text>
            <Text style={styles.scrollText}>继续下滑…</Text>
            <Text style={styles.scrollText}>继续下滑…</Text>
            <Text style={styles.scrollText}>继续下滑…</Text>
          </ScrollView>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    minHeight: '100vh',
    padding: 24,
    backgroundColor: '#0b0f1c',
    backgroundImage:
      'radial-gradient(circle at top, rgba(79, 92, 255, 0.25), transparent 55%), radial-gradient(circle at 20% 20%, rgba(246, 211, 101, 0.18), transparent 45%)',
    color: '#f5f7ff',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#f5f7ff',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#b4b9d4',
  },
  dashboard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    padding: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(20, 24, 40, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(99, 109, 148, 0.3)',
    marginBottom: 24,
    position: 'relative',
  },
  section: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(20, 24, 40, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(99, 109, 148, 0.25)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f5f7ff',
    marginBottom: 12,
  },
  taskMeta: {
    marginTop: 6,
    fontSize: 12,
    color: '#b4b9d4',
  },
  serviceCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(30, 36, 58, 0.9)',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 109, 148, 0.35)',
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f5f7ff',
  },
  scrollHint: {
    marginTop: 12,
    gap: 8,
  },
  scrollBox: {
    maxHeight: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 109, 148, 0.35)',
  },
  scrollContent: {
    padding: 12,
    gap: 10,
  },
  scrollText: {
    color: '#c2c7e3',
    fontSize: 12,
  },
  actionCountdown: {
    color: '#f7f8ff',
    fontWeight: '700',
  },
});
