import {ChangeEvent, useState} from "react";
import {useConnection} from "./ConnectionContext";
import {depositToken} from "./services/contract.service";
import {ButtonBasic} from "./components/button.component";
import {Color} from "./theme/color";
import {InputComponent} from "./components/input.component";
import {TokenConst} from "./const/token.const";
import BigNumber from "bignumber.js";

interface DepositComponentProps {
    token: string;
}

export function DepositComponent(props: DepositComponentProps) {
    const {walletConnection} = useConnection();
    const [amount, setAmount] = useState<string>('1');

    const onDepositClick = () => {
        console.log('value', amount);
        const tokenData = TokenConst[props.token];
        console.log('tokendata', tokenData, props.token);
        if (props.token !== 'NEAR') {

            depositToken(walletConnection!, new BigNumber(amount).shiftedBy(tokenData.decimals).toFixed(), tokenData.tokenAccountId).then();
        } else {
            depositToken(walletConnection!, amount).then();
        }


    }

    const changeValue = (e: ChangeEvent) => {
        setAmount((e.target as HTMLInputElement).value);
    }
    return (
        <form className='flex justify-center gap-2 '>
            <InputComponent width={100} type='number' value={amount} onChange={changeValue}/>
            <ButtonBasic color={Color.BUY} onClick={onDepositClick}>Deposit</ButtonBasic>
        </form>
    )
}