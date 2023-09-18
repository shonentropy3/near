import {environment} from "../environment/environment";
import requestUtil from "../utils/request.util";

export const entryOrder = async (params: any) => {
    return requestUtil.post(environment.config.apiUrl + '/v1/order', params);
}

export const fetchOrderList = async (params: any) => {
    return requestUtil.get(environment.config.apiUrl + '/v1/orders', params);
}

export const cancelOrder = async (params:{order_id: number; symbol: string}) => {
    return requestUtil.del(environment.config.apiUrl + '/v1/order', params);
}