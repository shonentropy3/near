import { useConnection } from './ConnectionContext';
import { ConnectComponent } from './connect.component';
import { AccountInfoComponent } from './components/account-info.component';
import { EntryOrderComponent } from './entry-order.component';
import { OrderbookComponent } from './orderbook.component';
import { OrderListComponent } from './components/order-list.component';
import { Color } from './theme/color';
import { BalanceComponent } from './components/balance.component';
import { Button, Checkbox, Form, Input } from 'antd';
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  checkUserAccountIsExist,
  getAccessKeyInfo,
  getNearAccessKey,
  getNearAccessKeyList,
  getNearAccount,
  getNearState,
  orderlyKeyPair,
  storageBalanceBounds,
  storageCostOfAnnounceKey,
  storageCostOfTokenBalance,
  userStorageUsage,
  storageDeposit,
  userRequestSetTradingKey,
  connectToNear,
  isOrderlyKeyAnnounced,
  getUserTradingKey,
  storageBalanceOf,
  getUserTokenBalances,
} from './services/contract.service';
import { environment } from './environment/environment';
import { ButtonBasic } from './components/button.component';

export function HomePage() {
  const { accountId } = useConnection();
  const [nearStateData, setNearStateData] = useState<any>();
  const [nearAccountData, setNearAccountData] = useState<any>();
  const [orderlyKeyPairData, setOrderlyKeyPairData] = useState<any>();
  const [nearAccessKeyData, setNearAccessKeyData] = useState<any>();
  const [nearAccessKeyListData, setNearAccessKeyListData] = useState<any>();
  const [checkUserAccountIsExistData, setCheckUserAccountIsExistData] =
    useState<any>();

  const [userRequestSetTradingKeyData, setUserRequestSetTradingKeyData] =
    useState<any>();
  const [getAccessKeyInfoData, setGetAccessKeyInfoData] = useState<any>();
  const [storageBalanceBoundsData, setStorageBalanceBoundsData] =
    useState<any>();
  const [storageDepositData, setStorageDepositData] = useState<any>();
  const [isOrderlyKeyAnnouncedData, setIsOrderlyKeyAnnouncedData] =
    useState<any>();
  const [userStorageUsageData, setUserStorageUsageData] = useState<any>();
  const [storageBalanceOfData, setStorageBalanceOfData] = useState<any>();
  const [storageCostOfAnnounceKeyData, setStorageCostOfAnnounceKeyData] =
    useState<any>();
  const [storageCostOfTokenBalanceData, setStorageCostOfTokenBalanceData] =
    useState<any>();
  const [getUserTradingKeyData, setGetUserTradingKeyData] = useState<any>();
  const [userTokenBalances, setUserTokenBalances] = useState<any>([]);
  const exportData = () => {
    const data = [
      ['getNearState', `${JSON.stringify(nearStateData)}`],
      ['getNearAccount', `${JSON.stringify(nearAccountData)}`],
      ['getNearAccessKey', `${JSON.stringify(nearAccessKeyData)}`],
      ['orderlyKeyPair', `${JSON.stringify(orderlyKeyPairData)}`],
      ['getNearAccessKeyList', `${JSON.stringify(nearAccessKeyListData)}`],
      [
        'checkUserAccountIsExist',
        `${JSON.stringify(checkUserAccountIsExistData)}`,
      ],
      [
        'userRequestSetTradingKey',
        `${JSON.stringify(userRequestSetTradingKeyData)}`,
      ],
      ['storageBalanceBounds', `${JSON.stringify(storageBalanceBoundsData)}`],
      ['getAccessKeyInfo', `${JSON.stringify(getAccessKeyInfoData)}`],
      ['storageDeposit', `${JSON.stringify(storageDepositData)}`],
      ['isOrderlyKeyAnnounced', `${JSON.stringify(isOrderlyKeyAnnouncedData)}`],
      ['userStorageUsage', `${JSON.stringify(userStorageUsageData)}`],
      ['storageBalanceOf', `${JSON.stringify(storageBalanceOfData)}`],
      [
        'storageCostOfAnnounceKey',
        `${JSON.stringify(storageCostOfAnnounceKeyData)}`,
      ],
      [
        'storageCostOfTokenBalance',
        `${JSON.stringify(storageCostOfTokenBalanceData)}`,
      ],
      ['getUserTradingKey', `${JSON.stringify(getUserTradingKeyData)}`],
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    XLSX.writeFile(workbook, 'data.xlsx');
  };
  const exportUserTokenBalances = () => {
    const workbook = XLSX.utils.book_new();
    const data = JSON.parse(JSON.stringify(userTokenBalances));
    const temp: any = [];
    data.map((item: any) => {
      temp.push([item[0], JSON.stringify(item[1])]);
      // console.log(item[0], JSON.stringify(item[1]));
      // return [item[0], JSON.stringify(item[1])];
    });
    const worksheet = XLSX.utils.aoa_to_sheet(temp);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'data.xlsx');
  };
  const fetchUserTokenBalances = async () => {
    try {
      const res = await getUserTokenBalances();
      if (res) {
        setUserTokenBalances(res[1]);
      }
      console.log(res, 'res~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    } catch (error) {
      console.log(error, 'error');
    }
  };
  const fetchGetUserTradingKey = async (data: any) => {
    try {
      const value = await connectToNear();
      const keyPair = await environment.nearWalletConfig.keyStore.getKey(
        environment.nearWalletConfig.networkId,
        value?.accountId as string
      );
      //@ts-ignore
      const res = await getUserTradingKey(
        data?.accountId || value?.accountId,
        data?.orderlyKey || keyPair
      );
      setGetUserTradingKeyData(res);
    } catch (error) {
      console.log(error);
      setGetUserTradingKeyData(error);
    }
  };

  const fetchStorageCostOfTokenBalance = async () => {
    // const data = await storageCostOfTokenBalance();
    if (storageCostOfTokenBalanceData) {
      setStorageCostOfTokenBalanceData('');
    } else {
      try {
        //@ts-ignore
        const res = await storageCostOfTokenBalance();
        setStorageCostOfTokenBalanceData(res);
      } catch (error) {
        setStorageCostOfTokenBalanceData(error);
      }
    }
  };

  const fetchStorageBalanceOf = async (data: any) => {
    try {
      //@ts-ignore
      const res = await storageBalanceOf(data.accountId);
      setStorageBalanceOfData(res);
    } catch (error) {
      setStorageBalanceOfData(error);
    }
  };

  const fetchStorageCostOfAnnounceKey = async () => {
    // const data = await storageCostOfAnnounceKey();
    // console.log(storageCostOfAnnounceKeyData, data);
    if (storageCostOfAnnounceKeyData) {
      setStorageCostOfAnnounceKeyData('');
    } else {
      try {
        //@ts-ignore
        const res = await storageCostOfAnnounceKey();

        setStorageCostOfAnnounceKeyData(res);
      } catch (error) {
        setStorageCostOfAnnounceKeyData(error);
      }
    }
  };
  const fetchUserStorageUsage = async (data: any) => {
    try {
      //@ts-ignore
      const res = await userStorageUsage(data.accountId);
      setUserStorageUsageData(res);
    } catch (error) {
      setUserStorageUsageData(error);
    }
  };
  const fetchStorageDeposit = async () => {
    try {
      //@ts-ignore
      const res = await storageDeposit();
      setStorageDepositData(res);
    } catch (error) {
      console.log('error~~~~~~~', error);
      setStorageDepositData(error);
    }
  };

  const fetchIsOrderlyKeyAnnounced = async (data: any) => {
    try {
      const value = await connectToNear();
      const keyPair = await environment.nearWalletConfig.keyStore.getKey(
        environment.nearWalletConfig.networkId,
        value?.accountId as string
      );
      //@ts-ignore
      const res = await isOrderlyKeyAnnounced(
        data?.accountId || value?.accountId,
        data?.orderlyKeyPair || keyPair
      );
      // alert(res);
      setIsOrderlyKeyAnnouncedData(JSON.stringify(res));
    } catch (error) {
      alert(error);
      setIsOrderlyKeyAnnouncedData(error);
    }
  };

  const fetchNearState = async () => {
    if (nearStateData) {
      setNearStateData('');
    } else {
      try {
        const res = await getNearState();
        setNearStateData(res);
      } catch (error) {
        console.log(error);
        setNearStateData(error);
      }
    }
  };
  const fetchNearAccount = async () => {
    if (nearAccountData) {
      setNearAccountData('');
    } else {
      try {
        const res = await getNearAccount();
        setNearAccountData(res);
      } catch (error) {
        setNearAccountData(error);
      }
    }
  };
  const fetchNearAccessKey = async () => {
    if (nearAccessKeyData) {
      setNearAccessKeyData('');
    } else {
      try {
        const res = await getNearAccessKey();
        setNearAccessKeyData(res);
      } catch (error) {
        setNearAccessKeyData(error);
      }
    }
  };
  // const fetchstorageBalanceBounds = async () => {
  //   try {
  //     const res = await storageBalanceBounds(tokenContractAddress, accountId);
  //     setNearAccessKeyData(res);
  //   } catch (error) {
  //     setNearAccessKeyData(error);
  //   }
  // };

  const fetchGetAccessKeyInfo = async (data: any) => {
    try {
      const value = await connectToNear();
      const keyPair = await environment.nearWalletConfig.keyStore.getKey(
        environment.nearWalletConfig.networkId,
        value?.accountId as string
      );
      //@ts-ignore
      const res = await getAccessKeyInfo(
        data.accountId || (value?.accountId as string),
        data.keyPair || keyPair
      );
      setGetAccessKeyInfoData(res);
    } catch (error) {
      setGetAccessKeyInfoData(error);
    }
  };

  const fetchNearAccessKeyList = async () => {
    if (nearAccessKeyListData) {
      setNearAccessKeyListData('');
    } else {
      try {
        const res = await getNearAccessKeyList();
        setNearAccessKeyListData(res);
      } catch (error) {
        setNearAccessKeyListData(error);
      }
    }
  };

  const fetchUserRequestSetTradingKey = async (data: any) => {
    // userRequestSetTradingKey();
    // if (userRequestSetTradingKeyData) {
    //   setUserRequestSetTradingKeyData('');
    // } else {
    try {
      console.log(data, 'fetchUserRequestSetTradingKey');
      //@ts-ignore
      const res = await userRequestSetTradingKey(
        data.account,
        data.tradingKeyPair
      );
      setUserRequestSetTradingKeyData(res);
    } catch (error) {
      setUserRequestSetTradingKeyData('发生了错误，详情看请求network');
    }
    // }
  };

  const fetchStorageBalanceBounds = async (data: any) => {
    //@ts-ignore
    const res = await storageBalanceBounds(data.accountId);
    console.log(res, 'res~~~~~~~~~~~~~~~~');
    setStorageBalanceBoundsData(res);
  };

  const fetchCheckUserAccountIsExist = async (data: any) => {
    if (checkUserAccountIsExistData) {
      setCheckUserAccountIsExistData('');
    } else {
      try {
        console.log(data.accountId, 'data.accountId');
        const res = await checkUserAccountIsExist(
          (data?.accountId as string) || ''
        );
        console.log(res, 'resdasdasdasdasd');
        setCheckUserAccountIsExistData(JSON.stringify(res));
      } catch (error) {
        setCheckUserAccountIsExistData(error);
      }
    }
  };

  const fetchOrderlyKeyPair = async () => {
    const data = await orderlyKeyPair();
    setOrderlyKeyPairData(data);
  };

  return (
    <div
      style={{
        // background: Color.BG,
        minWidth: '800px',
      }}
    >
      {accountId ? (
        <>
          <AccountInfoComponent />
          <BalanceComponent />
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              height: '400px',
              margin: '0 auto',
            }}
          >
            <OrderbookComponent />
            <EntryOrderComponent />
          </div>
          <OrderListComponent />
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-around',
              flexDirection: 'column',
              padding: '20px',
            }}
          >
            <div className="fetchUserTokenBalances">
              <p>fetchUserTokenBalances </p>
              <ButtonBasic
                onClick={fetchUserTokenBalances}
                style={{ marginBottom: '5px' }}
              >
                fetchData
              </ButtonBasic>
              <br />
              {userTokenBalances.length > 0 && (
                <ButtonBasic onClick={exportUserTokenBalances}>
                  exportUserTokenBanlancesData
                </ButtonBasic>
              )}
            </div>
            <ButtonBasic onClick={exportData}>exportData</ButtonBasic>
            <div className="data-line" onClick={fetchNearState}>
              <span>1.getNearState</span>
              {nearStateData && (
                <div
                  style={{
                    color: 'grey',
                    height: 'auto',
                    wordBreak: 'break-all',
                  }}
                >
                  {JSON.stringify(nearStateData)}
                </div>
              )}
            </div>
            <div className="data-line" onClick={fetchNearAccount}>
              <span>2.getNearAccount</span>
              {nearAccountData && (
                <div
                  style={{
                    color: 'grey',
                    height: 'auto',
                    wordBreak: 'break-all',
                  }}
                >
                  {JSON.stringify(nearAccountData)}
                </div>
              )}
            </div>
            <div className="data-line" onClick={fetchNearAccessKey}>
              <span>3.getNearAccessKey</span>
              {nearAccessKeyData && (
                <div
                  style={{
                    color: 'grey',
                    height: 'auto',
                    wordBreak: 'break-all',
                  }}
                >
                  {JSON.stringify(nearAccessKeyData)}
                </div>
              )}
            </div>
            <div className="data-line" onClick={fetchOrderlyKeyPair}>
              <span>3.orderlyKeyPair</span>
              {orderlyKeyPairData && (
                <div
                  style={{
                    color: 'grey',
                    height: 'auto',
                    wordBreak: 'break-all',
                  }}
                >
                  {JSON.stringify(orderlyKeyPairData)}
                </div>
              )}
            </div>
            <div className="data-line" onClick={fetchNearAccessKeyList}>
              <span>4.getNearAccessKeyList</span>
              {nearAccessKeyListData && (
                <div
                  style={{
                    color: 'grey',
                    height: 'auto',
                    wordBreak: 'break-all',
                  }}
                >
                  {JSON.stringify(nearAccessKeyListData)}
                </div>
              )}
            </div>
            <div className="data-line">
              <span>5.checkUserAccountIsExist</span>
              <Form
                name="basic"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                onFinish={fetchCheckUserAccountIsExist}
                autoComplete="off"
              >
                <Form.Item label="accountId" name="accountId">
                  <Input />
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                  <Button htmlType="submit">查询</Button>
                </Form.Item>
              </Form>
              {checkUserAccountIsExistData && (
                <div
                  style={{
                    color: 'grey',
                    height: 'auto',
                    wordBreak: 'break-all',
                  }}
                >
                  {JSON.stringify(checkUserAccountIsExistData)}
                </div>
              )}
            </div>

            <div className="data-line">
              <span>6.userRequestSetTradingKey</span>
              <Form
                name="basic"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                onFinish={fetchUserRequestSetTradingKey}
                autoComplete="off"
              >
                <Form.Item label="account" name="account">
                  <Input />
                </Form.Item>
                <Form.Item label="tradingKeyPair" name="tradingKeyPair">
                  <Input />
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                  <Button htmlType="submit">查询</Button>
                </Form.Item>
              </Form>
              {userRequestSetTradingKeyData && (
                <div
                  style={{
                    color: 'grey',
                    height: 'auto',
                    wordBreak: 'break-all',
                  }}
                >
                  {JSON.stringify(userRequestSetTradingKeyData)}
                </div>
              )}
            </div>
            <div className="data-line">
              <span>7.storageBalanceBounds</span>
              <Form
                name="basic"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                onFinish={fetchStorageBalanceBounds}
                autoComplete="off"
              >
                <Form.Item label="accountId" name="accountId">
                  <Input />
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                  <Button htmlType="submit">查询</Button>
                </Form.Item>
              </Form>
              {storageBalanceBoundsData && (
                <div
                  style={{
                    color: 'grey',
                    height: 'auto',
                    wordBreak: 'break-all',
                  }}
                >
                  {JSON.stringify(storageBalanceBoundsData)}
                </div>
              )}
            </div>
            <div className="data-line" onClick={fetchGetAccessKeyInfo}>
              <span>8.getAccessKeyInfo</span>
              <Form
                name="basic"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                onFinish={fetchGetAccessKeyInfo}
                autoComplete="off"
              >
                <Form.Item label="accountId" name="accountId">
                  <Input />
                </Form.Item>
                <Form.Item label="keyPair" name="keyPair">
                  <Input />
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                  <Button htmlType="submit">查询</Button>
                </Form.Item>
              </Form>
              {getAccessKeyInfoData && (
                <div
                  style={{
                    color: 'grey',
                    height: 'auto',
                    wordBreak: 'break-all',
                  }}
                >
                  {JSON.stringify(getAccessKeyInfoData)}
                </div>
              )}
            </div>
            <div className="data-line" onClick={fetchStorageDeposit}>
              <span>9.storageDeposit</span>
              {storageDepositData && (
                <div
                  style={{
                    color: 'grey',
                    height: 'auto',
                    wordBreak: 'break-all',
                  }}
                >
                  {JSON.stringify(storageDepositData)}
                </div>
              )}
            </div>
            <div className="data-line">
              <span>10.isOrderlyKeyAnnounced</span>
              <Form
                name="basic"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                onFinish={fetchIsOrderlyKeyAnnounced}
                autoComplete="off"
              >
                <Form.Item label="accountId" name="accountId">
                  <Input />
                </Form.Item>
                <Form.Item label="orderlyKeyPair" name="orderlyKeyPair">
                  <Input />
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                  <Button htmlType="submit">查询</Button>
                </Form.Item>
              </Form>
              {isOrderlyKeyAnnouncedData && (
                <div
                  style={{
                    color: 'grey',
                    height: 'auto',
                    wordBreak: 'break-all',
                  }}
                >
                  {JSON.stringify(isOrderlyKeyAnnouncedData)}
                </div>
              )}
            </div>
            <div className="data-line">
              <span>11.userStorageUsage</span>
              <Form
                name="basic"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                onFinish={fetchUserStorageUsage}
                autoComplete="off"
              >
                <Form.Item label="accountId" name="accountId">
                  <Input />
                </Form.Item>

                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                  <Button htmlType="submit">查询</Button>
                </Form.Item>
              </Form>
              {userStorageUsageData && (
                <div
                  style={{
                    color: 'grey',
                    height: 'auto',
                    wordBreak: 'break-all',
                  }}
                >
                  {JSON.stringify(userStorageUsageData)}
                </div>
              )}
            </div>
            <div className="data-line">
              <span>12.storageBalanceOf</span>
              <Form
                name="basic"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                onFinish={fetchStorageBalanceOf}
                autoComplete="off"
              >
                <Form.Item label="accountId" name="accountId">
                  <Input />
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                  <Button htmlType="submit">查询</Button>
                </Form.Item>
              </Form>
              {storageBalanceOfData && (
                <div
                  style={{
                    color: 'grey',
                    height: 'auto',
                    wordBreak: 'break-all',
                  }}
                >
                  {JSON.stringify(storageBalanceOfData)}
                </div>
              )}
            </div>
            <div className="data-line" onClick={fetchStorageCostOfAnnounceKey}>
              <span>13.storageCostOfAnnounceKey</span>
              {storageCostOfAnnounceKeyData && (
                <div
                  style={{
                    color: 'grey',
                    height: 'auto',
                    wordBreak: 'break-all',
                  }}
                >
                  {JSON.stringify(storageCostOfAnnounceKeyData)}
                </div>
              )}
            </div>
            <div className="data-line" onClick={fetchStorageCostOfTokenBalance}>
              <span>14.storageCostOfTokenBalance</span>
              {storageCostOfTokenBalanceData && (
                <div
                  style={{
                    color: 'grey',
                    height: 'auto',
                    wordBreak: 'break-all',
                  }}
                >
                  {JSON.stringify(storageCostOfTokenBalanceData)}
                </div>
              )}
            </div>
            <div className="data-line">
              <span>15.getUserTradingKey</span>
              <Form
                name="basic"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                onFinish={fetchGetUserTradingKey}
                autoComplete="off"
              >
                <Form.Item label="accountId" name="accountId">
                  <Input />
                </Form.Item>
                <Form.Item label="orderlyKey" name="orderlyKey">
                  <Input />
                </Form.Item>

                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                  <Button htmlType="submit">查询</Button>
                </Form.Item>
              </Form>
              {getUserTradingKeyData && (
                <div
                  style={{
                    color: 'grey',
                    height: 'auto',
                    wordBreak: 'break-all',
                  }}
                >
                  {JSON.stringify(getUserTradingKeyData)}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <ConnectComponent />
      )}
    </div>
  );
}
