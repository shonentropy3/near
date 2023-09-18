import {ChangeEvent, useState} from "react";
import {entryOrder} from "./services/order.service";
import {ButtonBasic} from "./components/button.component";
import Wrapper from "./components/wrapper.component";
import {InputComponent} from "./components/input.component";
import {Select} from "./components/select.component";
import {Color} from "./theme/color";

enum OrderSideEnum {
    BUY = 'BUY',
    SELL = 'SELL',
}

enum OrderTypeEnum {
    LIMIT = 'LIMIT',
    MARKET = 'MARKET',
    BID = 'BID',
    ASK = 'ASK',
}

export function EntryOrderComponent() {
    const [price, setPrice] = useState<string>('')
    const [amount, setAmount] = useState<string>('')
    const [orderType, setOrderType] = useState<string>(OrderTypeEnum.LIMIT);

    const onChangePrice = (event: ChangeEvent) =>
        setPrice((event.target as HTMLInputElement).value);

    const onChangeAmount = (event: ChangeEvent) =>
        setAmount((event.target as HTMLInputElement).value);

    const placeOrder = (side: string) => {
        // order message broker_id=woofi_dex&order_price=2.23&order_quantity=1&order_type=LIMIT&side=BUY&symbol=SPOT_NEAR_USDC
        const params: { [key: string]: any } = {
            order_price: price,
            order_quantity: amount,
            order_type: orderType,
            side: side,
            symbol: 'SPOT_NEAR_USDC',
        }
        console.log(params);
        entryOrder(params).then(res => {
            console.log('place order res', res);
        })


    }

    return (
        <Wrapper width={'400px'}>
            <Wrapper.Title title={'Place Order'}/>
            <div className='flex flex-col gap-5 justify-center justify-items-center mt-10'>
                <div className='flex justify-center justify-items-center  gap-2 w-full'>
                    <label className='w-1/3 shrink-0'>order type:</label>
                    <Select value={orderType} onChange={e => setOrderType(e.target.value)}>
                        {Object.keys(OrderTypeEnum).map(key =>
                            <option value={key} key={key} >{key}</option>
                        )}
                    </Select>
                </div>
                <div className='flex justify-items-center  gap-2 w-full'>
                    <label className='w-1/3 shrink-0'>price:</label>
                    <InputComponent placeholder='price' value={price}
                           onChange={onChangePrice}/>
                </div>
                <div className='flex justify-items-center  gap-2 w-full'>
                    <label className='w-1/3 shrink-0'>amount:</label>
                    <InputComponent placeholder='amount' value={amount}
                           onChange={onChangeAmount}/>
                </div>
                <div className='flex justify-center gap-4 w-full'>
                    <ButtonBasic color={Color.SELL} onClick={() => placeOrder(OrderSideEnum.SELL)}>{OrderSideEnum.SELL}</ButtonBasic>
                    <ButtonBasic color={Color.BUY} onClick={() => placeOrder(OrderSideEnum.BUY)}>{OrderSideEnum.BUY}</ButtonBasic>
                </div>
            </div>
        </Wrapper>
    )
}