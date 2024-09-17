import React, { useState } from 'react';
import type { MenuProps } from 'antd';
import {  Layout, Menu } from 'antd';
import MapGaode from '@/pages/Map/MapGaode';
import {MapTypeDefault, MapTypeList} from '@/pages/Map/MapConfig'
import MapBaidu from './pages/Map/MapBaidu';

const { Header, Content, Sider } = Layout;

const MenuItems: MenuProps['items'] = MapTypeList.map((item) => ({
  key:item.value,
  label: item.label,
}));


const App: React.FC = () => {
  const [current, setCurrent] = useState(MapTypeDefault);

  const onClick: MenuProps['onClick'] = (e) => {
    setCurrent(e.key);
  };


  return (
    <Layout>
      <Header  style={{ display: 'flex', alignItems: 'center' ,backgroundColor:'#fff' }}>
        <Menu
          mode="horizontal"
          selectedKeys={[current]}
          defaultSelectedKeys={[current]}
          items={MenuItems}
          onClick={onClick}
          style={{ flex: 1, minWidth: 0 }}
        />
      </Header>
      <Layout>
        <Sider width={200} style={{ background: 'rgba(255,255,255,.6)' }}>
        
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
        
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
            }}
          >
            { current==='gaode'? <MapGaode /> : <MapBaidu /> }
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default App;