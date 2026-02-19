import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Modal, TouchableOpacity, ScrollView, TextInput } from 'react-native';

interface ScheduleItem {
  id: string;
  time: string;
  action: 'on' | 'off';
}

export default function ScheduleList() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHour, setSelectedHour] = useState('07');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedAction, setSelectedAction] = useState<'on' | 'off'>('on');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [dateModal, setDateModal] = useState(false);

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const addSchedule = () => {
    const newSchedule: ScheduleItem = {
      id: Date.now().toString(),
      time: `${selectedDate} ${selectedHour}:${selectedMinute}`,
      action: selectedAction,
    };
    setSchedules([...schedules, newSchedule]);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={schedules}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.time}>{item.time}</Text>
            <Text style={styles.action}>{item.action.toUpperCase()}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No schedules yet</Text>}
      />
      <Pressable style={styles.addBtn} onPress={() => setModalVisible(true)}>
        <Text style={styles.addText}>+ Add Schedule</Text>
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Schedule</Text>
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
                  {minutes.filter((_, i) => i % 5 === 0).map(m => (
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
              <Pressable style={styles.modalBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalBtn} onPress={addSchedule}>
                <Text style={styles.modalBtnText}>Add</Text>
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 16,
    width: 110,
    borderWidth: 1,
    borderColor: '#00ff99',
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
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
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
