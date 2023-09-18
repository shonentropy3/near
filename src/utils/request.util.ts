import {environment} from "../environment/environment";
import {getTradingKeyPair, signMessageByOrderlyKey, signMessageByTradingKey} from "../services/contract.service";

export enum MethodTypeEnum {
    GET = 'GET',
    POST = 'POST',
    DELETE = 'DELETE',
}

async function get(url: string, params?: Object) {
    const headers = await getOrderlySignature(url, MethodTypeEnum.GET);
    return requestMethod(url, MethodTypeEnum.GET, params, headers);
}

async function post(url: string, params: { [key: string]: string }) {
    const sign = getTradingKeySignature(params);
    params['signature'] = sign.signature;
    const headers = await getOrderlySignature(url, MethodTypeEnum.POST, params);
    Object.assign(headers, {'orderly-trading-key': sign.tradingKey})
    return requestMethod(url, MethodTypeEnum.POST, params, headers);
}

async function del(url: string, params: { [key: string]: any}) {
    const sign = getTradingKeySignature(params);
    params['signature'] = sign.signature;
    url += `?${Object.keys(params).sort().map(key => `${key}=${params[key]}`).join('&')}`
    const headers = await getOrderlySignature(url, MethodTypeEnum.DELETE);
    Object.assign(headers, {
        'Content-Type': 'application/x-www-form-urlencoded',
        'orderly-trading-key': sign.tradingKey
    })
    return requestMethod(url, MethodTypeEnum.DELETE, null, headers);
}

const getOrderlySignature = async (url: string, method: MethodTypeEnum, params?: null | { [key: string]: string }): Promise<{ [key: string]: string }> => {
    const accountId = 'neardapp-t1.testnet';
    const urlParam = url.split(environment.config.apiUrl)[1];
    const timestamp = new Date().getTime().toString();
    let messageStr = [timestamp, method.toUpperCase(), urlParam].join('');
    if (params && Object.keys(params).length) {
        messageStr += JSON.stringify(params);
    }
    const keyPair = await environment.nearWalletConfig.keyStore.getKey(environment.nearWalletConfig.networkId, accountId)
    const sign = signMessageByOrderlyKey(messageStr, keyPair);

    return {
        'orderly-account-id': accountId,
        'orderly-key': keyPair?.getPublicKey().toString(),
        'orderly-timestamp': timestamp,
        'orderly-signature': sign,
    };
}

const getTradingKeySignature = (params: { [key: string]: string }) => {
    const orderMessage = Object.keys(params)
        .sort()
        .map((key: string) => `${key}=${params[key]}`)
        .join('&',)

    const tradingKey = getTradingKeyPair();
    const tradingKeySignature = signMessageByTradingKey(orderMessage, tradingKey.keyPair);
    return {
        tradingKey: tradingKey?.publicKey.replace('04', ''),
        signature: tradingKeySignature,
    }

}

const requestMethod = (url: string, method: MethodTypeEnum, params: any, headers: { [key: string]: string } = {}) => {
    return fetch(url, {
        method,
        headers: Object.assign({
            'Access-Control-Allow-Origin': '*',
            Accept: 'application/json',
            'Content-Type': 'application/json;charset=utf-8',
        }, headers),
        body: method === MethodTypeEnum.GET ? null : (params ? JSON.stringify(params) : null),

    })
        .then(response => response.json());
}

const requestUtil = {
    get,
    post,
    del,
}
export default requestUtil;