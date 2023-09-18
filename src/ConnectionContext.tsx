import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Account, connect, WalletConnection } from 'near-api-js';
import { environment } from './environment/environment';
import { LoadingComponent } from './loading.component';
import { NearConfig } from 'near-api-js/lib/near';
import {
  checkUserAccountIsExist,
  getTradingKeyPair,
  isOrderlyKeyAnnounced,
  isTradingKeySet,
  setAnnounceKey,
  storageBalanceBounds,
  storageBalanceOf,
  storageCostOfAnnounceKey,
  storageDeposit,
  userRequestSetTradingKey,
  userStorageUsage,
} from './services/contract.service';
import BigNumber from 'bignumber.js';
import { WebsocketService } from './services/base-websocket.service';

interface ConnectionContextProviderProps {
  children: any;
}

interface ConnectionContextValue {
  accountId: string | null;
  account: Account | null;
  walletConnection: WalletConnection | null;
  nearConfig: NearConfig;
  signOut: () => void;
}

const ConnectionContext = React.createContext<ConnectionContextValue | null>(
  null
);
export const ConnectionContextProvider = ({
  children,
}: ConnectionContextProviderProps) => {
  const [isLoading, setLoading] = useState<boolean>(true);
  const [account, setAccount] = useState<Account | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [walletConnection, setWalletConnection] =
    useState<WalletConnection | null>(null);
  const [walletUrl, setWalletUrl] = useState<string>(
    'https://testnet.mynearwallet.com'
  );
  const [nearConfig, setNearConfig] = useState<any>();

  const init = useCallback(async () => {
    try {
      const nearConfig = environment.nearWalletConfig;
      nearConfig.walletUrl = walletUrl;
      setNearConfig(nearConfig);

      const nearConnection = await connect(nearConfig);
      let appKeyPrefix = 'near_app';
      const wallet = new WalletConnection(nearConnection, appKeyPrefix);
      setWalletConnection(wallet);
      console.log('is sign in', wallet.isSignedIn());
      if (wallet.isSignedIn()) {
        const nearAccount = await nearConnection.account(wallet.getAccountId());
        const accountId = wallet.getAccountId();
        const isExist = await checkUserAccountIsExist(accountId);
        console.log('is exist', isExist);
        console.log('accountid', accountId);
        const orderlyKeyPair =
          await environment.nearWalletConfig.keyStore.getKey(
            environment.nearWalletConfig.networkId,
            accountId
          );
        console.log(
          orderlyKeyPair,
          'orderlyKeyPairorderlyKeyPairorderlyKeyPairorderlyKeyPair'
        );
        if (!isExist) {
          const bounds = await storageBalanceBounds(accountId);
          console.log('bounds', bounds);
          const storageDepositRes = await storageDeposit(wallet, bounds.min);
          console.log('storagedeposit', storageDepositRes);
        }
        const isAnnounced = await isOrderlyKeyAnnounced(
          accountId,
          orderlyKeyPair!
        );
        console.log('is announced', isAnnounced);
        if (!isAnnounced) {
          const storageUsage = await userStorageUsage(accountId);
          console.log('storageusage', storageUsage);
          const balanceOf = await storageBalanceOf(accountId);
          console.log('storage balance', balanceOf);
          const storageCost = await storageCostOfAnnounceKey();
          console.log('storage coast', storageCost);
          const value = new BigNumber(storageUsage)
            .plus(new BigNumber(storageCost))
            .minus(new BigNumber(balanceOf.total));
          console.log('value', value.shiftedBy(-24).toString());
          // if (value.isGreaterThan(0)) {
          //     const storageDepositRes = await storageDeposit(wallet, value.toFixed());
          // }
          // const setOrderlyKeyRes = await setAnnounceKey(nearAccount!);
          // console.log('set orderlyKey res', setOrderlyKeyRes);
        }
        // if (localStorage.getItem('TradingKeySecret')) {
        // const tradingKeyPair = getTradingKeyPair();
        // const isSet = await isTradingKeySet(accountId, orderlyKeyPair);
        // console.log('isset', isSet);
        // if (!isSet) {
        //     const setTradingKeyRes = await userRequestSetTradingKey(nearAccount, tradingKeyPair);
        //     console.log('set tradingKey res', setTradingKeyRes);
        //     localStorage.setItem('TradingKeySecret', tradingKeyPair.privateKey);
        // }

        const privateWs = new WebsocketService();
        privateWs.openWebsocket();

        // const setTradingKeyRes = await userRequestSetTradingKey(nearAccount, tradingKeyPair);

        setAccount(nearAccount);

        setAccountId(wallet.getAccountId());
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
      console.log(e);
    }
  }, []);

  useEffect(() => {
    init().then();
  }, [init]);

  const signOut = useCallback(() => {
    walletConnection?.signOut();
    localStorage.removeItem('TradingKeySecret');
    setAccountId(null);
  }, [walletConnection]);

  const providerValue = useMemo(
    () => ({
      accountId,
      walletConnection,
      nearConfig,
      account,
      signOut,
    }),
    [accountId, walletConnection, nearConfig, account, signOut]
  );
  return (
    <ConnectionContext.Provider value={providerValue}>
      {isLoading ? <LoadingComponent /> : children}
    </ConnectionContext.Provider>
  );
};

export function useConnection() {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error(
      'useConnection must be used within a ConnectionContextProvider'
    );
  }
  return context;
}
