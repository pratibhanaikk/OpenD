import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import { HttpAgent, Actor } from "@dfinity/agent";
import { idlFactory } from "../../../declarations/nft"
import { canisterId } from "../../../declarations/opend/index";
import { Principal } from "@dfinity/principal";


function Item(props) {
  const id = Principal.fromText(props.ID);
  const [name, updateName] = useState("");
  const [owner, updateOwner] = useState("");
  const [imgbytes, updateImgBytes] = useState("");

  const localHost = "http://localhost:8080/";
  const agent = new HttpAgent({ host: localHost });


  async function loadNFT() {
    const nftActor = await Actor.createActor(
      idlFactory, {
      agent,
      canisterId: id,
    });
    const name = await nftActor.getName();
    updateName(name);
    var owner = await nftActor.getOwner();
    owner = owner.toText(owner);
    updateOwner(owner);
    const bytes = await nftActor.getImage();
    updateImgBytes(bytes);
  }

  function byteArrayToImageUrl(byteArray) {
    const blob = new Blob([new Uint8Array(byteArray)], { type: 'image/png' });
    return URL.createObjectURL(blob);
  }

  useEffect(() => {
    loadNFT();
  }, []);

  return (
    <div className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={byteArrayToImageUrl(imgbytes)}
        />
        <div className="disCardContent-root">
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}<span className="purple-text"></span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {owner}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Item;
