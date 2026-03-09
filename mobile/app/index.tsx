import { useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  SafeAreaView,
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import { useFeedback } from '@/hooks/useFeedback';

// Dev: local Vite server. Prod: stable Vercel deploy.
const BBB_URL = __DEV__
  ? 'http://localhost:5173'
  : (process.env.EXPO_PUBLIC_BBB_URL ?? 'https://boopbeatboard.vercel.app');

// Injected JS: intercepts pad hits and posts them to native.
// Listens for custom 'bbb:pad_hit' events first, then falls back
// to touchstart on .pad / [data-pad] / .beat-pad elements.
// MutationObserver re-binds on dynamic renders.
const BRIDGE_SCRIPT = `
(function() {
  document.addEventListener('bbb:pad_hit', function(e) {
    window.ReactNativeWebView.postMessage(
      JSON.stringify({ type: 'pad_hit', padIndex: e.detail?.padIndex ?? -1, velocity: e.detail?.velocity ?? 1 })
    );
  });

  function bindPads() {
    document.querySelectorAll('.pad:not([data-native-bound]), [data-pad]:not([data-native-bound]), .beat-pad:not([data-native-bound])').forEach(function(pad, i) {
      pad.setAttribute('data-native-bound', '1');
      pad.addEventListener('touchstart', function() {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({ type: 'pad_hit', padIndex: i, velocity: 1 })
        );
      }, { passive: true });
    });
  }

  bindPads();
  new MutationObserver(bindPads).observe(document.body, { childList: true, subtree: true });
  true;
})();
`;

export default function BeatBoardScreen() {
  const webViewRef = useRef<WebView>(null);
  const { showFeedback, FeedbackModal } = useFeedback();

  const handleMessage = async (event: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'pad_hit') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    } catch {
      // Non-JSON messages from WebView — ignore
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: BBB_URL }}
        style={styles.webview}
        injectedJavaScript={BRIDGE_SCRIPT}
        onMessage={handleMessage}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        allowsBackForwardNavigationGestures={false}
        bounces={false}
        overScrollMode="never"
      />
      <TouchableOpacity style={styles.feedbackBtn} onPress={showFeedback}>
        <Text style={styles.feedbackText}>?</Text>
      </TouchableOpacity>
      <FeedbackModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  webview:   { flex: 1, backgroundColor: '#0a0a0f' },
  feedbackBtn: {
    position: 'absolute', bottom: 32, right: 20,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  feedbackText: { color: 'rgba(255,255,255,0.5)', fontSize: 18, fontWeight: '300' },
});
