import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  ActivityIndicator,
} from 'react-native';

interface Transaction {
  id: number;
  type: 'sent' | 'received';
  amount: number;
  from?: string;
  to?: string;
  date: string;
}

interface User {
  name: string;
  email: string;
  accountNumber: string;
}

const App = () => {
  const [currentView, setCurrentView] = useState('login');
  const [balance, setBalance] = useState(5000.0);
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 1,
      type: 'received',
      amount: 500,
      from: 'Juan Pérez',
      date: '2024-11-05',
    },
    {
      id: 2,
      type: 'sent',
      amount: 200,
      to: 'María García',
      date: '2024-11-04',
    },
  ]);
  const [user, setUser] = useState<User | null>(null);

  const renderView = () => {
    switch (currentView) {
      case 'login':
        return (
          <LoginView
            onLogin={(userData: User) => {
              setUser(userData);
              setCurrentView('home');
            }}
          />
        );
      case 'home':
        return (
          <HomeView
            balance={balance}
            transactions={transactions}
            user={user}
            onNavigate={setCurrentView}
            onLogout={() => {
              setUser(null);
              setCurrentView('login');
            }}
          />
        );
      case 'send':
        return (
          <SendMoneyView
            balance={balance}
            onSend={(amount: number, recipient: string) => {
              setBalance(balance - amount);
              setTransactions([
                {
                  id: transactions.length + 1,
                  type: 'sent',
                  amount,
                  to: recipient,
                  date: new Date().toISOString().split('T')[0],
                },
                ...transactions,
              ]);
              setCurrentView('home');
            }}
            onBack={() => setCurrentView('home')}
          />
        );
      case 'receive':
        return (
          <ReceiveMoneyView
            user={user}
            onBack={() => setCurrentView('home')}
          />
        );
      default:
        return <HomeView />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7c3aed" />
      {renderView()}
    </SafeAreaView>
  );
};

const LoginView = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'El formato del email es inválido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = () => {
    if (validateForm()) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        onLogin({
          name: 'Usuario Demo',
          email: email,
          accountNumber: '1234567890',
        });
      }, 1500);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.loginContainer}
      testID="login-view">
      <View style={styles.loginCard}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>W</Text>
          </View>
          <Text style={styles.title} testID="login-title">
            WalletPay
          </Text>
          <Text style={styles.subtitle}>Tu billetera virtual</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              testID="email-input"
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="tu@email.com"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && (
              <Text style={styles.errorText} testID="email-error">
                {errors.email}
              </Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              testID="password-input"
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="••••••"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {errors.password && (
              <Text style={styles.errorText} testID="password-error">
                {errors.password}
              </Text>
            )}
          </View>

          <TouchableOpacity
            testID="login-button"
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Ingresar</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>
            ¿Olvidaste tu contraseña?
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const HomeView = ({
  balance,
  transactions,
  user,
  onNavigate,
  onLogout,
}: {
  balance?: number;
  transactions?: Transaction[];
  user?: User | null;
  onNavigate?: (view: string) => void;
  onLogout?: () => void;
}) => {
  return (
    <ScrollView style={styles.homeContainer} testID="home-view">
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting} testID="user-greeting">
            Hola, {user?.name}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
        <TouchableOpacity
          onPress={onLogout}
          testID="logout-button"
          style={styles.logoutButton}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Saldo disponible</Text>
        <Text style={styles.balanceAmount} testID="balance-amount">
          ${balance?.toFixed(2)}
        </Text>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            testID="send-money-button"
            style={[styles.actionButton, styles.sendButton]}
            onPress={() => onNavigate?.('send')}>
            <Text style={styles.actionIcon}>↑</Text>
            <Text style={styles.actionButtonText}>Enviar dinero</Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="receive-money-button"
            style={[styles.actionButton, styles.receiveButton]}
            onPress={() => onNavigate?.('receive')}>
            <Text style={styles.actionIcon}>↓</Text>
            <Text style={styles.actionButtonText}>Recibir dinero</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.transactionsCard}>
        <Text style={styles.transactionsTitle}>Actividad reciente</Text>
        <View testID="transactions-list">
          {transactions?.map(transaction => (
            <View
              key={transaction.id}
              style={styles.transactionItem}
              testID={`transaction-${transaction.id}`}>
              <View style={styles.transactionLeft}>
                <View
                  style={[
                    styles.transactionIcon,
                    transaction.type === 'sent'
                      ? styles.sentIcon
                      : styles.receivedIcon,
                  ]}>
                  <Text
                    style={[
                      styles.transactionIconText,
                      transaction.type === 'sent'
                        ? styles.sentIconText
                        : styles.receivedIconText,
                    ]}>
                    {transaction.type === 'sent' ? '↑' : '↓'}
                  </Text>
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionName}>
                    {transaction.type === 'sent'
                      ? transaction.to
                      : transaction.from}
                  </Text>
                  <Text style={styles.transactionDate}>{transaction.date}</Text>
                </View>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  transaction.type === 'sent'
                    ? styles.sentAmount
                    : styles.receivedAmount,
                ]}>
                {transaction.type === 'sent' ? '-' : '+'}$
                {transaction.amount.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const SendMoneyView = ({
  balance,
  onSend,
  onBack,
}: {
  balance: number;
  onSend: (amount: number, recipient: string) => void;
  onBack: () => void;
}) => {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{
    amount?: string;
    recipient?: string;
  }>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const validateForm = () => {
    const newErrors: { amount?: string; recipient?: string } = {};
    const numAmount = parseFloat(amount);

    if (!amount) {
      newErrors.amount = 'El monto es requerido';
    } else if (isNaN(numAmount)) {
      newErrors.amount = 'El monto debe ser un número válido';
    } else if (numAmount <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0';
    } else if (numAmount > balance) {
      newErrors.amount = 'Saldo insuficiente';
    } else if (numAmount > 10000) {
      newErrors.amount = 'El monto máximo por transacción es $10,000';
    }

    if (!recipient) {
      newErrors.recipient = 'El destinatario es requerido';
    } else if (recipient.length < 3) {
      newErrors.recipient =
        'El nombre del destinatario debe tener al menos 3 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setShowConfirmation(true);
    }
  };

  const confirmTransaction = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onSend(parseFloat(amount), recipient);
    }, 1500);
  };

  return (
    <ScrollView style={styles.sendContainer} testID="send-money-view">
      <TouchableOpacity
        onPress={onBack}
        testID="back-button"
        style={styles.backButton}>
        <Text style={styles.backButtonText}>← Volver</Text>
      </TouchableOpacity>

      <View style={styles.sendCard}>
        <Text style={styles.sendTitle}>Enviar dinero</Text>
        <Text style={styles.sendBalance}>
          Saldo disponible: <Text style={styles.bold}>${balance.toFixed(2)}</Text>
        </Text>

        <View style={styles.form} testID="send-money-form">
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Destinatario</Text>
            <TextInput
              testID="recipient-input"
              style={[styles.input, errors.recipient && styles.inputError]}
              placeholder="Nombre del destinatario"
              placeholderTextColor="#9ca3af"
              value={recipient}
              onChangeText={setRecipient}
            />
            {errors.recipient && (
              <Text style={styles.errorText} testID="recipient-error">
                {errors.recipient}
              </Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Monto</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                testID="amount-input"
                style={[
                  styles.input,
                  styles.amountInput,
                  errors.amount && styles.inputError,
                ]}
                placeholder="0.00"
                placeholderTextColor="#9ca3af"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
            </View>
            {errors.amount && (
              <Text style={styles.errorText} testID="amount-error">
                {errors.amount}
              </Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción (opcional)</Text>
            <TextInput
              testID="description-input"
              style={styles.input}
              placeholder="¿Para qué es este pago?"
              placeholderTextColor="#9ca3af"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <TouchableOpacity
            testID="continue-button"
            style={styles.button}
            onPress={handleSubmit}>
            <Text style={styles.buttonText}>Continuar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showConfirmation}
        transparent
        animationType="fade"
        testID="confirmation-modal">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <Text style={styles.modalIconText}>⚠️</Text>
            </View>
            <Text style={styles.modalTitle}>Confirmar transacción</Text>

            <View style={styles.confirmationDetails} testID="confirmation-details">
              <View style={styles.confirmationRow}>
                <Text style={styles.confirmationLabel}>Destinatario:</Text>
                <Text style={styles.confirmationValue}>{recipient}</Text>
              </View>
              <View style={styles.confirmationRow}>
                <Text style={styles.confirmationLabel}>Monto:</Text>
                <Text style={styles.confirmationAmount}>
                  ${parseFloat(amount).toFixed(2)}
                </Text>
              </View>
              {description && (
                <View style={styles.confirmationRow}>
                  <Text style={styles.confirmationLabel}>Descripción:</Text>
                  <Text style={styles.confirmationValue}>{description}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              testID="confirm-button"
              style={[styles.button, isProcessing && styles.buttonDisabled]}
              onPress={confirmTransaction}
              disabled={isProcessing}>
              {isProcessing ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Confirmar envío</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              testID="cancel-button"
              style={[styles.cancelButton, isProcessing && styles.buttonDisabled]}
              onPress={() => setShowConfirmation(false)}
              disabled={isProcessing}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const ReceiveMoneyView = ({
  user,
  onBack,
}: {
  user?: User | null;
  onBack: () => void;
}) => {
  const [requestAmount, setRequestAmount] = useState('');
  const [showQR, setShowQR] = useState(false);

  const generateQR = () => {
    if (!requestAmount || parseFloat(requestAmount) > 0) {
      setShowQR(true);
    }
  };

  return (
    <ScrollView style={styles.receiveContainer} testID="receive-money-view">
      <TouchableOpacity
        onPress={onBack}
        testID="back-button-receive"
        style={styles.backButton}>
        <Text style={styles.backButtonText}>← Volver</Text>
      </TouchableOpacity>

      <View style={styles.receiveCard}>
        <Text style={styles.receiveTitle}>Recibir dinero</Text>
        <Text style={styles.receiveSubtitle}>
          Genera un código QR para que te paguen
        </Text>

        {!showQR ? (
          <View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Monto a solicitar (opcional)</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  testID="request-amount-input"
                  style={[styles.input, styles.amountInput]}
                  placeholder="0.00"
                  placeholderTextColor="#9ca3af"
                  value={requestAmount}
                  onChangeText={setRequestAmount}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <TouchableOpacity
              testID="generate-qr-button"
              style={[styles.button, styles.receiveButton]}
              onPress={generateQR}>
              <Text style={styles.buttonText}>Generar código QR</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.qrContainer}>
            <View style={styles.qrCodeWrapper}>
              <View style={styles.qrCode} testID="qr-code">
                <Text style={styles.qrCodeText}>QR</Text>
              </View>
            </View>

            <View style={styles.qrInfo}>
              <Text style={styles.qrLabel}>Cuenta:</Text>
              <Text style={styles.qrValue} testID="account-number">
                {user?.accountNumber}
              </Text>
              {requestAmount && parseFloat(requestAmount) > 0 && (
                <>
                  <Text style={[styles.qrLabel, styles.marginTop]}>
                    Monto solicitado:
                  </Text>
                  <Text style={styles.qrAmount} testID="requested-amount">
                    ${parseFloat(requestAmount).toFixed(2)}
                  </Text>
                </>
              )}
            </View>

            <TouchableOpacity
              testID="new-qr-button"
              style={styles.cancelButton}
              onPress={() => {
                setShowQR(false);
                setRequestAmount('');
              }}>
              <Text style={styles.cancelButtonText}>Generar nuevo código</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7c3aed',
  },
  loginContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  loginCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  form: {
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 5,
  },
  button: {
    backgroundColor: '#7c3aed',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPassword: {
    marginTop: 20,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#7c3aed',
    fontSize: 14,
  },
  homeContainer: {
    flex: 1,
    backgroundColor: '#7c3aed',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userEmail: {
    fontSize: 14,
    color: '#e0e7ff',
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  balanceCard: {
    backgroundColor: '#ffffff',
    margin: 20,
    marginTop: 0,
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 25,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  sendButton: {
    backgroundColor: '#7c3aed',
  },
  receiveButton: {
    backgroundColor: '#10b981',
  },
  actionIcon: {
    fontSize: 28,
    color: '#ffffff',
    marginBottom: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  transactionsCard: {
    backgroundColor: '#ffffff',
    margin: 20,
    marginTop: 0,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  transactionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sentIcon: {
    backgroundColor: '#fee2e2',
  },
  receivedIcon: {
    backgroundColor: '#d1fae5',
  },
  transactionIconText: {
    fontSize: 20,
  },
  sentIconText: {
    color: '#dc2626',
  },
  receivedIconText: {
    color: '#059669',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  transactionDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sentAmount: {
    color: '#dc2626',
  },
  receivedAmount: {
    color: '#059669',
  },
  sendContainer: {
    flex: 1,
    backgroundColor: '#7c3aed',
  },
  backButton: {
    padding: 20,
    paddingBottom: 10,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  sendCard: {
    backgroundColor: '#ffffff',
    margin: 20,
    marginTop: 0,
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  sendTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  sendBalance: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 25,
  },
  bold: {
    fontWeight: 'bold',
  },
  amountInputContainer: {
    position: 'relative',
  },
  currencySymbol: {
    position: 'absolute',
    left: 12,
    top: 12,
    fontSize: 20,
    color: '#6b7280',
    zIndex: 1,
  },
  amountInput: {
    paddingLeft: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 400,
  },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 15,
  },
  modalIconText: {
    fontSize: 32,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 25,
  },
  confirmationDetails: {
    marginBottom: 25,
  },
  confirmationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  confirmationLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  confirmationValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  confirmationAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7c3aed',
  },
  cancelButton: {
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: 'bold',
  },
  receiveContainer: {
    flex: 1,
    backgroundColor: '#7c3aed',
  },
  receiveCard: {
    backgroundColor: '#ffffff',
    margin: 20,
    marginTop: 0,
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  receiveTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  receiveSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 25,
  },
  qrContainer: {
    alignItems: 'center',
  },
  qrCodeWrapper: {
    backgroundColor: '#f3f4f6',
    padding: 30,
    borderRadius: 20,
    marginBottom: 25,
  },
  qrCode: {
    width: 200,
    height: 200,
    backgroundColor: '#7c3aed',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrCodeText: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: 'bold',
  },
  qrInfo: {
    width: '100%',
    marginBottom: 25,
  },
  qrLabel: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 5,
  },
  qrValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  marginTop: {
    marginTop: 15,
  },
  qrAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10b981',
    textAlign: 'center',
  },
});

export default App;
