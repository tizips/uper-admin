import {useEffect, useState} from "react";
import {Alert, Button, Col, Form, Input, Row} from "antd";
import {LockOutlined, UserOutlined} from "@ant-design/icons";
import {useModel, history} from "@umijs/max";
import Constants from '@/utils/Constants';
import Pattern from "@/utils/Pattern";
import leftLogin from '@/static/images/left-login.png';
import {doBasicModules, doBasicPermissions} from "@/services/basic";
import {doLogin} from "./service";

import styles from './index.less'

const Login = () => {

  const [former] = Form.useForm();
  const [loading, setLoading] = useState(false)
  const {initialState, setInitialState} = useModel('@@initialState');
  const [result, setResult] = useState<APIBasicLogin.Result>({});

  const toAccount = async () => {

    const account = await initialState?.toAccount?.();

    let module = '';
    let modules: any[] = [];
    let permissions: Record<string, string> = {}

    if (!account) {
      history.push(Constants.Forbidden)
    } else {

      const resOfModules = await doBasicModules();

      if (resOfModules.code != Constants.Success || resOfModules.data.length <= 0) {
        history.push(Constants.Forbidden)
      } else {

        module = resOfModules.data[0].code;
        modules = resOfModules.data;

        const resOfPermissions = await doBasicPermissions(module);

        if (resOfPermissions.code != Constants.Success || resOfPermissions.data.length <= 0) {
          history.push(Constants.Forbidden)
        } else {
          resOfPermissions?.data?.forEach(item => permissions[item] = item);
        }
      }
    }

    setInitialState(s => ({...s, account, module, modules, permissions}))
  }

  const toLogin = (data: APIBasicLogin.Request) => {

    localStorage.clear();

    setLoading(true)

    doLogin(data)
      .then(async response => {

        if (response.code != Constants.Success) {
          setResult({result: "error", message: response.message})
        } else {
          setResult({result: "success", message: "登陆成功，等待跳转"})

          localStorage.setItem(Constants.Authorization, response.data.token as string)

          await toAccount()
        }

      })
      .finally(() => setLoading(false))
  }

  const onSubmit = (values: APIBasicLogin.Former) => {

    const data: APIBasicLogin.Request = {
      username: values.username,
      password: values.password,
    }

    toLogin(data)
  }

  useEffect(() => {

    if (initialState?.account) {

      // const { query } = history.location;
      //
      // const { redirect } = query as {
      //   redirect: string;
      // };

      history.push("/")
    }

  }, [initialState?.account])

  return (
    <div className={styles.container}>
      <Row justify="center">
        <Col md={18} sm={16} xs={20} className={styles.box}>
          <Row className={styles.login}>
            <Col sm={0} md={0} lg={14} className={styles.left}>
              <img src={leftLogin} className={styles.image} alt="" width="100%"/>
            </Col>
            <Col lg={10} md={24} sm={24} className={styles.right}>
              <Row>
                <Col xs={24}>
                  <h2 className={styles.title}>登录</h2>
                  {result.result ? (
                    <Alert className={styles.tips} type={result.result} message={result.message} showIcon/>
                  ) : (
                    <p className={styles.summary}>综合后台管理系统</p>
                  )}
                </Col>
                <Col xs={24}>
                  <Form form={former} onFinish={onSubmit} labelCol={{span: 0}}>
                    <Form.Item
                      name="username"
                      validateFirst
                      rules={[
                        {required: true, message: '请输入您的用户名！'},
                        {
                          pattern: new RegExp(Pattern.ADMIN_USERNAME),
                          message: '用户名输入错误！',
                        },
                      ]}
                    >
                      <Input prefix={<UserOutlined/>} placeholder="Username"/>
                    </Form.Item>
                    <Form.Item
                      name="password"
                      validateFirst
                      rules={[
                        {required: true, message: '请输入您的登录密码！'},
                        {
                          pattern: new RegExp(Pattern.ADMIN_PASSWORD),
                          message: '密码输入错误！',
                        },
                      ]}
                    >
                      <Input.Password prefix={<LockOutlined/>} placeholder="Password"/>
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block loading={loading}>
                      立即登录
                    </Button>
                  </Form>
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  )
}

export default Login;
