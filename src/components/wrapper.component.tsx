import {ReactNode} from "react";
import styled from "styled-components";
import {Color} from "../theme/color";

interface WrapperComponentProps {
    width?: string;
    children: any;
}

const WrapperStyled = styled.div`
  width: ${(props: WrapperComponentProps) => props.width || '100%'};
  background: ${Color.WidgetBG};
  color: #fff;
  margin: 10px auto;
  padding: 20px;
`

function Wrapper(props: WrapperComponentProps) {
    return (
        <WrapperStyled {...props}>
            {props.children}
        </WrapperStyled>
    )
}

interface TitleProps {
    title: string;
    children?: ReactNode;
}


const TitleStyled = styled.div`
  font-size: 18px;
  color: #fff;
  font-weight: bold;
  text-align: left;
  display: flex;
  gap: 20px;
  padding: 0 10px;
`

function Title(props: TitleProps) {
    return (
        <TitleStyled>
            {props.title}
            {props.children}
        </TitleStyled>
    )
}

Wrapper.Title = Title;
export default Wrapper;
