import {environment} from "../environment/environment";
import requestUtil from "../utils/request.util";

export const orderbook = async(symbol: string = 'SPOT_NEAR_USDC') => {
    return requestUtil.get(`${environment.config.apiUrl}/v1/orderbook/${symbol}`)
}