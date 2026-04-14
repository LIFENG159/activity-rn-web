import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

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
        onTasksUpdated: (tasks) => setServiceTasks(tasks),
        onError: (error) => {
          console.warn('Task SDK error', error);
        },
      },
    });

    sdk.fetchTasks();

    return () => {
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


  return (
    <View style={styles.app}>
      <View style={styles.header}>
        <Text style={styles.title}>Mission Arena</Text>
        <Text style={styles.subtitle}>Complete tasks, claim points, and spin for rewards.</Text>
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
        <Text style={styles.sectionTitle}>Task Board</Text>
        <TaskCard
          title="Browse Countdown Task"
          meta={browseMeta}
          actionLabel={browseActionLabel}
          onAction={browseTask.start}
          disabled={browseTask.completed || browseTask.countdown > 0}
        />
        <TaskCard
          title="Order Task"
          meta={`Reward ${ORDER_POINTS} pts + 1 spin`}
          actionLabel={orderComplete ? 'Done' : 'Simulate Order'}
          onAction={completeOrderTask}
          disabled={orderComplete}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Big Prize Wheel</Text>
        <PrizeWheel
          prizes={PRIZES}
          spinStyle={spinStyle}
          onSpin={spinWheel}
          disabled={spinChances <= 0}
          lastPrize={lastPrize}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SDK Tasks</Text>
        {serviceTasks.length === 0 ? (
          <Text style={styles.taskMeta}>Set REACT_APP_TASK_API_BASE to load tasks.</Text>
        ) : (
          serviceTasks.map((task) => (
            <View key={task.id} style={styles.serviceCard}>
              <Text style={styles.serviceTitle}>{task.title || task.type}</Text>
              <Text style={styles.taskMeta}>Status: {task.status}</Text>
            </View>
          ))
        )}
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
});
