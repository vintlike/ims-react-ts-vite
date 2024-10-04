import { Button, Form, FormProps, Space } from 'antd';
import classNames from 'classnames';
import React, { useCallback, useImperativeHandle } from 'react';

/**
 * 自定义form表单，主要为了适应中英文下label宽度
 * @param props
 * @returns
 */

interface IResetFormRefHandles {
  /** 重置表单 */ resetFields: (fields?: string[]) => void;
}

interface Props extends FormProps {
  submitText?: string;
  formItemLayout?: 'horizontal' | 'vertical';
  onReset: () => void;
}

const CommonForm: React.ForwardRefRenderFunction<
  IResetFormRefHandles,
  Props
> = (props, ref) => {
  const {
    form,
    name = 'commonForm',
    colon = false,
    labelAlign = 'left',
    layout = 'inline',
    formItemLayout = 'horizontal',
    children,
    className,
    submitText = '提交',
    onReset,
    ...rest
  } = props;

  useImperativeHandle(
    ref,
    (): IResetFormRefHandles => ({
      resetFields: (fields) => {
        form?.resetFields(fields);
      },
    }),
  );

  const reset = useCallback(() => {
    form?.resetFields();
    onReset && onReset();
  }, [onReset, form]);

  return (
    <Form
      {...rest}
      colon={colon}
      form={form}
      name={name}
      labelAlign={labelAlign}
      layout={layout}
      className={classNames('common-form', className)}>
      <>
        {children}

        <Form.Item label=" " layout={formItemLayout}>
          <Space size={16} direction={formItemLayout}>
            <Button onClick={() => reset()}>重置</Button>
            <Button type="primary" htmlType="submit">
              {submitText}
            </Button>
          </Space>
        </Form.Item>
      </>
    </Form>
  );
};

export default React.forwardRef(CommonForm);
