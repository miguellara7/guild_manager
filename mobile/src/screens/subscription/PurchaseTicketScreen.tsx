import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { apiService } from '../../services/api';
import { authService } from '../../services/auth';
import { User } from '../../types';

interface PurchaseOption {
  id: string;
  title: string;
  description: string;
  price: number;
  features: string[];
  recommended?: boolean;
}

const PurchaseTicketScreen: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('basic');
  const [additionalWorlds, setAdditionalWorlds] = useState<string>('0');
  const [transferCharacter, setTransferCharacter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const purchaseOptions: PurchaseOption[] = [
    {
      id: 'basic',
      title: 'Basic Plan',
      description: 'Monitor 1 world with full features',
      price: 200,
      features: [
        'Real-time online monitoring',
        'Death tracking & alerts',
        'Enemy guild monitoring',
        'Multi-guild support per world',
        'Mobile & web access'
      ],
    },
    {
      id: 'extended',
      title: 'Extended Plan',
      description: 'Monitor multiple worlds',
      price: 200,
      features: [
        'All Basic Plan features',
        'Multiple world monitoring',
        '+200 TC per additional world',
        'Priority support',
        'Advanced analytics'
      ],
      recommended: true,
    },
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await authService.getUser();
      setUser(userData);
      if (userData?.characterName) {
        setTransferCharacter(userData.characterName);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const calculateTotalPrice = () => {
    const selectedPlan = purchaseOptions.find(p => p.id === selectedOption);
    const basePlan = selectedPlan?.price || 200;
    const additionalWorldsCount = parseInt(additionalWorlds) || 0;
    return basePlan + (additionalWorldsCount * 200);
  };

  const handleCreateTicket = async () => {
    if (!transferCharacter.trim()) {
      Alert.alert('Error', 'Please enter your character name');
      return;
    }

    const totalPrice = calculateTotalPrice();
    
    Alert.alert(
      'Create Purchase Ticket',
      `This will create a purchase ticket for ${totalPrice} Tibia Coins. You will be redirected to our website to complete the purchase process.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            const purchaseData = {
              plan: selectedOption.toUpperCase(),
              amount: totalPrice,
              additionalWorlds: parseInt(additionalWorlds) || 0,
              fromCharacter: transferCharacter.trim(),
            };
            
            // Create URL with purchase data
            const params = new URLSearchParams({
              plan: purchaseData.plan,
              amount: purchaseData.amount.toString(),
              additionalWorlds: purchaseData.additionalWorlds.toString(),
              fromCharacter: purchaseData.fromCharacter,
              mobile: 'true'
            });
            
            const url = `http://74.208.149.168:3000/purchase?${params}`;
            Linking.openURL(url);
          },
        },
      ]
    );
  };

  const PurchaseOptionCard: React.FC<{ option: PurchaseOption }> = ({ option }) => (
    <TouchableOpacity
      style={[
        styles.optionCard,
        selectedOption === option.id && styles.optionCardSelected,
        option.recommended && styles.optionCardRecommended,
      ]}
      onPress={() => setSelectedOption(option.id)}
    >
      {option.recommended && (
        <View style={styles.recommendedBadge}>
          <Text style={styles.recommendedText}>RECOMMENDED</Text>
        </View>
      )}
      
      <View style={styles.optionHeader}>
        <Text style={styles.optionTitle}>{option.title}</Text>
        <Text style={styles.optionPrice}>{option.price} TC</Text>
      </View>
      
      <Text style={styles.optionDescription}>{option.description}</Text>
      
      <View style={styles.optionFeatures}>
        {option.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={16} color="#00cc66" />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.optionFooter}>
        <View style={[
          styles.radioButton,
          selectedOption === option.id && styles.radioButtonSelected
        ]}>
          {selectedOption === option.id && (
            <View style={styles.radioButtonInner} />
          )}
        </View>
        <Text style={styles.selectText}>
          {selectedOption === option.id ? 'Selected' : 'Select Plan'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Purchase Subscription</Text>
        <Text style={styles.subtitle}>Choose your monitoring plan</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.paymentInfo}>
          <View style={styles.paymentHeader}>
            <Ionicons name="card" size={24} color="#0066cc" />
            <Text style={styles.paymentTitle}>Payment Information</Text>
          </View>
          <Text style={styles.paymentText}>
            Send Tibia Coins to: <Text style={styles.paymentCharacter}>Guild Manacoins</Text>
          </Text>
          <Text style={styles.paymentSubtext}>
            After creating your ticket, send the exact amount and we'll verify your payment manually
          </Text>
        </View>

        <View style={styles.plansSection}>
          <Text style={styles.sectionTitle}>Select Plan</Text>
          {purchaseOptions.map((option) => (
            <PurchaseOptionCard key={option.id} option={option} />
          ))}
        </View>

        {selectedOption === 'extended' && (
          <View style={styles.additionalWorldsSection}>
            <Text style={styles.sectionTitle}>Additional Worlds</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="globe-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Number of additional worlds (0-10)"
                value={additionalWorlds}
                onChangeText={setAdditionalWorlds}
                keyboardType="numeric"
                maxLength={2}
              />
            </View>
            <Text style={styles.inputHelp}>
              Each additional world costs 200 TC extra
            </Text>
          </View>
        )}

        <View style={styles.characterSection}>
          <Text style={styles.sectionTitle}>Transfer Character</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Character name sending the coins"
              value={transferCharacter}
              onChangeText={setTransferCharacter}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>
          <Text style={styles.inputHelp}>
            Enter the character name that will send the Tibia Coins
          </Text>
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Plan:</Text>
              <Text style={styles.summaryValue}>
                {purchaseOptions.find(p => p.id === selectedOption)?.title}
              </Text>
            </View>
            
            {selectedOption === 'extended' && parseInt(additionalWorlds) > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Additional Worlds:</Text>
                <Text style={styles.summaryValue}>
                  {additionalWorlds} × 200 TC = {parseInt(additionalWorlds) * 200} TC
                </Text>
              </View>
            )}
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Transfer to:</Text>
              <Text style={styles.summaryValue}>Guild Manacoins</Text>
            </View>
            
            <View style={styles.summaryDivider} />
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotal}>Total:</Text>
              <Text style={styles.summaryTotalValue}>{calculateTotalPrice()} TC</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.createTicketButton, isLoading && styles.createTicketButtonDisabled]}
          onPress={handleCreateTicket}
          disabled={isLoading}
        >
          <Ionicons name="ticket-outline" size={20} color="white" />
          <Text style={styles.createTicketButtonText}>Create Purchase Ticket</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            After creating the ticket, you'll be redirected to our website to complete the purchase process
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
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  paymentInfo: {
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#0066cc',
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
    marginBottom: 4,
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
  plansSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  optionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  optionCardSelected: {
    borderColor: '#0066cc',
    backgroundColor: '#f8fbff',
  },
  optionCardRecommended: {
    borderColor: '#00cc66',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -1,
    right: 16,
    backgroundColor: '#00cc66',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 8,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  optionPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  optionFeatures: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  optionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioButtonSelected: {
    borderColor: '#0066cc',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0066cc',
  },
  selectText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  additionalWorldsSection: {
    marginBottom: 20,
  },
  characterSection: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#333',
  },
  inputHelp: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  summarySection: {
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  summaryTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  createTicketButton: {
    backgroundColor: '#0066cc',
    borderRadius: 12,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#0066cc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createTicketButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  createTicketButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default PurchaseTicketScreen;
