import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { AuthStackParamList } from '../../types';

type WelcomeScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Welcome'>;

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  const handleRegister = async () => {
    Alert.alert(
      'Register New Account',
      'Registration is available on our website. You will be redirected to complete the registration process.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            Linking.openURL('http://74.208.149.168:3000/register');
          },
        },
      ]
    );
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const FeatureCard: React.FC<{
    icon: string;
    title: string;
    description: string;
    color: string;
  }> = ({ icon, title, description, color }) => (
    <View style={styles.featureCard}>
      <View style={[styles.featureIcon, { backgroundColor: color }]}>
        <Ionicons name={icon as any} size={24} color="white" />
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Ionicons name="shield-checkmark" size={80} color="#0066cc" />
          <Text style={styles.title}>Tibia Guild Manager</Text>
          <Text style={styles.subtitle}>
            The ultimate tool for guild monitoring and management
          </Text>
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Features</Text>
          
          <View style={styles.featuresGrid}>
            <FeatureCard
              icon="people"
              title="Real-time Monitoring"
              description="Track your guild members and enemies online 24/7"
              color="#0066cc"
            />
            <FeatureCard
              icon="skull"
              title="Death Tracking"
              description="Get instant notifications when players die"
              color="#cc0066"
            />
            <FeatureCard
              icon="shield"
              title="Enemy Alerts"
              description="Monitor enemy guilds and high-level threats"
              color="#ff6600"
            />
            <FeatureCard
              icon="analytics"
              title="Advanced Analytics"
              description="Detailed statistics and performance insights"
              color="#00cc66"
            />
          </View>
        </View>

        <View style={styles.pricingSection}>
          <Text style={styles.sectionTitle}>Simple Pricing</Text>
          
          <View style={styles.pricingCard}>
            <View style={styles.pricingHeader}>
              <Text style={styles.pricingTitle}>Guild Monitoring</Text>
              <Text style={styles.pricingPrice}>200 TC</Text>
              <Text style={styles.pricingPeriod}>per world/month</Text>
            </View>
            
            <View style={styles.pricingFeatures}>
              <View style={styles.pricingFeature}>
                <Ionicons name="checkmark-circle" size={16} color="#00cc66" />
                <Text style={styles.pricingFeatureText}>Real-time online monitoring</Text>
              </View>
              <View style={styles.pricingFeature}>
                <Ionicons name="checkmark-circle" size={16} color="#00cc66" />
                <Text style={styles.pricingFeatureText}>Death tracking & alerts</Text>
              </View>
              <View style={styles.pricingFeature}>
                <Ionicons name="checkmark-circle" size={16} color="#00cc66" />
                <Text style={styles.pricingFeatureText}>Enemy guild monitoring</Text>
              </View>
              <View style={styles.pricingFeature}>
                <Ionicons name="checkmark-circle" size={16} color="#00cc66" />
                <Text style={styles.pricingFeatureText}>Multi-guild support</Text>
              </View>
              <View style={styles.pricingFeature}>
                <Ionicons name="checkmark-circle" size={16} color="#00cc66" />
                <Text style={styles.pricingFeatureText}>Mobile & web access</Text>
              </View>
            </View>
            
            <Text style={styles.pricingNote}>
              Additional worlds: +200 TC each
            </Text>
          </View>
        </View>

        <View style={styles.paymentInfo}>
          <View style={styles.paymentHeader}>
            <Ionicons name="card" size={24} color="#0066cc" />
            <Text style={styles.paymentTitle}>Payment Information</Text>
          </View>
          <Text style={styles.paymentText}>
            Send Tibia Coins to: <Text style={styles.paymentCharacter}>Guild Manacoins</Text>
          </Text>
          <Text style={styles.paymentSubtext}>
            After payment, create a purchase ticket through our website for manual verification
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Ionicons name="person-add" size={20} color="white" />
            <Text style={styles.registerButtonText}>Create Account</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Ionicons name="log-in" size={20} color="#0066cc" />
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an account? Use your character name and guild password to login
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingVertical: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0066cc',
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  pricingSection: {
    marginBottom: 40,
  },
  pricingCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#0066cc',
  },
  pricingHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pricingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  pricingPrice: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  pricingPeriod: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  pricingFeatures: {
    marginBottom: 16,
  },
  pricingFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pricingFeatureText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  pricingNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  paymentInfo: {
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: '#0066cc',
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  paymentText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  paymentCharacter: {
    fontWeight: 'bold',
    color: '#0066cc',
  },
  paymentSubtext: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  actions: {
    gap: 12,
    marginBottom: 20,
  },
  registerButton: {
    backgroundColor: '#0066cc',
    borderRadius: 12,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0066cc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loginButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0066cc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    color: '#0066cc',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default WelcomeScreen;
