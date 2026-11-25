import { Tabs } from 'expo-router';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { MessageSquareText, Clock, Star, Settings } from 'lucide-react-native';

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

function TabIcon({ children, focused }: { children: React.ReactNode; focused: boolean }) {
  return <View style={styles.iconWrap}>{children}</View>;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3E8E75',
        tabBarInactiveTintColor: '#78877F',
        tabBarLabelStyle: {
          fontFamily: 'NotoSansSC-Medium',
          fontSize: 11,
        },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E7EEE9',
          height: Platform.OS === 'ios' ? 84 : 60,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '翻译',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <MessageSquareText size={24} color={color} strokeWidth={2} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: '历史',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <Clock size={24} color={color} strokeWidth={2} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: '收藏',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <Star size={24} color={color} strokeWidth={2} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '设置',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <Settings size={24} color={color} strokeWidth={2} />
            </TabIcon>
          ),
        }}
      />
    </Tabs>
  );
}
