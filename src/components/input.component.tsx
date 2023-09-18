import styled from "styled-components";
import React from "react";
import {Color} from "../theme/color";

const InputStyled = styled.input`
  background: ${Color.WidgetBG};
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  width: ${(props) => props.width ? props.width + 'px' : '100%'};
  &:focus-visible{
    outline: none;
  }
`

interface InputComponentProps extends React.InputHTMLAttributes<HTMLInputElement>{

}
export function InputComponent(props: InputComponentProps) {
    return (
        <InputStyled {...props}/>

    )

}