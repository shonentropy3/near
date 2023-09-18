import styled from "styled-components";
import {Color} from "../theme/color";

const SelectStyled = styled.select`
  background: ${Color.WidgetBG};
   width: 100%;
  border-bottom: 1px solid rgba(255, 255, 255, .3);
   &:focus-visible{
      outline: none;
   }
`

interface SelectPropsInterface extends React.SelectHTMLAttributes<HTMLSelectElement>{

}

export function Select(props: SelectPropsInterface) {
   return (
      <SelectStyled {...props}/>
   )
}