import { Layout } from 'antd';
import { Content } from 'antd/es/layout/layout';
         import React from 'react';
import MapAdapter from './pages/Map/MapAdapter';

const App: React.FC = () => {
  return (
    <Layout style={{ height: '100%', color: '#000' }}>
      <Content
        style={{
             height: 'auto',
          overflow: 'auto',
          padding: 16,
        }}>
        <MapAdapter />
      </Content>
    </Layout>
  );
};

export default App;
