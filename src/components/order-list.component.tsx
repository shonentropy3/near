import {useEffect, useState} from "react";
import {OrderInterface} from "../interface/order.interface";
import {cancelOrder, fetchOrderList} from "../services/order.service";
import {ButtonBasic} from "./button.component";
import Wrapper from "./wrapper.component";

export function OrderListComponent() {
    const [orderList, setOrderList] = useState<OrderInterface[]>([])
    useEffect(() => {

        getOrderList();

    }, [])

    const getOrderList = () => {
        fetchOrderList({}).then(res => {
            console.log('order list', res);
            if (res.success) {
                setOrderList(res.data.rows);
            }
        })
    }

    const userCancelOrder = (order: OrderInterface) => {
        cancelOrder({
            order_id: order.order_id,
            symbol: order.symbol,
        }).then(res => {
            console.log('cancel order', res);
        })
    }
    return (
        <Wrapper>
            <Wrapper.Title title={'Order List'}><ButtonBasic onClick={getOrderList}>Refresh</ButtonBasic></Wrapper.Title>

            <table>
                <thead>
                <tr>

                    <th className='w-[100px] text-left'>orderId</th>
                    <th className='w-[200px] text-left'>symbol</th>
                    <th className='w-[50px] text-left'>side</th>
                    <th className='w-[100px] text-right'>price</th>
                    <th className='w-[100px] text-right'>qty</th>
                    <th className='w-[100px] text-right'>executed</th>
                    <th className='w-[100px] text-right'>status</th>
                    <th className='w-[200px] text-right'>create time</th>
                    <th className='w-[200px] text-right'>operate</th>
                </tr>

                </thead>
                <tbody>
                {orderList.map(order =>
                    <tr key={order.order_id}>

                        <td className='text-left'>{order.order_id}</td>
                        <td className='text-left'>{order.symbol}</td>
                        <td className='text-left'>{order.side}</td>
                        <td className='text-right'>{order.price}</td>
                        <td className='text-right'>{order.quantity}</td>
                        <td className='text-right'>{order.executed}</td>
                        <td className='text-right'>{order.status}</td>
                        <td className='text-right'>{new Date(order.created_time).toLocaleDateString() + ' ' + new Date(order.created_time).toLocaleTimeString()}</td>
                        <td className='text-right'>
                            {order.status === 'NEW' &&
                                <ButtonBasic onClick={() => userCancelOrder(order)}>cancel order</ButtonBasic>
                            }
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </Wrapper>
    )
}