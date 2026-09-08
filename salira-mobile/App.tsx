import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/hooks/useAuth';
import Router from './src/navigation/Router';

export default function App() {
  return (
    <AuthProvider>
      <Router />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
