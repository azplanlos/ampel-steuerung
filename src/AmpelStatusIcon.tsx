import { css } from 'glamor';
import React from 'react';
import { ReactSVG } from 'react-svg';

export enum AmpelStatus {
    ROT,
    GELB,
    ROTGELB,
    GRÜN,
    AN,
    AUS
  }

export type AmpelStatusProps = {
    status: AmpelStatus;
}



export default function AmpelStatusIcon(props: AmpelStatusProps) {

  let farbe1 = 'black';
  let farbe2 = 'black';
  let farbe3 = 'black';

  switch (props.status) {
    case AmpelStatus.ROT: 
      farbe1 = "red";
      break;
    case AmpelStatus.GELB: 
      farbe2 = "yellow";
      break;
    case AmpelStatus.GRÜN:
      farbe3 = "green";
      break;
    case AmpelStatus.ROTGELB:
      farbe1 = "red";
      farbe2 = "yellow";
      break;
    case AmpelStatus.AN:
      farbe1 = "red";
      farbe2 = "yellow";
      farbe3 = "green";
      break;
  }

  let styles = css({
    '& .rect1': {
      fill: farbe1
    },
    '& .rect2': {
      fill: farbe2
    },
    '& .rect3': {
      fill: farbe3
    },
    ' svg': {
      height: 200,
      width: 200,
    },
  })

  
  return <ReactSVG src="status.svg" {...styles}></ReactSVG>
}