import {useConnection} from "../ConnectionContext";
import {getUSDCFaucet,} from "../services/contract.service";
import {ButtonBasic} from "./button.component";
import Wrapper from "./wrapper.component";

export function AccountInfoComponent() {
    const {accountId, signOut, walletConnection: wallet} = useConnection();

    const getUSDC = () => {
        getUSDCFaucet(wallet!).then();
    }


    return (
        <Wrapper width={'800px'}>
            <Wrapper.Title title={'accountInfo'}>

                <ButtonBasic onClick={signOut}>logout</ButtonBasic>
            </Wrapper.Title>
            <div className='flex flex-col justify-items-start justify-start items-start gap-2 border-2 p-2'>
                <div>accountId: {accountId} </div>

                <ButtonBasic onClick={getUSDC}>GET 1000 USDC</ButtonBasic>
            </div>
        </Wrapper>
    )
}