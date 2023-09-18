import React, {useState} from "react";
import {useEffect} from "react";
import {orderbook} from "./services/trade.service";
import Wrapper from "./components/wrapper.component";
import BigNumber from "bignumber.js";
import {Color} from "./theme/color";

interface OrderbookItemInterface {
    price: string;
    quantity: string;
}

function OrderbookItem ({order, color}:{
    order: OrderbookItemInterface,
    color: string;
}) {
    return(
        <div style={{
            fontSize: ' 12px',
            lineHeight: '1',
            width: '200px',
            textAlign: 'left',
            color,
        }}>
            {new BigNumber(order.price).toFixed(3)}
        </div>
    )
}

export function OrderbookComponent() {
    const [asks, setAsks] = useState<OrderbookItemInterface[]>([])
    const [bids, setBids] = useState<OrderbookItemInterface[]>([])
    useEffect(() => {
        getOrderbook()

    }, [])

    const getOrderbook = () => {
        orderbook().then(res => {
            console.log('orderbook', res);
            if (res.success) {
                setAsks(res.data.asks.sort((a: OrderbookItemInterface, b: OrderbookItemInterface) => (new BigNumber(a.price).isGreaterThan(b.price) ? -1 : 1)).slice(-10))
                setBids(res.data.bids.sort((a: OrderbookItemInterface, b: OrderbookItemInterface) => (new BigNumber(a.price).isGreaterThan(b.price) ? -1 : 1)).slice(0, 10));
            }
        })
    }
    return (
        <Wrapper width={'400px'}>
            <Wrapper.Title title={'orderbook'}/>
            <div>

                {asks.map((item, key) =>
                    <OrderbookItem key={key} order={item} color={Color.SELL}/>
                )}
            </div>
            <div style={{
                height: '1px',
                background: '#fff',
                margin: '5px 0',
            }}/>
            <div>
                {bids.map((item, key) =>
                    <OrderbookItem key={key} order={item} color={Color.BUY}/>
                )}
            </div>
        </Wrapper>
    )
}