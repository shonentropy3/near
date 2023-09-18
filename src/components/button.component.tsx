import {HTMLAttributes} from "react";
import styled from "styled-components";
import {Color} from "../theme/color";

interface ButtonBasicProps extends HTMLAttributes<HTMLDivElement> {
    children?: any;
    color?: string;
}

const ButtonBasicStyled = styled.div`
  min-width: 100px;
  display: inline-block;
  border-radius: 4px;
  padding: 2px 5px;
  cursor: pointer;
  background: ${(props) => props.color ? props.color : Color.BUY};
  color: #fff;
  text-align: center;
`
export const ButtonBasic = (props: ButtonBasicProps) => {
    return (
        <ButtonBasicStyled {...props}>
            {props.children}
        </ButtonBasicStyled>
    )
}