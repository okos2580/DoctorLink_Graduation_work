import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList } from '../../types';

type AboutScreenNavigationProp = StackNavigationProp<RootStackParamList, 'About'>;

interface Props {
  navigation: AboutScreenNavigationProp;
}

const AboutScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          DoctorLink 소개
        </Text>
        <Text variant="bodyMedium" style={styles.description}>
          DoctorLink는 편리한 의료 예약 서비스입니다.
        </Text>
        <Text variant="bodyMedium" style={styles.version}>
          버전 1.0.0
        </Text>
        
        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={() => navigation.goBack()}
            style={styles.button}
          >
            뒤로가기
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#1D1B20',
  },
  description: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#8E8E93',
  },
  version: {
    textAlign: 'center',
    marginBottom: 32,
    color: '#49454F',
  },
  actions: {
    width: '100%',
    maxWidth: 300,
  },
  button: {
    marginBottom: 12,
    borderRadius: 8,
  },
});

export default AboutScreen; 