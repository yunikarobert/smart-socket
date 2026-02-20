import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';

interface TimerControlProps {
  espIp: string;
  onComplete?: () => void;
}

export default function TimerControl({ espIp, onComplete }: TimerControlProps) {
  const [minutes, setMinutes] = useState('10');
  const [action, setAction] = useState<'on' | 'off'>('off');
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(0); // seconds

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startTimer = () => {
    const mins = Math.max(0, Math.floor(Number(minutes) || 0));
    if (mins <= 0) return;
    const secs = mins * 60;
    setRemaining(secs);
    setRunning(true);

    // update remaining every second
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // schedule action
    timeoutRef.current = setTimeout(async () => {
      try {
        await fetch(`http://${espIp}/${action}`);
      } catch (e) {
        console.log('Timer action failed', e);
      } finally {
        setRunning(false);
        setRemaining(0);
        if (onComplete) onComplete();
      }
    }, secs * 1000);
  };

  const cancelTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setRemaining(0);
  };

  const format = (s: number) => {
    const mm = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Timer</Text>
      <View style={styles.row}>
        <TextInput
          value={minutes}
          onChangeText={setMinutes}
          keyboardType="numeric"
          style={styles.input}
          editable={!running}
        />
        <Text style={styles.inputLabel}>min</Text>
        <Pressable
          style={[styles.actionBtn, action === 'on' && styles.actionBtnSelected]}
          onPress={() => setAction('on')}
          disabled={running}
        >
          <Text style={[styles.actionText, action === 'on' && styles.actionTextSelected]}>ON</Text>
        </Pressable>
        <Pressable
          style={[styles.actionBtn, action === 'off' && styles.actionBtnSelected]}
          onPress={() => setAction('off')}
          disabled={running}
        >
          <Text style={[styles.actionText, action === 'off' && styles.actionTextSelected]}>OFF</Text>
        </Pressable>
      </View>

      {!running ? (
        <Pressable style={styles.startBtn} onPress={startTimer}>
          <Text style={styles.startText}>Start Timer</Text>
        </Pressable>
      ) : (
        <View style={styles.runningRow}>
          <Text style={styles.timerText}>Remaining: {format(remaining)}</Text>
          <Pressable style={styles.cancelBtn} onPress={cancelTimer}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    alignItems: 'center',
  },
  title: {
    color: '#00ff99',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    width: 80,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#00ff99',
  },
  inputLabel: {
    color: '#fff',
    marginLeft: 8,
    marginRight: 8,
  },
  actionBtn: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  actionBtnSelected: {
    backgroundColor: '#00ff99',
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  actionTextSelected: {
    color: '#222',
  },
  startBtn: {
    marginTop: 12,
    backgroundColor: '#00ff99',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  startText: {
    color: '#222',
    fontWeight: 'bold',
  },
  runningRow: {
    marginTop: 12,
    alignItems: 'center',
  },
  timerText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  cancelBtn: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
