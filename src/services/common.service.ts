import RequestUtil from "../utils/request.util";
import {environment} from "../environment/environment";

export const fetchTokenConfig = () => {
    return RequestUtil.get(environment.config.apiUrl + '/v4/public/toke')
}
