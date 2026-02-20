import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Modal, TouchableOpacity, ScrollView, TextInput } from 'react-native';

interface ScheduleItem {
  id: string;
  time: string; // format: YYYY-MM-DD HH:MM
  action: 'on' | 'off';
}

interface ScheduleListProps {
  espIp: string;
  onComplete?: () => void;
}

export default function ScheduleList({ espIp, onComplete }: ScheduleListProps) {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHour, setSelectedHour] = useState('07');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedAction, setSelectedAction] = useState<'on' | 'off'>('on');
  const [minuteStep, setMinuteStep] = useState<number>(5);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [dateModal, setDateModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  // manage scheduled timeouts while the app is running
  const timeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout> | null>>({});

  const scheduleTimeoutFor = (s: ScheduleItem) => {
    try {
      // convert "YYYY-MM-DD HH:MM" to ISO-like string
      const iso = s.time.replace(' ', 'T') + ':00';
      const target = new Date(iso);
      const delta = target.getTime() - Date.now();
      if (delta <= 0) return; // past time, skip scheduling
      if (timeoutsRef.current[s.id]) {
        clearTimeout(timeoutsRef.current[s.id] as ReturnType<typeof setTimeout>);
      }
      timeoutsRef.current[s.id] = setTimeout(async () => {
        try {
          await fetch(`http://${espIp}/${s.action}`);
          if (onComplete) onComplete();
        } catch (e) {
          console.log('Scheduled action failed', e);
        } finally {
          // clear reference
          timeoutsRef.current[s.id] = null;
        }
      }, delta);
    } catch (e) {
      console.log('scheduleTimeoutFor error', e);
    }
  };

  useEffect(() => {
    // when schedules change, schedule new ones
    schedules.forEach(s => scheduleTimeoutFor(s));
    return () => {
      // clear all timeouts on unmount
      Object.values(timeoutsRef.current).forEach(t => { if (t) clearTimeout(t as ReturnType<typeof setTimeout>); });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedules]);

  const saveSchedule = () => {
    if (editingId) {
      // Update existing schedule
      setSchedules(schedules.map(s => 
        s.id === editingId 
          ? { ...s, time: `${selectedDate} ${selectedHour}:${selectedMinute}`, action: selectedAction }
          : s
      ));
      setEditingId(null);
    } else {
      // Add new schedule
      const newSchedule: ScheduleItem = {
        id: Date.now().toString(),
        time: `${selectedDate} ${selectedHour}:${selectedMinute}`,
        action: selectedAction,
      };
      setSchedules([...schedules, newSchedule]);
    }
    setModalVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedHour('07');
    setSelectedMinute('00');
    setSelectedAction('on');
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const openEditModal = (schedule: ScheduleItem) => {
    const [date, time] = schedule.time.split(' ');
    const [hour, minute] = time.split(':');
    setSelectedDate(date);
    setSelectedHour(hour);
    setSelectedMinute(minute);
    setSelectedAction(schedule.action);
    setEditingId(schedule.id);
    setModalVisible(true);
  };

  const deleteSchedule = (id: string) => {
    // clear scheduled timeout if present
    if (timeoutsRef.current && timeoutsRef.current[id]) {
      clearTimeout(timeoutsRef.current[id] as ReturnType<typeof setTimeout>);
      timeoutsRef.current[id] = null;
    }
    setSchedules(schedules.filter(s => s.id !== id));
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={schedules}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <View style={styles.item}>
              <Text style={styles.time}>{item.time}</Text>
              <Text style={styles.action}>{item.action.toUpperCase()}</Text>
            </View>
            <View style={styles.buttonRow}>
              <Pressable style={styles.editBtn} onPress={() => openEditModal(item)}>
                <Text style={styles.editBtnText}>✎ Edit</Text>
              </Pressable>
              <Pressable style={styles.deleteBtn} onPress={() => deleteSchedule(item.id)}>
                <Text style={styles.deleteBtnText}>✕ Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No schedules yet</Text>}
      />
      <Pressable style={styles.addBtn} onPress={() => { resetForm(); setModalVisible(true); }}>
        <Text style={styles.addText}>+ Add Schedule</Text>
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => { setModalVisible(false); setEditingId(null); }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit Schedule' : 'Set Schedule'}</Text>
            {/* Date Picker */}
            <View style={{ marginBottom: 16, alignItems: 'center' }}>
              <Text style={styles.pickerLabel}>Date</Text>
              <Pressable style={styles.dateInput} onPress={() => setDateModal(true)}>
                <Text style={{ color: '#fff', fontSize: 16 }}>{selectedDate}</Text>
              </Pressable>
              <Modal
                visible={dateModal}
                transparent
                animationType="fade"
                onRequestClose={() => setDateModal(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={[styles.modalContent, { width: 300 }]}> 
                    <Text style={styles.pickerLabel}>Enter Date (YYYY-MM-DD)</Text>
                    <TextInput
                      style={styles.dateInputBox}
                      value={selectedDate}
                      onChangeText={setSelectedDate}
                      placeholder="YYYY-MM-DD"
                      keyboardType="numeric"
                      maxLength={10}
                    />
                    <Pressable style={styles.modalBtn} onPress={() => setDateModal(false)}>
                      <Text style={styles.modalBtnText}>Done</Text>
                    </Pressable>
                  </View>
                </View>
              </Modal>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 16 }}>
              {/* Minute step selector */}
              <View style={{ alignItems: 'center', marginRight: 12 }}>
                <Text style={styles.pickerLabel}>Step</Text>
                <View style={{ flexDirection: 'row' }}>
                  {[1,5,10,15].map(s => (
                    <TouchableOpacity key={s} onPress={() => setMinuteStep(s)} style={[styles.stepBtn, minuteStep === s && styles.stepBtnSelected]}>
                      <Text style={[styles.stepBtnText, minuteStep === s && styles.stepBtnTextSelected]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Hour Picker */}
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.pickerLabel}>Hour</Text>
                <ScrollView style={styles.pickerScrollVertical} showsVerticalScrollIndicator={false}>
                  {hours.map(h => (
                    <TouchableOpacity key={h} onPress={() => setSelectedHour(h)}>
                      <Text style={[styles.pickerItem, selectedHour === h && styles.pickerSelected]}>{h}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              {/* Minute Picker */}
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.pickerLabel}>Minute</Text>
                <ScrollView style={styles.pickerScrollVertical} showsVerticalScrollIndicator={false}>
                  {minutes.filter((_, i) => i % minuteStep === 0).map(m => (
                    <TouchableOpacity key={m} onPress={() => setSelectedMinute(m)}>
                      <Text style={[styles.pickerItem, selectedMinute === m && styles.pickerSelected]}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 16 }}>
              <TouchableOpacity onPress={() => setSelectedAction('on')} style={[styles.actionBtn, selectedAction === 'on' && styles.actionBtnSelected]}>
                <Text style={[styles.actionBtnText, selectedAction === 'on' && styles.actionBtnTextSelected]}>ON</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSelectedAction('off')} style={[styles.actionBtn, selectedAction === 'off' && styles.actionBtnSelected]}>
                <Text style={[styles.actionBtnText, selectedAction === 'off' && styles.actionBtnTextSelected]}>OFF</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Pressable style={styles.modalBtn} onPress={() => { setModalVisible(false); setEditingId(null); }}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalBtn} onPress={saveSchedule}>
                <Text style={styles.modalBtnText}>{editingId ? 'Update' : 'Add'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  pickerScrollVertical: {
    maxHeight: 120,
    width: 50,
    backgroundColor: '#222',
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#00ff99',
  },
  dateInputBox: {
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 16,
    width: 140,
    borderWidth: 1,
    borderColor: '#00ff99',
    marginBottom: 12,
    textAlign: 'center',
  },
  pickerScroll: {
    maxHeight: 100,
    width: 50,
    backgroundColor: '#222',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  dateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  dateInputLabel: {
    color: '#aaa',
    fontSize: 14,
    marginRight: 8,
  },
  dateInput: {
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: 6,
    paddingVertical: 4,
    fontSize: 16,
    width: 110,
    borderWidth: 1,
    borderColor: '#00ff99',
  },
  stepBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    marginHorizontal: 4,
    backgroundColor: '#f0f0f0',
  },
  stepBtnSelected: {
    backgroundColor: '#007AFF',
  },
  stepBtnText: {
    color: '#222',
    fontWeight: '500',
  },
  stepBtnTextSelected: {
    color: '#fff',
  },
  container: {
    width: '100%',
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#00ff99',
    fontSize: 20,
    marginBottom: 16,
    fontWeight: 'bold',
  },
  pickerLabel: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'center',
  },
  pickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 8,
  },
  pickerItem: {
    color: '#aaa',
    fontSize: 16,
    marginHorizontal: 4,
    marginVertical: 2,
    padding: 4,
    borderRadius: 4,
  },
  pickerSelected: {
    color: '#00ff99',
    backgroundColor: '#333',
    fontWeight: 'bold',
  },
  actionBtn: {
    backgroundColor: '#333',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
    marginHorizontal: 8,
  },
  actionBtnSelected: {
    backgroundColor: '#00ff99',
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  actionBtnTextSelected: {
    color: '#222',
  },
  modalBtn: {
    backgroundColor: '#00ff99',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
    marginHorizontal: 8,
    marginTop: 8,
  },
  modalBtnText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
  },
  itemContainer: {
    marginBottom: 12,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editBtn: {
    backgroundColor: '#00ff99',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flex: 1,
    marginRight: 6,
    alignItems: 'center',
  },
  editBtnText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 13,
  },
  deleteBtn: {
    backgroundColor: '#ff4444',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flex: 1,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  time: {
    color: '#fff',
    fontSize: 16,
  },
  action: {
    color: '#00ff99',
    fontWeight: 'bold',
    fontSize: 16,
  },
  empty: {
    color: '#888',
    textAlign: 'center',
    marginVertical: 16,
  },
  addBtn: {
    backgroundColor: '#00ff99',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  addText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
