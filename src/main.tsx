import '@/assets/css/app.less';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootContainer = document.getElementById('root') as HTMLElement;
// createRoot(rootContainer!) if you use TypeScript
const root = ReactDOM.createRoot(rootContainer);

root.render(
  // <React.StrictMode>
  <App />,
  // </React.StrictMode>,
);
