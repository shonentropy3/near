import styled from "styled-components";
import React, {HTMLAttributes, ReactNode} from "react";

interface TableInterface<TValue> extends HTMLAttributes<HTMLDivElement> {
    value?: TValue;
    children?: ReactNode;
}

const TableStyled = styled.table`
    width: 100%;
`;

function Table<TValue>(props: TableInterface<TValue>) {
    const {children} = props;
    return (
        <TableStyled>
            {children}
        </TableStyled>
    )
}

interface RowInterface {
    children?: ReactNode;
}

const RowStyled = styled.tr`
  text-align: right;
  border-bottom: 1px solid rgba(255, 255, 255, .3);
`

function Row(props: RowInterface) {
    const {children} = props;
    return (
        <RowStyled>
            {children}
        </RowStyled>
    )
}


interface CellInterface {
    children?: ReactNode;
}

const CellStyled = styled.td`
  padding: 5px;
`;

function Cell(props: CellInterface) {
    return (
        <CellStyled>
            {props.children}
        </CellStyled>
    )
}

interface HeaderInterface {
    children?: ReactNode;
}

const HeaderStyled = styled.thead`
  color: #ccc;
  background: #666;

`

function Header(props: HeaderInterface) {
    return (
        <HeaderStyled>
            {props.children}

        </HeaderStyled>
    )
}

const BodyStyled = styled.tbody`
`;

interface BodyInterface {
    children?: ReactNode;
}

function Body(props: BodyInterface) {
    return (
        <BodyStyled>
            {props.children}

        </BodyStyled>
    )
}

Table.Row = Row;
Table.Cell = Cell;
Table.Header = Header
Table.Body = Body;

export default Table;

