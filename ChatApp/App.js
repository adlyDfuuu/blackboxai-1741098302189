import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View, TextInput, Button, FlatList } from 'react-native';
import { firebase, auth, database } from './src/firebaseConfig';

const App = () => {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      setUser(user);
    });

    const messagesRef = database().ref('messages');
    messagesRef.on('value', (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messages = Object.keys(data).map(key => data[key]);
        setMessages(messages);
      }
    });

    return () => {
      unsubscribe();
      messagesRef.off();
    };
  }, []);

  const handleLogin = async () => {
    try {
      await auth().signInAnonymously();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendMessage = async () => {
    if (message.trim() === '') return;

    try {
      await database().ref('messages').push({
        text: message,
        timestamp: Date.now(),
        uid: user.uid,
      });
      setMessage('');
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Button title="Login Anonymously" onPress={handleLogin} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message"
        />
        <Button title="Send" onPress={handleSendMessage} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
  },
});

export default App;
