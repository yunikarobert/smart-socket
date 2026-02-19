import { View, Text, StyleSheet } from 'react-native';
import { useState } from 'react';
import FancyToggle from '../components/FancyToggle';
import ScheduleList from '../components/ScheduleList';

export default function HomeScreen() {
  const [isOn, setIsOn] = useState(false);

  const ESP_IP = "192.168.1.100"; // CHANGE THIS

  const togglePower = async () => {
    const endpoint = isOn ? "off" : "on";
    await fetch(`http://${ESP_IP}/${endpoint}`);
    setIsOn(!isOn);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smart Socket</Text>
      <FancyToggle isOn={isOn} onToggle={togglePower} />
      <Text style={styles.status}>{isOn ? 'Socket is ON' : 'Socket is OFF'}</Text>

      {/* Schedule Section */}
      <View style={styles.scheduleBox}>
        <Text style={styles.scheduleTitle}>Schedule On/Off</Text>
        <ScheduleList />
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
});
