import React from "react";
import {useConnection} from "./ConnectionContext";
import {environment} from "./environment/environment";

export const ConnectComponent = () => {
    const {walletConnection} = useConnection();

    const onConnect = () => {
        console.log('methodNames', environment.nearWalletConfig.methodNames);
        console.log('wallet connections', walletConnection)
        walletConnection?.requestSignIn({
            contractId: environment.nearWalletConfig.contractName,
            // methodNames: environment.nearWalletConfig.methodNames,
            methodNames: ['33']
        });
    }

    return (
        <div>
            <button style={{backgroundColor:"red"}} onClick={onConnect}>connect</button>
        </div>
    )
}