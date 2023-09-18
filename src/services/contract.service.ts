import {
  Account,
  Contract,
  KeyPair,
  providers,
  utils,
  WalletConnection,
  connect,
} from 'near-api-js';
import {
  AccessKeyViewRaw,
  AccountView,
  CodeResult,
  ViewStateResult,
  AccessKeyView,
} from 'near-api-js/lib/providers/provider';
import { environment } from '../environment/environment';
import {
  createTransaction,
  functionCall,
  Transaction,
} from 'near-api-js/lib/transaction';
import { serialize } from 'near-api-js/lib/utils';
import keccak256 from 'keccak256';
import BigNumber from 'bignumber.js';

const EC = require('elliptic').ec;

const MAX_GAS = '300000000000000';
const BOATLOAD_OF_GAS = utils.format.parseNearAmount('0.00000000003')!;

export const connectToNear = async () => {
  const nearConnection = await connect(environment.nearWalletConfig);
  const wallet = new WalletConnection(nearConnection, 'near_app');
  console.log('Connecting Wallet....');
  if (wallet.isSignedIn()) {
    console.log('钱包已登录');
    // const nearAccount = await nearConnection.account(wallet.getAccountId());
    const accountId = wallet.getAccountId();
    // const orderlyKeyPair = await environment.nearWalletConfig.keyStore.getKey(environment.nearWalletConfig.networkId, accountId);
    // console.log("Generating Access Keys:  ", nearAccount, accountId, orderlyKeyPair);
    return { accountId, wallet };

    // do some action
  } else {
    wallet.requestSignIn({
      contractId: environment.nearWalletConfig.contractName,
      methodNames: environment.nearWalletConfig.methodNames,
    });
  }
};

export const setAnnounceKey = async (account: Account): Promise<any> => {
  return account.functionCall({
    contractId: environment.nearWalletConfig.contractName,
    methodName: 'user_announce_key',
    args: {},
    gas: MAX_GAS,
  });
};

export const getNearAccount = async (): Promise<AccountView> => {
  const provider = new providers.JsonRpcProvider({
    url: environment.nearWalletConfig.nodeUrl,
  });
  return provider.query<AccountView>({
    request_type: 'view_account',
    finality: 'final',
    account_id: 'nearkat.testnet',
  });
};

export const getNearAccessKey = async (): Promise<AccessKeyView> => {
  const provider = new providers.JsonRpcProvider({
    url: environment.nearWalletConfig.nodeUrl,
  });
  return provider.query<AccessKeyView>({
    request_type: 'view_access_key',
    finality: 'final',
    account_id: 'orderly-techops-mm1.testnet',
    public_key: 'ed25519:HXrGwj2Lr7eTcAD4rZ8qYTiLtdnRQh2M3fntaBjreTw',
  });
};

export const getNearAccessKeyList = async (): Promise<AccessKeyViewRaw> => {
  const provider = new providers.JsonRpcProvider({
    url: environment.nearWalletConfig.nodeUrl,
  });
  return provider.query<AccessKeyViewRaw>({
    request_type: 'view_access_key_list',
    finality: 'final',
    account_id: 'orderly-techops-mm1.testnet',
  });
};

export const getNearState = async (): Promise<ViewStateResult> => {
  const provider = new providers.JsonRpcProvider({
    url: environment.nearWalletConfig.nodeUrl,
  });
  return provider.query<ViewStateResult>({
    request_type: 'view_state',
    finality: 'final',
    account_id: 'orderly-techops.testnet',
    prefix_base64: '',
  });
};

export const callMethodByContract = (account: Account) => {
  const contract = new Contract(
    account,
    environment.nearWalletConfig.contractName,
    {
      viewMethods: [],
      changeMethods: ['user_announce_key'],
    }
  );
  // @ts-ignore
  return contract.user_announce_key() as Promise;
};

export const callMethodByRequestSignTransaction = async (
  walletConnection: WalletConnection
) => {
  const accountId = walletConnection.getAccountId();
  const provider = new providers.JsonRpcProvider({
    url: environment.nearWalletConfig.nodeUrl,
  });
  const keyPair = await environment.nearWalletConfig.keyStore.getKey(
    environment.nearWalletConfig.networkId,
    accountId
  );

  // block_hash
  // block_height
  // nonce
  // permission: {FunctionCall: {allowance, method_names, receiver_id}}
  const publicKey = keyPair.getPublicKey();
  console.log('publickkey', publicKey.toString());
  console.log('key pair', keyPair.toString());
  const accessKey = await provider.query<AccessKeyViewRaw>(
    `access_key/${accountId}/${publicKey.toString()}`,
    ''
  );
  console.log(accessKey);

  const nonce = ++accessKey.nonce;
  const recentBlockHash = serialize.base_decode(accessKey.block_hash);
  const transactions: Transaction[] = [];
  transactions.push(
    createTransaction(
      walletConnection.getAccountId(),
      publicKey,
      environment.nearWalletConfig.contractName,
      nonce,
      [functionCall('user_announce_key', {}, MAX_GAS, 0)],
      recentBlockHash
    )
  );
  return walletConnection.requestSignTransactions({
    transactions,
  });
};
export const getNearBalance = async (
  accountId: string
): Promise<{ token: string; balance: string }> => {
  const provider = new providers.JsonRpcProvider({
    url: environment.nearWalletConfig.nodeUrl,
  });
  return provider
    .query<AccountView>({
      request_type: 'view_account',
      account_id: accountId,
      finality: 'optimistic',
    })
    .then((res) => ({ token: 'NEAR', balance: res.amount }));
};

export const getNonNativeTokenBalance = (
  accountId: string,
  token: string,
  tokenAddress: string
): Promise<{ token: string; balance: string }> =>
  callViewFunction({
    contractName: tokenAddress,
    methodName: 'ft_balance_of',
    args: {
      account_id: accountId,
    },
  }).then((res) => ({ token, balance: res }));

function callViewFunction(params: {
  contractName: string;
  methodName: string;
  args: { [key: string]: any };
}) {
  const provider = new providers.JsonRpcProvider({
    url: environment.nearWalletConfig.nodeUrl,
  });
  const b64 = Buffer.from(JSON.stringify(params.args)).toString('base64');
  return provider
    .query<CodeResult>({
      request_type: 'call_function',
      account_id: params.contractName,
      method_name: params.methodName,
      args_base64: b64,
      finality: 'optimistic',
    })
    .then((res) => JSON.parse(Buffer.from(res.result).toString()));
}

export const checkUserAccountIsExist = (accountId: string) =>
  callViewFunction({
    contractName: environment.nearWalletConfig.contractName,
    methodName: 'user_account_exists',
    args: {
      user: accountId,
    },
  });

export const storageBalanceBounds = (accountId: string) =>
  callViewFunction({
    contractName: environment.nearWalletConfig.contractName,
    methodName: 'storage_balance_bounds',
    args: {
      account_id: accountId,
      user: accountId,
    },
  });

export const getAccessKeyInfo = async (
  accountId: string,
  keyPair: KeyPair
): Promise<AccessKeyViewRaw> => {
  const provider = new providers.JsonRpcProvider({
    url: environment.nearWalletConfig.nodeUrl,
  });

  const publicKey = keyPair.getPublicKey();
  return provider.query<AccessKeyViewRaw>(
    `access_key/${accountId}/${publicKey.toString()}`,
    ''
  );
};
export const storageDeposit = async (
  wallet: WalletConnection,
  depositValue: string
) => {
  const res = await connectToNear();
  const accountId = res?.wallet.getAccountId();
  const keyPair = await environment.nearWalletConfig.keyStore.getKey(
    environment.nearWalletConfig.networkId,
    res?.accountId as string
  );
  const publicKey = keyPair.getPublicKey();

  const accessKeyInfo = await getAccessKeyInfo(
    res?.accountId as string,
    keyPair
  );
  const nonce = ++accessKeyInfo.nonce;
  const recentBlockHash = serialize.base_decode(accessKeyInfo.block_hash);
  const transactions: Transaction[] = [];
  transactions.push(
    createTransaction(
      res?.accountId as string,
      publicKey,
      environment.nearWalletConfig.contractName,
      nonce,
      [
        functionCall(
          'storage_deposit',
          {
            receiver_id: environment.nearWalletConfig.contractName,
            msg: '',
          },
          BOATLOAD_OF_GAS,
          depositValue
        ),
      ],
      recentBlockHash
    )
  );
  return res?.wallet.requestSignTransactions({
    transactions,
  });
};

export const orderlyKeyPair = async () => {
  const res = await connectToNear();
  const orderlyKeyPair = await environment.nearWalletConfig.keyStore.getKey(
    environment.nearWalletConfig.networkId,
    res?.accountId as string
  );
  return orderlyKeyPair;
};

export const isOrderlyKeyAnnounced = (
  accountId: string,
  orderlyKeyPair: KeyPair
) =>
  callViewFunction({
    contractName: environment.nearWalletConfig.contractName,
    methodName: 'is_orderly_key_announced',
    args: {
      user: accountId,
      orderly_key: orderlyKeyPair.getPublicKey().toString(),
    },
  });
export const userStorageUsage = (accountId: string) =>
  callViewFunction({
    contractName: environment.nearWalletConfig.contractName,
    methodName: 'user_storage_usage',
    args: {
      user: accountId,
    },
  });

export const storageBalanceOf = (accountId: string) =>
  callViewFunction({
    contractName: environment.nearWalletConfig.contractName,
    methodName: 'storage_balance_of',
    args: {
      account_id: accountId,
    },
  });

export const storageCostOfAnnounceKey = () =>
  callViewFunction({
    contractName: environment.nearWalletConfig.contractName,
    methodName: 'storage_cost_of_announce_key',
    args: {},
  });

export const storageCostOfTokenBalance = () =>
  callViewFunction({
    contractName: environment.nearWalletConfig.contractName,
    methodName: 'storage_cost_of_token_balance',
    args: {},
  });

export const getUserTradingKey = (accountId: string, orderlyKey: string) => {
  console.log(accountId, orderlyKey);
  return callViewFunction({
    contractName: environment.nearWalletConfig.contractName,
    methodName: 'get_user_trading_key',
    args: { user: accountId, orderly_key: orderlyKey },
  });
};

export const getUserTokenBalances = () => {
  return callViewFunction({
    contractName: environment.nearWalletConfig.contractName,
    methodName: 'user_tokens_balances',
    args: {
      from: 0,
      limit: 100,
    },
  });
};

export const generateTradingKeyPair = () => {
  const ec = new EC('secp256k1');
  const keyPair = ec.genKeyPair();

  return {
    privateKey: keyPair.getPrivate().toString('hex'),
    publicKey: keyPair.getPublic().encode('hex'),
    keyPair,
  };
};

export const getTradingKeyPair = () => {
  const secretKey = localStorage.getItem('TradingKeySecret');
  if (!secretKey) {
    return generateTradingKeyPair();
  }
  const ec = new EC('secp256k1');
  const keyPair = ec.keyFromPrivate(secretKey);
  return {
    privateKey: keyPair.getPrivate().toString('hex'),
    publicKey: keyPair.getPublic().encode('hex'),
    keyPair,
  };
};

export const userRequestSetTradingKey = (
  account: Account,
  tradingKeyPair: any
) => {
  console.log(account, tradingKeyPair, '~~~~~~~~~~~~~~');
  const pubKeyAsHex = tradingKeyPair.publicKey.replace('04', '');
  const normalizeTradingKey = window.btoa(
    keccak256(pubKeyAsHex).toString('hex')
  );
  return account.functionCall({
    contractId: environment.nearWalletConfig.contractName,
    methodName: 'user_request_set_trading_key',
    args: {
      key: normalizeTradingKey,
    },
    gas: MAX_GAS,
    attachedDeposit: utils.format.parseNearAmount('0'),
  });
};

export const isTradingKeySet = async (
  accountId: string,
  orderlyKeyPair: KeyPair
) =>
  callViewFunction({
    contractName: environment.nearWalletConfig.contractName,
    methodName: 'is_trading_key_set',
    args: {
      user: accountId,
      orderly_key: orderlyKeyPair.getPublicKey().toString(),
    },
  });

const base64url = function (aStr: string) {
  return aStr.replace(/\+/g, '-').replace(/\//g, '_');
};
export const signMessageByOrderlyKey = (params: string, keyPair: KeyPair) => {
  const u8 = Buffer.from(params);
  const signStr = keyPair.sign(u8);
  return base64url(Buffer.from(signStr.signature).toString('base64'));
};

export const getStorageDepositTransaction = async (
  accountId: string,
  accessKeyInfo: AccessKeyViewRaw,
  keyPair: KeyPair
): Promise<Transaction | null> => {
  const nonce = ++accessKeyInfo.nonce;
  const recentBlockHash = serialize.base_decode(accessKeyInfo.block_hash);
  const publicKey = keyPair.getPublicKey();
  const [storageUsage, balanceOf, storageCost] = await Promise.all([
    userStorageUsage(accountId),
    storageBalanceOf(accountId),
    storageCostOfTokenBalance(),
  ]);
  const value = new BigNumber(storageUsage)
    .plus(new BigNumber(storageCost))
    .minus(new BigNumber(balanceOf.total));
  if (value.isGreaterThan(0)) {
    return createTransaction(
      accountId,
      publicKey,
      environment.nearWalletConfig.contractName,
      nonce,
      [
        functionCall(
          'storage_deposit',
          {
            receiver_id: environment.nearWalletConfig.contractName,
            msg: '',
          },
          BOATLOAD_OF_GAS,
          value.toFixed()
        ),
      ],
      recentBlockHash
    );
  }

  return null;
};

export const depositToken = async (
  wallet: WalletConnection,
  amount: string,
  tokenAddress?: string
) => {
  const accountId = wallet.getAccountId();
  const keyPair = await environment.nearWalletConfig.keyStore.getKey(
    environment.nearWalletConfig.networkId,
    accountId
  );
  const publicKey = keyPair.getPublicKey();

  const accessKeyInfo = await getAccessKeyInfo(accountId, keyPair);
  const transactions: Transaction[] = [];
  const storageDepositTran = await getStorageDepositTransaction(
    accountId,
    accessKeyInfo,
    keyPair
  );
  let nonce = accessKeyInfo.nonce;
  const recentBlockHash = serialize.base_decode(accessKeyInfo.block_hash);
  if (storageDepositTran) {
    transactions.push(storageDepositTran);
    nonce++;
  }
  if (tokenAddress) {
    transactions.push(
      createTransaction(
        accountId,
        publicKey,
        tokenAddress,
        nonce + 1,
        [
          functionCall(
            'ft_transfer_call',
            {
              receiver_id: environment.nearWalletConfig.contractName,
              msg: '',
              amount,
            },
            '90000000000000',
            '1'
          ),
        ],
        recentBlockHash
      )
    );
  } else {
    transactions.push(
      createTransaction(
        accountId,
        publicKey,
        environment.nearWalletConfig.contractName,
        nonce + 1,
        [
          functionCall(
            'user_deposit_native_token',
            {},
            BOATLOAD_OF_GAS,
            utils.format.parseNearAmount(amount)
          ),
        ],
        recentBlockHash
      )
    );
  }
  return wallet.requestSignTransactions({
    transactions,
  });
};

export const getWithdrawFee = async () =>
  callViewFunction({
    contractName: environment.nearWalletConfig.contractName,
    methodName: 'get_withdraw_fee',
    args: {},
  });

export const withdrawToken = async (
  wallet: WalletConnection,
  tokenAddress: string,
  amount: string
) => {
  const accountId = wallet.getAccountId();
  const keyPair = await environment.nearWalletConfig.keyStore.getKey(
    environment.nearWalletConfig.networkId,
    accountId
  );
  const publicKey = keyPair.getPublicKey();
  const [withdrawFee, accessKeyInfo] = await Promise.all([
    getWithdrawFee(),
    getAccessKeyInfo(accountId, keyPair),
  ]);
  const recentBlockHash = serialize.base_decode(accessKeyInfo.block_hash);
  const transactions: Transaction[] = [];
  const storageDepositTran = await getStorageDepositTransaction(
    accountId,
    accessKeyInfo,
    keyPair
  );
  let nonce = accessKeyInfo.nonce;
  if (storageDepositTran) {
    transactions.push(storageDepositTran);
    nonce++;
  }
  transactions.push(
    createTransaction(
      accountId,
      publicKey,
      environment.nearWalletConfig.contractName,
      nonce + 1,
      [
        functionCall(
          'user_request_withdraw',
          {
            token: tokenAddress,
            amount,
          },
          BOATLOAD_OF_GAS,
          withdrawFee
        ),
      ],
      recentBlockHash
    )
  );

  return wallet.requestSignTransactions({
    transactions,
  });
};

function handleZero(str: string) {
  if (str.length < 64) {
    const zeroArr = new Array(64 - str.length).fill(0);
    return zeroArr.join('') + str;
  }
  return str;
}

export const signMessageByTradingKey = (
  message: string,
  tradingKeyPair: any
) => {
  const ec = new EC('secp256k1');
  const msgHash = keccak256(message);
  const privateKey = tradingKeyPair.getPrivate('hex');
  const signature = ec.sign(msgHash, privateKey, 'hex', { canonical: true });
  const r = signature.r.toJSON();
  const s = signature.s.toJSON();
  return `${handleZero(r)}${handleZero(s)}0${signature.recoveryParam}`;
};

export const getUSDCFaucet = async (wallet: WalletConnection) => {
  const accountId = wallet.getAccountId();
  const keyPair = await environment.nearWalletConfig.keyStore.getKey(
    environment.nearWalletConfig.networkId,
    accountId
  );
  const publicKey = keyPair.getPublicKey();

  const accessKeyInfo = await getAccessKeyInfo(accountId, keyPair);
  const nonce = ++accessKeyInfo.nonce;
  const recentBlockHash = serialize.base_decode(accessKeyInfo.block_hash);
  const transactions: Transaction[] = [];
  transactions.push(
    createTransaction(
      accountId,
      publicKey,
      environment.nearWalletConfig.faucetContractName,
      nonce,
      [
        functionCall(
          'get_tokens',
          {
            account_id: accountId,
          },
          BOATLOAD_OF_GAS,
          utils.format.parseNearAmount('0')
        ),
      ],
      recentBlockHash
    )
  );
  return wallet.requestSignTransactions({
    transactions,
  });
};

//新加入
export const checkUserTokenIsExist = () =>
  callViewFunction({
    contractName: environment.nearWalletConfig.contractName,
    methodName: 'is_token_listed',
    args: {},
  });

export const getListedTokens = () =>
  callViewFunction({
    contractName: environment.nearWalletConfig.contractName,
    methodName: 'get_listed_tokens',
    args: {},
  });

export const getListedSymbols = () =>
  callViewFunction({
    contractName: environment.nearWalletConfig.contractName,
    methodName: 'get_listed_symbols',
    args: {},
  });

export const getPerpWhitelist = () =>
  callViewFunction({
    contractName: environment.nearWalletConfig.contractName,
    methodName: 'get_perp_whitelist',
    args: {},
  });

export const getFuturesFeeCollector = () =>
  callViewFunction({
    contractName: environment.nearWalletConfig.contractName,
    methodName: 'get_futures_fee_collector',
    args: {},
  });

export const getFeeCollector = () =>
  callViewFunction({
    contractName: environment.nearWalletConfig.contractName,
    methodName: 'get_fee_collector',
    args: {},
  });

export const getApprovers = () =>
  callViewFunction({
    contractName: environment.nearWalletConfig.contractName,
    methodName: 'get_approvers',
    args: {},
  });

export const getUserInfo = (accountId: string) =>
  callViewFunction({
    contractName: environment.nearWalletConfig.contractName,
    methodName: 'get_user_info',
    args: {
      account_id: accountId,
    },
  });
