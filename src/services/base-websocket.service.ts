import {environment} from "../environment/environment";
import UUID from "../utils/uuid.util";
import {signMessageByOrderlyKey} from "./contract.service";

const PING_TIMEOUT = 10 * 1000; // second
const PING_INTERVAL = 10 * 1000; // second

export const getRandomString =() => `${new Date().getTime()}${Math.floor(Math.random() * 10000)}`;

export enum WsState {
    connecting,
    opened,
    closing,
    closed,
}

export enum WsEventEnum {
    SUBSCRIBE = 'subscribe',
    UNSCUBSCRIBE = 'unsubscribe',
    PING = 'ping',
    PONG = 'pong',
    REQUEST = 'request',
    AUTH = 'auth',
}


export enum WsTopicEnum {
    TICKERS = 'tickers',
    BBO = 'bbo',
    BBOS = 'bbos',
    ORDERBOOK = 'orderbook',
    ORDERBOOK_UPDATE = 'orderbookupdate',
    TRADE = 'trade',
    POSITION_INFO = 'positioninfo',
    NOTIFICATIONS = 'notifications',
    EXECUTION_REPORT = 'executionreport',
    ALGO_EXECUTION_REPORT = 'algoexecutionreportv2',
    KLINE_1M = 'kline_1m',
    KLINE_5M = 'kline_5m',
    KLINE_15M = 'kline_15m',
    KLINE_30M = 'kline_30m',
    KLINE_1H = 'kline_1h',
    KLINE_1D = 'kline_1d',
    FUTURES_POSITION = 'position',
    MARK_PRICES = 'markprices',
    INDEX_PRICES = 'indexprices',
    OPEN_INTERESTS = 'openinterests',
    EST_FUNDING_RATE = 'estfundingrate',
    BALANCE = 'balance',
    ACCOUNT = 'account',
    EVENT = 'event',
}


export interface WsResponseInterface {
    id: string;
    event?: WsEventEnum;
    success?: boolean;
    ts?: number;
    data: any;
    topic?: string;
    errorMsg?: string;
}

export class WsInstancePro {
    readonly uniqueKey: string = '';
    readonly appId: string = '';
    pingTimeOutTimer?: number;
    connectingTimeoutTimer?: number;

    wsState = WsState.connecting;
    sendPingTimer?: number;

    wsInstance: WebSocket;

    constructor(wsInstance: WebSocket, appId: string, uniqueKey: string) {
        this.wsInstance = wsInstance;
        this.appId = appId;
        this.uniqueKey = uniqueKey;
    }

    setPingTimeOut() {
        this.pingTimeOutTimer = window.setTimeout(() => {
            console.error(`[WS ${this.uniqueKey} PING_TIMEOUT`)

        }, PING_TIMEOUT);
    }

    removePingTimeOut() {
        if (this.pingTimeOutTimer) {
            clearTimeout(this.pingTimeOutTimer);
        }
    }

    send(message: any) {
        try {
            if (this.wsInstance.readyState === WebSocket.OPEN) {
                this.wsInstance.send(JSON.stringify(message))
            } else if (this.wsInstance.readyState === WebSocket.CONNECTING) {
                setTimeout(() => {
                    this.send(message);
                }, 100)
            } else {
                console.log(this.wsInstance.readyState, this.wsInstance);
                console.error(`send ws message failed. ws has been closed.`)
            }
        } catch (error) {
            console.error(error)
        }
    }

    subscribe(topic: string) {
        try {
            const sendSubscribe = {
                id: topic,
                event: WsEventEnum.SUBSCRIBE,
                topic,
                ts: new Date().getTime(),
            }
            this.send(sendSubscribe);
            console.log(`[WS ${this.uniqueKey} SUBSCRIBE] ${topic}`)
        } catch (e) {
            console.error(e);
        }
    }
    wsAuth() {
        const accountId = 'neardapp-t1.testnet';
        if (accountId) {
            (async () => {
                const orderlyKeyPair = await environment.nearWalletConfig.keyStore.getKey(environment.nearWalletConfig.networkId, accountId);
                const timestamp = new Date().getTime();
                // 需要用orderlyKey签名消息
                const sign = signMessageByOrderlyKey(timestamp.toString(), orderlyKeyPair);
                const sendAuth = {
                    id: '123r',
                    event: WsEventEnum.AUTH,
                    params: {
                        timestamp,
                        sign,
                        orderly_key: orderlyKeyPair.getPublicKey().toString(),
                    }
                }
                this.send(sendAuth);
            })();
        } else {
            console.error(`[WS ${this.uniqueKey} NO_AUTH]`)
        }
    }

    setConnectingTimeOut() {
        this.connectingTimeoutTimer = window.setTimeout(() => {
            console.error(`[WS ${this.uniqueKey} PING_TIMEOUT]`)
            this.closeWebsocket();
        }, PING_TIMEOUT);
    }

    removeConnectingTimeout() {
        if (this.connectingTimeoutTimer) {
            clearTimeout(this.connectingTimeoutTimer)
        }
    }

    closeWebsocket() {
        console.log(`WS ${this.uniqueKey} ON CLOSE`)
        this.removePingTimeOut();
        this.wsState = WsState.closing;
        this.wsInstance.close()
    }

}

export class WebsocketService {
    static _created = false;
    static _instance: any = null;
    wsInstancePro?: WsInstancePro;
    constructor() {
        if (!WebsocketService._created) {
            WebsocketService._instance = this;
            WebsocketService._created = true;

        }
        return WebsocketService._instance;
    }

    needAuth(): boolean {
        return true;
    }

    getUserKey(): string {
        return 'neardapp-t1.testnet'
    }

    wsUrl(): string {
        return this.needAuth() ? environment.config.privateWsUrl : environment.config.publicWsUrl;
    }

    path(): string {
        return this.needAuth() ? '/v2/ws/private/stream/' : '/ws/stream/';
    }

    openWebsocket() {
        const userKey = this.getUserKey();
        const wsInstance = new WebSocket(this.wsUrl() + this.path() + userKey)
        console.log(`[WS CONNECTING]:::${this.wsUrl() + this.path() + userKey}`);
        const wsInstancePro = new WsInstancePro(
            wsInstance,
            userKey,
            getRandomString()
        );
        wsInstancePro.setConnectingTimeOut();
        wsInstancePro.wsState = WsState.connecting;
        this.wsInstancePro = wsInstancePro
        wsInstance.onopen = () => {
            // first ping
            this.handlePongResponse(wsInstancePro)
            if (wsInstancePro.wsState === WsState.connecting) {
                wsInstancePro.removeConnectingTimeout();
                console.log(`[WS-${wsInstancePro.uniqueKey} CONNECTING]`)
                wsInstancePro.wsState = WsState.opened;
                this.handleWsOnOpen(wsInstancePro)

            }

        }
        wsInstance.onmessage = (wsMessage) => {
            const message: WsResponseInterface = JSON.parse(wsMessage.data);
            if (wsInstancePro.wsState === WsState.closing || wsInstancePro.wsState === WsState.closed) {
                console.warn(`[WS ${wsInstancePro.uniqueKey} RECEIVED BUT ${wsInstancePro.wsState}:::${String(wsMessage).toString()}]`)
            }
            const {topic, data, ts, event, success, errorMsg} = message;
            if (event) {
                if (success === false) {
                    console.warn(`[WS ${wsInstancePro.uniqueKey} EVENT ERROR] EVENT: ${event}, ERROR: ${errorMsg}`)
                }
                switch (event) {
                    case WsEventEnum.PING:
                        this.handlePingResponse(wsInstancePro)
                        break;
                    case WsEventEnum.PONG:
                        this.handlePongResponse(wsInstancePro)
                        break;
                    case WsEventEnum.AUTH:
                        this.handleAuthResponse(message, wsInstancePro);
                        break;
                }
            }
            if (topic !== null) {
                this.handleTopicResponse(message, wsInstancePro);
            }
        }
    }

    handleWsOnOpen(wsInstancePro: WsInstancePro) {
        wsInstancePro.wsAuth();
    }

    handlePongResponse(wsInstancePro: WsInstancePro) {
        wsInstancePro.removePingTimeOut();
        wsInstancePro.sendPingTimer = window.setTimeout(() => {
            const sendPing = {
                id: '',
                event: WsEventEnum.PING,
                ts: new Date().getTime(),
            }
            wsInstancePro.send(sendPing);
            wsInstancePro.setPingTimeOut();
        }, PING_INTERVAL);
    }

    handlePingResponse(wsInstancePro: WsInstancePro) {
        const sendPong = {
            id: '',
            event: WsEventEnum.PONG,
            ts: new Date().getTime(),
        }
        wsInstancePro.send(sendPong)
    }

    handleAuthResponse(msgData: WsResponseInterface, wsInstancePro: WsInstancePro) {
        if (msgData.success) {
            wsInstancePro.subscribe(WsTopicEnum.ACCOUNT);
            wsInstancePro.subscribe(WsTopicEnum.BALANCE);
        } else {
            console.error(`[WS AUTH_FAILED]`)
        }
    }

    handleTopicResponse(msgData: WsResponseInterface, wsInstancePro: WsInstancePro) {
        const {topic, data} = msgData;
        switch (topic) {
            case WsTopicEnum.BALANCE:
                const position = Object.entries(data.balance as {[key: string]:any}).map(([token, position]) => {
                    return {
                        token,
                        balance: position.holding,
                        open: position.averageOpenPrice,
                    }
                })
                console.log('position', position);
                break;
        }

    }

}