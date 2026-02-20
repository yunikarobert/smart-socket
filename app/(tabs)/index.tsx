import { View, Text, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import FancyToggle from '../components/FancyToggle';
import ScheduleList from '../components/ScheduleList';
import TimerControl from '../components/TimerControl';

export default function HomeScreen() {
  const [isOn, setIsOn] = useState(false);

  const ESP_IP = "192.168.1.182"; // CHANGE THIS

  const getCurrentState = async () => {
    try {
      const resp = await fetch(`http://${ESP_IP}/status`);
      const txt = await resp.text();
      const state = txt.includes('1') || txt.toLowerCase().includes('on');
      setIsOn(state);
    } catch (e) {
      console.log('getCurrentState error', e);
    }
  };

  const togglePower = async () => {
    try {
      const endpoint = isOn ? 'off' : 'on';
      await fetch(`http://${ESP_IP}/${endpoint}`);
      // refresh actual state after toggle
      setTimeout(() => getCurrentState(), 500);
    } catch (e) {
      console.log('togglePower error', e);
    }
  };

  useEffect(() => {
    getCurrentState();
    const iv = setInterval(getCurrentState, 5000);
    return () => clearInterval(iv);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.lamp}>{isOn ? '💡' : '🔦'}</Text>
      <Text style={styles.title}>Smart Socket</Text>
      <FancyToggle isOn={isOn} onToggle={togglePower} />
      <Text style={styles.status}>{isOn ? 'Socket is ON' : 'Socket is OFF'}</Text>

      {/* Schedule Section */}
      <View style={styles.scheduleBox}>
        <Text style={styles.scheduleTitle}>Schedule On/Off</Text>
        <ScheduleList />
      </View>

      {/* Timer */}
      <TimerControl espIp={ESP_IP} onComplete={getCurrentState} />

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>powered by WeMakIT Smart-socket 237</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center"
  },
  title: {
    color: "white",
    fontSize: 28,
    marginBottom: 40
  },
  lamp: {
    fontSize: 60,
    marginBottom: 16,
  },
  status: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  scheduleBox: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    alignItems: 'center',
  },
  scheduleTitle: {
    color: '#00ff99',
    fontSize: 20,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  scheduleText: {
    color: '#fff',
    fontSize: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 16,
    alignItems: 'center',
    width: '100%',
  },
  footerText: {
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
  },
});
