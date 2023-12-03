import logo from './logo.svg';
import './App.css';
import EmailSender from "./components/EmailSender";

function App() {
  return (
    <div className="App">
      <header className="App-header">
          <EmailSender/>
      </header>
    </div>
  );
}

export default App;
