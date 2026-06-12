import React from "react";
import { CircleImgAvatar } from "./avatar";

function Card(props) {
  return (
    <div className="card" role="listitem">
      <div className="top">
        <CircleImgAvatar img={props.img} />
        <h2 className="name">{props.name}</h2>
      </div>
      <div className="bottom">
        <p className="info" aria-label="Phone number">{props.tel}</p>
        <p className="info" aria-label="Email address">{props.email}</p>
      </div>
    </div>
  );
}

export default Card;
