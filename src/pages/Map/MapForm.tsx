import { Form, FormProps, Input } from 'antd';
import { useCallback } from 'react';

import CommonForm from '@/components/CommonForm';

const { TextArea } = Input;

interface Props extends FormProps {
  callback?: (values: any) => void;
}

export const MapForm: React.FC<Props> = (props) => {
  const { callback, ...rest } = props;

  const onFinish = useCallback(
    (values: any) => {
      callback && callback(values);
    },
    [callback],
  );

  const onReset = useCallback(() => {
    callback && callback({});
  }, [callback]);

  return (
    <CommonForm
      {...rest}
      name="mapForm"
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      formItemLayout="vertical"
      onFinish={onFinish}
      onReset={onReset}
      submitText="解析">
      <Form.Item label="经纬度" name="value1" layout="vertical">
        <TextArea
          allowClear
          placeholder="请输入经纬度坐标数据"
          style={{ width: '100%', height: 100, resize: 'none' }}
        />
      </Form.Item>

      <Form.Item label="经纬度（对比）" name="value2" layout="vertical">
        <TextArea
          allowClear
          placeholder="请输入经纬度坐标数据"
          style={{ width: '100%', height: 100, resize: 'none' }}
        />
      </Form.Item>
      <Form.Item label="经纬度（坐标点）" name="value3" layout="vertical">
        <TextArea
          allowClear
          placeholder="请输入经纬度坐标数据"
          style={{ width: '100%', height: 100, resize: 'none' }}
        />
      </Form.Item>
    </CommonForm>
  );
};

export const MapGeoForm: React.FC<Props> = (props) => {
  const { callback, ...rest } = props;

  const onFinish = useCallback(
    (values: any) => {
      callback && callback(values);
    },
    [callback],
  );

  const onReset = useCallback(() => {
    callback && callback({});
  }, [callback]);

  return (
    <CommonForm
      {...rest}
      name="geoCodeForm"
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 20 }}
      onFinish={onFinish}
      onReset={onReset}
      submitText="地址-&gt;经纬度">
      <Form.Item label="地&nbsp;&nbsp;&nbsp;&nbsp;址" name="address">
        <Input allowClear placeholder="请输入地址" />
      </Form.Item>
      <Form.Item label="经纬度" name="lnglat">
        <Input allowClear />
      </Form.Item>
    </CommonForm>
  );
};

export const MapRegeoForm: React.FC<Props> = (props) => {
  const { callback, ...rest } = props;

  const onFinish = useCallback(
    (values: any) => {
      callback && callback(values);
    },
    [callback],
  );

  const onReset = useCallback(() => {
    callback && callback({});
  }, [callback]);

  return (
    <CommonForm
      {...rest}
      name="regeoCodeForm"
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 20 }}
      onFinish={onFinish}
      onReset={onReset}
      submitText="经纬度-&gt;地址">
      <Form.Item label="经纬度" name="lnglat">
        <Input allowClear placeholder="请输入经纬度坐标" />
      </Form.Item>

      <Form.Item label="地&nbsp;&nbsp;&nbsp;&nbsp;址" name="address">
        <Input allowClear />
      </Form.Item>
    </CommonForm>
  );
};
