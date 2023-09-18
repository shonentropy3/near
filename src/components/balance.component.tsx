import Wrapper from "./wrapper.component";
import Table from "./table.componet";
import React, {useEffect, useState} from "react";
import {TokenConst} from "../const/token.const";
import {getNearBalance, getNonNativeTokenBalance} from "../services/contract.service";
import {useConnection} from "../ConnectionContext";
import {ButtonBasic} from "./button.component";
import BigNumber from "bignumber.js";
import {fetchBalance} from "../services/asset.service";
import {Color} from "../theme/color";
import {WithdrawComponent} from "../withdraw.component";
import {DepositComponent} from "../deposit.component";

interface TokenBalanceInterface {
    token: string;
    balance: string;
    nearBalance: string;
}

export function BalanceComponent() {
    const [balance, setBalance] = useState<TokenBalanceInterface[]>([])
    const {accountId} = useConnection();
    const tokenConfig = TokenConst;
    const headers = [
        {
            name: 'Token',
            field: 'token',
        },
        {
            name: 'Orderly Balance',
            field: 'balance',
        },
        {
            name: 'Near Wallet Balance',
            field: 'nearBalance'
        },
        {
            name: 'Operate',
            field: '',
        }
    ]

    useEffect(() => {
        getBalance();
    }, [])
    const getNearWalletBalance = () => {
        const promiseArr: Promise<{ token: string; balance: string }>[] = Object.keys(tokenConfig).map(key => {
            if (tokenConfig[key].token === 'NEAR') {
                return getNearBalance(accountId!)
            } else {
                return getNonNativeTokenBalance(accountId!, tokenConfig[key].token, tokenConfig[key].tokenAccountId)
            }
        });

        return Promise.all(promiseArr).then(res => {
            const nearWalletBalance: { [key: string]: string } = {};
            res.reduce((acc, curr) => {
                console.log('curr', curr);
                const tokenData = tokenConfig[curr.token];
                acc[curr.token] = new BigNumber(curr.balance).shiftedBy(-tokenData.decimals).toFixed(8);
                return acc;
            }, nearWalletBalance)
            return Promise.resolve(nearWalletBalance)

        })


    }

    const getUserBalance = () => {
        return fetchBalance().then(res => {
            console.log('balance', res);
            if (res.success) {
                const obj: { [key: string]: string } = {}
                res.data.balances.forEach((item: any) => {
                    obj[item.token] = item.holding;
                })
                return Promise.resolve(obj)
            } else {
                return Promise.resolve({})
            }
        });
    }

    const getBalance = () => {
        Promise.all([getUserBalance(), getNearWalletBalance()]).then(([userBalance, nearWalletBalance]) => {
            const data: TokenBalanceInterface[] = Object.keys(tokenConfig).map(key => {
                return {
                    token: key,
                    balance: userBalance[key],
                    nearBalance: nearWalletBalance[key],
                }
            });
            setBalance(data);
        });
    }

    const renderTableCell = (field: string, item: TokenBalanceInterface) => {
        if (field) {
            // @ts-ignore
            return item[field]
        }
        return (
            <div>
                <DepositComponent token={item.token}/>
                <WithdrawComponent token={item.token}/>
            </div>
        )
    }
    return (
        <Wrapper width={'800px'}>
            <Wrapper.Title title={'Balance'}>
                <ButtonBasic onClick={getBalance}>Refresh Balance</ButtonBasic>

            </Wrapper.Title>
            <Table>
                <Table.Header>
                    <Table.Row>
                        {headers.map(item => <Table.Cell key={item.field}>{item.name}</Table.Cell>)}

                    </Table.Row>
                </Table.Header>
                <Table.Body>

                    {balance.map(item =>
                        <Table.Row key={item.token}>
                            {headers.map(header => <Table.Cell
                                key={header.field}>{renderTableCell(header.field, item)}</Table.Cell>)}
                        </Table.Row>
                    )}
                </Table.Body>
            </Table>

        </Wrapper>
    )
}