import {TokenInterface} from "../interface/token.interface";

export const TokenConst: {[key: string]: TokenInterface} = {
    NEAR: {
       token: 'NEAR',
       tokenAccountId: 'near',
        decimals: 24,
    },
    USDC: {
        token: 'USDC',
        tokenAccountId: 'usdc.orderly.testnet',
        decimals: 6,
    }
}