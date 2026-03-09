import { useState, useCallback } from 'react';
import {
  Modal, View, Text, TextInput,
  TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform,
} from 'react-native';

const FEEDBACK_URL = process.env.EXPO_PUBLIC_FEEDBACK_URL ?? '';

type FeedbackState = 'idle' | 'open' | 'sending' | 'sent';

export function useFeedback() {
  const [state, setState] = useState<FeedbackState>('idle');
  const [note, setNote] = useState('');

  const showFeedback = useCallback(() => setState('open'), []);
  const closeFeedback = useCallback(() => { setState('idle'); setNote(''); }, []);

  const submitFeedback = useCallback(async () => {
    if (!note.trim()) return;
    setState('sending');
    try {
      if (FEEDBACK_URL) {
        await fetch(FEEDBACK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            app: 'boopbeatboard', version: '0.1.0',
            platform: Platform.OS, note: note.trim(),
            ts: new Date().toISOString(),
          }),
        });
      }
      setState('sent');
      setTimeout(closeFeedback, 1500);
    } catch {
      setState('sent'); // Fail silently
      setTimeout(closeFeedback, 1500);
    }
  }, [note, closeFeedback]);

  const FeedbackModal = () => (
    <Modal
      visible={state === 'open' || state === 'sending' || state === 'sent'}
      transparent animationType="fade"
      onRequestClose={closeFeedback}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.card}>
          {state === 'sent' ? (
            <Text style={styles.sentText}>✓ Got it — thanks</Text>
          ) : (
            <>
              <Text style={styles.title}>What's working? What's not?</Text>
              <TextInput
                style={styles.input} placeholder="Type anything..."
                placeholderTextColor="rgba(255,255,255,0.25)"
                multiline value={note} onChangeText={setNote}
                autoFocus maxLength={500}
              />
              <View style={styles.row}>
                <TouchableOpacity style={styles.cancelBtn} onPress={closeFeedback}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sendBtn, !note.trim() && styles.sendBtnDisabled]}
                  onPress={submitFeedback}
                  disabled={!note.trim() || state === 'sending'}
                >
                  <Text style={styles.sendText}>
                    {state === 'sending' ? 'Sending...' : 'Send'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  return { showFeedback, FeedbackModal };
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end', paddingBottom: 40, paddingHorizontal: 16 },
  card: { backgroundColor: '#12121a', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  title: { color: '#fff', fontSize: 16, fontWeight: '500', marginBottom: 12 },
  input: { color: '#fff', fontSize: 14, minHeight: 80, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', textAlignVertical: 'top', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10 },
  cancelText: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
  sendBtn: { backgroundColor: '#7c3aed', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
  sendBtnDisabled: { opacity: 0.4 },
  sendText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  sentText: { color: '#a78bfa', fontSize: 16, textAlign: 'center', paddingVertical: 8 },
});
