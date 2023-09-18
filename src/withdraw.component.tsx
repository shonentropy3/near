import {useConnection} from "./ConnectionContext";
import {ChangeEvent, useState} from "react";
import {withdrawToken} from "./services/contract.service";
import {ButtonBasic} from "./components/button.component";
import {Color} from "./theme/color";
import {InputComponent} from "./components/input.component";
import {TokenConst} from "./const/token.const";
import BigNumber from "bignumber.js";
import {utils} from "near-api-js";

interface WithdrawComponentProps {
    token: string;
}

export function WithdrawComponent(props: WithdrawComponentProps) {
    const [amount, setAmount] = useState<string>('');
    const {walletConnection} = useConnection();
    const onWithdraw = () => {
        const tokenData = TokenConst[props.token];
        console.log('token data', tokenData);
        if (!tokenData) {
            return false;
        }
        if (props.token === 'NEAR') {

            withdrawToken(walletConnection!, tokenData.tokenAccountId, utils.format.parseNearAmount(amount) || '0',).then();
        } else {
            withdrawToken(walletConnection!, tokenData.tokenAccountId, new BigNumber(amount).shiftedBy(tokenData.decimals).toFixed()).then();
        }

    }
    const onChange = (e: ChangeEvent) => {
        setAmount((e.target as HTMLInputElement).value);
    }
    return (
        <form className='flex justify-center gap-2 mt-2'>
            <InputComponent width={100} type='number' value={amount} onChange={onChange}/>
            <ButtonBasic color={Color.SELL} onClick={onWithdraw}>Withdraw</ButtonBasic>
        </form>
    )
}