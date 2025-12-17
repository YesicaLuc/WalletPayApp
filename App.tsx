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
  Platform,
} from 'react-native';

interface Transaction {
  id: number;
  type: 'sent' | 'received';
  amount: number;
  from?: string;
  to?: string;
  date: string;
  time: string;
  description?: string;
  status: 'completed' | 'pending' | 'failed';
}

interface User {
  name: string;
  email: string;
  accountNumber: string;
  alias: string;
  cvu: string;
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
      time: '14:30',
      description: 'Pago de almuerzo',
      status: 'completed',
    },
    {
      id: 2,
      type: 'sent',
      amount: 200,
      to: 'María García',
      date: '2024-11-04',
      time: '10:15',
      description: 'Regalo cumpleaños',
      status: 'completed',
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
            onSend={(amount: number, recipient: string, description: string) => {
              setBalance(balance - amount);
              setTransactions([
                {
                  id: transactions.length + 1,
                  type: 'sent',
                  amount,
                  to: recipient,
                  date: new Date().toISOString().split('T')[0],
                  time: new Date().toLocaleTimeString('es-AR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                  description,
                  status: 'completed',
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
          <ReceiveMoneyView user={user} onBack={() => setCurrentView('home')} />
        );
      case 'simulate-receive':
        return (
          <SimulateReceiveView
            onReceive={(amount: number, sender: string, description: string) => {
              setBalance(balance + amount);
              setTransactions([
                {
                  id: transactions.length + 1,
                  type: 'received',
                  amount,
                  from: sender,
                  date: new Date().toISOString().split('T')[0],
                  time: new Date().toLocaleTimeString('es-AR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                  description,
                  status: 'completed',
                },
                ...transactions,
              ]);
              setCurrentView('home');
            }}
            onBack={() => setCurrentView('home')}
          />
        );
      case 'profile':
        return (
          <ProfileView
            user={user}
            balance={balance}
            onBack={() => setCurrentView('home')}
          />
        );
      case 'transaction-detail':
        return (
          <TransactionDetailView
            transaction={transactions[0]}
            onBack={() => setCurrentView('home')}
          />
        );
      default:
        return <HomeView />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E27" />
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
          alias: 'usuario.demo.wallet',
          cvu: '0000003100012345678901',
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
          <Text style={styles.subtitle}>Finanzas inteligentes</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              testID="email-input"
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="tu@email.com"
              placeholderTextColor="#64748B"
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
              placeholderTextColor="#64748B"
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
              <ActivityIndicator color="#FFFFFF" />
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
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => onNavigate?.('profile')}
            testID="profile-button"
            style={styles.profileIconButton}>
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onLogout}
            testID="logout-button"
            style={styles.logoutButton}>
            <Text style={styles.logoutText}>Salir</Text>
          </TouchableOpacity>
        </View>
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
            <Text style={styles.actionButtonText}>Enviar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="receive-money-button"
            style={[styles.actionButton, styles.receiveButton]}
            onPress={() => onNavigate?.('receive')}>
            <Text style={styles.actionIcon}>↓</Text>
            <Text style={styles.actionButtonText}>Recibir</Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="simulate-receive-button"
            style={[styles.actionButton, styles.simulateButton]}
            onPress={() => onNavigate?.('simulate-receive')}>
            <Text style={styles.actionIcon}>+</Text>
            <Text style={styles.actionButtonText}>Simular</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.transactionsCard}>
        <Text style={styles.transactionsTitle}>Actividad reciente</Text>
        <View testID="transactions-list">
          {transactions?.map(transaction => (
            <TouchableOpacity
              key={transaction.id}
              style={styles.transactionItem}
              testID={`transaction-${transaction.id}`}
              onPress={() => onNavigate?.('transaction-detail')}>
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
                  <Text style={styles.transactionDate}>
                    {transaction.date} • {transaction.time}
                  </Text>
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
            </TouchableOpacity>
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
  onSend: (amount: number, recipient: string, description: string) => void;
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
      onSend(parseFloat(amount), recipient, description);
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
          Saldo disponible:{' '}
          <Text style={styles.bold}>${balance.toFixed(2)}</Text>
        </Text>

        <View style={styles.form} testID="send-money-form">
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Destinatario</Text>
            <TextInput
              testID="recipient-input"
              style={[styles.input, errors.recipient && styles.inputError]}
              placeholder="Nombre del destinatario"
              placeholderTextColor="#64748B"
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
                placeholderTextColor="#64748B"
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
              placeholderTextColor="#64748B"
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

            <View
              style={styles.confirmationDetails}
              testID="confirmation-details">
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
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Confirmar envío</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              testID="cancel-button"
              style={[
                styles.cancelButton,
                isProcessing && styles.buttonDisabled,
              ]}
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
                  placeholderTextColor="#64748B"
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
              <View testID="qr-code" style={styles.qrCodePlaceholder}>
                <Text style={styles.qrCodeText}>📱</Text>
                <Text style={styles.qrCodeSubtext}>Código QR</Text>
              </View>
            </View>

            <View style={styles.qrInfo}>
              <Text style={styles.qrLabel}>Alias:</Text>
              <Text style={styles.qrValue} testID="qr-alias">
                {user?.alias}
              </Text>

              <Text style={[styles.qrLabel, styles.marginTop]}>CVU:</Text>
              <Text style={styles.qrValueSmall} testID="qr-cvu">
                {user?.cvu}
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

const SimulateReceiveView = ({
  onReceive,
  onBack,
}: {
  onReceive: (amount: number, sender: string, description: string) => void;
  onBack: () => void;
}) => {
  const [amount, setAmount] = useState('');
  const [sender, setSender] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{
    amount?: string;
    sender?: string;
  }>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const validateForm = () => {
    const newErrors: { amount?: string; sender?: string } = {};
    const numAmount = parseFloat(amount);

    if (!amount) {
      newErrors.amount = 'El monto es requerido';
    } else if (isNaN(numAmount)) {
      newErrors.amount = 'El monto debe ser un número válido';
    } else if (numAmount <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0';
    }

    if (!sender) {
      newErrors.sender = 'El remitente es requerido';
    } else if (sender.length < 3) {
      newErrors.sender =
        'El nombre del remitente debe tener al menos 3 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setIsProcessing(true);
      setTimeout(() => {
        onReceive(parseFloat(amount), sender, description);
      }, 1500);
    }
  };

  return (
    <ScrollView style={styles.simulateContainer} testID="simulate-receive-view">
      <TouchableOpacity
        onPress={onBack}
        testID="back-button-simulate"
        style={styles.backButton}>
        <Text style={styles.backButtonText}>← Volver</Text>
      </TouchableOpacity>

      <View style={styles.simulateCard}>
        <Text style={styles.simulateTitle}>Simular recepción</Text>
        <Text style={styles.simulateSubtitle}>
          Emula recibir una transferencia
        </Text>

        <View style={styles.form} testID="simulate-receive-form">
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Remitente</Text>
            <TextInput
              testID="sender-input"
              style={[styles.input, errors.sender && styles.inputError]}
              placeholder="Nombre del remitente"
              placeholderTextColor="#64748B"
              value={sender}
              onChangeText={setSender}
            />
            {errors.sender && (
              <Text style={styles.errorText} testID="sender-error">
                {errors.sender}
              </Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Monto</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                testID="simulate-amount-input"
                style={[
                  styles.input,
                  styles.amountInput,
                  errors.amount && styles.inputError,
                ]}
                placeholder="0.00"
                placeholderTextColor="#64748B"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
            </View>
            {errors.amount && (
              <Text style={styles.errorText} testID="simulate-amount-error">
                {errors.amount}
              </Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción (opcional)</Text>
            <TextInput
              testID="simulate-description-input"
              style={styles.input}
              placeholder="Concepto de la transferencia"
              placeholderTextColor="#64748B"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <TouchableOpacity
            testID="simulate-confirm-button"
            style={[styles.button, isProcessing && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isProcessing}>
            {isProcessing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Simular recepción</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const ProfileView = ({
  user,
  balance,
  onBack,
}: {
  user?: User | null;
  balance?: number;
  onBack: () => void;
}) => {
  const [copyMessage, setCopyMessage] = useState('');

  const copyToClipboard = (text: string, type: string) => {
    setCopyMessage(`${type} copiado`);
    setTimeout(() => setCopyMessage(''), 2000);
  };

  return (
    <ScrollView style={styles.profileContainer} testID="profile-view">
      <TouchableOpacity
        onPress={onBack}
        testID="back-button-profile"
        style={styles.backButton}>
        <Text style={styles.backButtonText}>← Volver</Text>
      </TouchableOpacity>

      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {user?.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.profileName} testID="profile-name">
            {user?.name}
          </Text>
          <Text style={styles.profileEmail} testID="profile-email">
            {user?.email}
          </Text>
        </View>

        <View style={styles.profileBalance}>
          <Text style={styles.profileBalanceLabel}>Saldo total</Text>
          <Text style={styles.profileBalanceAmount} testID="profile-balance">
            ${balance?.toFixed(2)}
          </Text>
        </View>

        <View style={styles.profileSection}>
          <Text style={styles.profileSectionTitle}>Datos de la cuenta</Text>

          <View style={styles.dataItem}>
            <View style={styles.dataItemLeft}>
              <Text style={styles.dataItemLabel}>Alias</Text>
              <Text style={styles.dataItemValue} testID="profile-alias">
                {user?.alias}
              </Text>
            </View>
            <TouchableOpacity
              testID="copy-alias-button"
              style={styles.copyButton}
              onPress={() => copyToClipboard(user?.alias || '', 'Alias')}>
              <Text style={styles.copyButtonText}>📋</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dataItem}>
            <View style={styles.dataItemLeft}>
              <Text style={styles.dataItemLabel}>CVU</Text>
              <Text style={styles.dataItemValue} testID="profile-cvu">
                {user?.cvu}
              </Text>
            </View>
            <TouchableOpacity
              testID="copy-cvu-button"
              style={styles.copyButton}
              onPress={() => copyToClipboard(user?.cvu || '', 'CVU')}>
              <Text style={styles.copyButtonText}>📋</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dataItem}>
            <View style={styles.dataItemLeft}>
              <Text style={styles.dataItemLabel}>Número de cuenta</Text>
              <Text style={styles.dataItemValue} testID="profile-account">
                {user?.accountNumber}
              </Text>
            </View>
            <TouchableOpacity
              testID="copy-account-button"
              style={styles.copyButton}
              onPress={() =>
                copyToClipboard(user?.accountNumber || '', 'Número de cuenta')
              }>
              <Text style={styles.copyButtonText}>📋</Text>
            </TouchableOpacity>
          </View>
        </View>

        {copyMessage && (
          <View style={styles.copyMessageContainer}>
            <Text style={styles.copyMessageText} testID="copy-message">
              ✓ {copyMessage}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const TransactionDetailView = ({
  transaction,
  onBack,
}: {
  transaction?: Transaction;
  onBack: () => void;
}) => {
  return (
    <ScrollView
      style={styles.transactionDetailContainer}
      testID="transaction-detail-view">
      <TouchableOpacity
        onPress={onBack}
        testID="back-button-detail"
        style={styles.backButton}>
        <Text style={styles.backButtonText}>← Volver</Text>
      </TouchableOpacity>

      <View style={styles.transactionDetailCard}>
        <View
          style={[
            styles.detailStatusIcon,
            transaction?.status === 'completed' && styles.detailStatusCompleted,
            transaction?.status === 'pending' && styles.detailStatusPending,
            transaction?.status === 'failed' && styles.detailStatusFailed,
          ]}>
          <Text style={styles.detailStatusIconText}>
            {transaction?.status === 'completed'
              ? '✓'
              : transaction?.status === 'pending'
              ? '⏱'
              : '✗'}
          </Text>
        </View>

        <Text style={styles.detailStatus} testID="transaction-status">
          {transaction?.status === 'completed'
            ? 'Completada'
            : transaction?.status === 'pending'
            ? 'Pendiente'
            : 'Fallida'}
        </Text>

        <Text
          style={[
            styles.detailAmount,
            transaction?.type === 'sent'
              ? styles.detailAmountSent
              : styles.detailAmountReceived,
          ]}
          testID="transaction-detail-amount">
          {transaction?.type === 'sent' ? '-' : '+'}$
          {transaction?.amount.toFixed(2)}
        </Text>

        <View style={styles.detailInfo}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              {transaction?.type === 'sent' ? 'Para:' : 'De:'}
            </Text>
            <Text style={styles.detailValue} testID="transaction-detail-party">
              {transaction?.type === 'sent'
                ? transaction?.to
                : transaction?.from}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fecha:</Text>
            <Text style={styles.detailValue} testID="transaction-detail-date">
              {transaction?.date}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Hora:</Text>
            <Text style={styles.detailValue} testID="transaction-detail-time">
              {transaction?.time}
            </Text>
          </View>

          {transaction?.description && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Descripción:</Text>
              <Text
                style={styles.detailValue}
                testID="transaction-detail-description">
                {transaction?.description}
              </Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>ID de transacción:</Text>
            <Text style={styles.detailValue} testID="transaction-detail-id">
              #{transaction?.id.toString().padStart(8, '0')}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          testID="share-transaction-button"
          style={styles.shareButton}>
          <Text style={styles.shareButtonText}>📤 Compartir comprobante</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  loginContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  loginCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'SF Pro Display', android: 'Roboto' }),
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    fontFamily: Platform.select({ ios: 'SF Pro Display', android: 'Roboto' }),
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
    fontFamily: Platform.select({ ios: 'SF Pro Text', android: 'Roboto' }),
  },
  form: {
    marginTop: 12,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 10,
    fontFamily: Platform.select({ ios: 'SF Pro Text', android: 'Roboto' }),
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
    fontFamily: Platform.select({ ios: 'SF Pro Text', android: 'Roboto' }),
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginTop: 6,
    fontFamily: Platform.select({ ios: 'SF Pro Text', android: 'Roboto' }),
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'SF Pro Text', android: 'Roboto' }),
    letterSpacing: 0.3,
  },
  forgotPassword: {
    marginTop: 24,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'SF Pro Text', android: 'Roboto' }),
  },
  homeContainer: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileIconButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.select({ ios: 'SF Pro Display', android: 'Roboto' }),
    letterSpacing: -0.5,
  },
  userEmail: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
    fontFamily: Platform.select({ ios: 'SF Pro Text', android: 'Roboto' }),
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'SF Pro Text', android: 'Roboto' }),
    fontSize: 14,
  },
  balanceCard: {
    backgroundColor: '#FFFFFF',
    margin: 24,
    marginTop: 0,
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'SF Pro Text', android: 'Roboto' }),
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 28,
    fontFamily: Platform.select({ ios: 'SF Pro Display', android: 'Roboto' }),
    letterSpacing: -1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  sendButton: {
    backgroundColor: '#6366F1',
  },
  receiveButton: {
    backgroundColor: '#10B981',
  },
  simulateButton: {
    backgroundColor: '#F59E0B',
  },
  actionIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'SF Pro Text', android: 'Roboto' }),
  },
  transactionsCard: {
    backgroundColor: '#FFFFFF',
    margin: 24,
    marginTop: 0,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  transactionsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 20,
    fontFamily: Platform.select({ ios: 'SF Pro Display', android: 'Roboto' }),
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  sentIcon: {
    backgroundColor: '#FEE2E2',
  },
  receivedIcon: {
    backgroundColor: '#D1FAE5',
  },
  transactionIconText: {
    fontSize: 20,
  },
  sentIconText: {
    color: '#DC2626',
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
    color: '#0F172A',
    marginBottom: 4,
    fontFamily: Platform.select({ ios: 'SF Pro Text', android: 'Roboto' }),
  },
  transactionDate: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: Platform.select({ ios: 'SF Pro Text', android: 'Roboto' }),
    fontWeight: '500',
  },
  transactionAmount: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'SF Pro Display', android: 'Roboto' }),
  },
  sentAmount: {
    color: '#DC2626',
  },
  receivedAmount: {
    color: '#059669',
  },
  sendContainer: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  backButton: {
    padding: 24,
    paddingBottom: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'SF Pro Text', android: 'Roboto' }),
  },
  sendCard: {
    backgroundColor: '#FFFFFF',
    margin: 24,
    marginTop: 0,
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  sendTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    fontFamily: Platform.select({ ios: 'SF Pro Display', android: 'Roboto' }),
  },
  sendBalance: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 28,
    fontFamily: Platform.select({ ios: 'SF Pro Text', android: 'Roboto' }),
    fontWeight: '500',
  },
  bold: {
    fontWeight: '700',
    color: '#0F172A',
  },
  amountInputContainer: {
    position: 'relative',
  },
  currencySymbol: {
    position: 'absolute',
    left: 16,
    top: 16,
    fontSize: 20,
    color: '#64748B',
    zIndex: 1,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'SF Pro Text', android: 'Roboto' }),
  },
  amountInput: {
    paddingLeft: 36,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
  },
  modalIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalIconText: {
    fontSize: 36,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 28,
    fontFamily: Platform.select({ ios: 'SF Pro Display', android: 'Roboto' }),
  },
  confirmationDetails: {
    marginBottom: 28,
  },
  confirmationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  confirmationLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'SF Pro Text', android: 'Roboto' }),
  },
  confirmationValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    fontFamily: Platform.select({ ios: 'SF Pro Text', android: 'Roboto' }),
  },
  confirmationAmount: {
    fontSize: 26,
    fontWeight: '700',
    color: '#6366F1',
    fontFamily: Platform.select({ ios: 'SF Pro Display', android: 'Roboto' }),
  },
  cancelButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelButtonText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'SF Pro Text', android: 'Roboto' }),
  },
  receiveContainer: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  receiveCard: {
    backgroundColor: '#FFFFFF',
    margin: 24,
    marginTop: 0,
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  receiveTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    fontFamily: Platform.select({ ios: 'SF Pro Display', android: 'Roboto' }),
  },
  receiveSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 28,
    fontFamily: Platform.select({ ios: 'SF Pro Text', android: 'Roboto' }),
    fontWeight: '500',
  },
  qrContainer: {
    alignItems: 'center',
  },
  qrCodeWrapper: {
    backgroundColor: '#F8FAFC',
    padding: 32,
    borderRadius: 24,
    marginBottom: 28,
  },
  qrCodePlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#6366F1',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrCodeText: {
    fontSize: 64,
    marginBottom: 10,
  },
  qrCodeSubtext: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'SF Pro Text', android: 'Roboto' }),
  },
  qrInfo: {
    width: '100%',
    marginBottom: 28,
  },
  qrLabel: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 6,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'SF Pro Text', android: 'Roboto' }),
  },
  qrValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    fontFamily: Platform.select({ ios: 'SF Pro Display', android: 'Roboto' }),
  },
  qrValueSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
    fontFamily: Platform.select({ ios: 'SF Pro Text', android: 'Roboto' }),
  },
  marginTop: {
    marginTop: 20,
  },
  qrAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#10B981',
    textAlign: 'center',
    fontFamily: Platform.select({ ios: 'SF Pro Display', android: 'Roboto' }),
  },
  simulateContainer: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  simulateCard: {
    backgroundColor: '#FFFFFF',
    margin: 24,
    marginTop: 0,
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  simulateTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    fontFamily: Platform.select({ ios: 'SF Pro Display', android: 'Roboto' }),
  },
  simulateSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 28,
    fontFamily: Platform.select({ ios: 'SF Pro Text', android: 'Roboto' }),
    fontWeight: '500',
  },
  profileContainer: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    margin: 24,
    marginTop: 0,
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  profileAvatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatarText: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'SF Pro Display', android: 'Roboto' }),
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
    fontFamily: Platform.select({ ios: 'SF Pro Display', android: 'Roboto' }),
  },
  profileEmail: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    fontFamily: Platform.select({ ios: 'SF Pro Text', android: 'Roboto' }),
  },
  profileBalance: {
    backgroundColor: '#F8FAFC',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 28,
  },
  profileBalanceLabel: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'SF Pro Text', android: 'Roboto' }),
  },
  profileBalanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#6366F1',
    fontFamily: Platform.select({ ios: 'SF Pro Display', android: 'Roboto' }),
  },
  profileSection: {
    marginBottom: 24,
  },
  profileSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 18,
    fontFamily: Platform.select({ ios: 'SF Pro Display', android: 'Roboto' }),
  },
  dataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dataItemLeft: {
    flex: 1,
  },
  dataItemLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'SF Pro Text', android: 'Roboto' }),
  },
  dataItemValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    fontFamily: Platform.select({ ios: 'SF Pro Text', android: 'Roboto' }),
  },
  copyButton: {
    padding: 12,
  },
  copyButtonText: {
    fontSize: 20,
  },
  copyMessageContainer: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  copyMessageText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'SF Pro Text', android: 'Roboto' }),
  },
  transactionDetailContainer: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  transactionDetailCard: {
    backgroundColor: '#FFFFFF',
    margin: 24,
    marginTop: 0,
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  detailStatusIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  detailStatusCompleted: {
    backgroundColor: '#D1FAE5',
  },
  detailStatusPending: {
    backgroundColor: '#FEF3C7',
  },
  detailStatusFailed: {
    backgroundColor: '#FEE2E2',
  },
  detailStatusIconText: {
    fontSize: 44,
    fontWeight: 'bold',
  },
  detailStatus: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: Platform.select({ ios: 'SF Pro Text', android: 'Roboto' }),
  },
  detailAmount: {
    fontSize: 48,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: Platform.select({ ios: 'SF Pro Display', android: 'Roboto' }),
  },
  detailAmountSent: {
    color: '#DC2626',
  },
  detailAmountReceived: {
    color: '#059669',
  },
  detailInfo: {
    backgroundColor: '#F8FAFC',
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'SF Pro Text', android: 'Roboto' }),
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'right',
    flex: 1,
    marginLeft: 12,
    fontFamily: Platform.select({ ios: 'SF Pro Text', android: 'Roboto' }),
  },
  shareButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'SF Pro Text', android: 'Roboto' }),
  },
});

export default App;
