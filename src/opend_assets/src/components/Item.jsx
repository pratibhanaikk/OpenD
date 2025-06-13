import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import { HttpAgent, Actor } from "@dfinity/agent";
import { idlFactory } from "../../../declarations/nft";
import { idlFactory as tokenidleFactory } from "../../../declarations/token";
import { Principal } from "@dfinity/principal";
import Button from "./Button";
import { opend } from "../../../declarations/opend";
import PriceLabel from "./PriceLabel";
import CURRENT_USER_ID from "../index";
import { canisterId } from "../../../declarations/opend/index";


function Item(props) {
  const id = props.ID;
  const [name, updateName] = useState("");
  const [owner, updateOwner] = useState("");
  const [imgbytes, updateImgBytes] = useState("");
  const [button, setButton] = useState();
  const [PriceInput, setPriceInput] = useState();
  const [hiddenProp, setHiddenProp] = useState(true);
  const [isblur, setBlurElement] = useState();
  const [sellStatus, updateSellStatus] = useState("");
  const [priceLabel, setPriceLabel] = useState();
  const [shouldDisplay, updateshouldDisplay] = useState(true);

  const localHost = "http://localhost:8080/";
  const agent = new HttpAgent({ host: localHost });
  agent.fetchRootKey();

  var nftActor;


  async function loadNFT() {
    nftActor = await Actor.createActor(
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

    const nftIsListed = await opend.isListed(props.ID);


    if (props.role == 'Collection') {
      if (nftIsListed == true) {
        updateOwner("OpenD");
        setBlurElement({ filter: "blur(8px)" });
        updateSellStatus("Listed");
      } else {
        setButton(<Button HandleClick={HandleSell} text="Sell" />)
      }
    } else if (props.role == 'Discover') {
      const originalOwner = await opend.getOriginalOwner(props.ID);
      if(originalOwner.toText() != CURRENT_USER_ID.toText()){
          setButton(<Button text="Buy" HandleClick={handleBuy} />)
      }
      var itemprice = await opend.getNFTPrice(props.ID);
      setPriceLabel(<PriceLabel sellprice={itemprice.toString()}/>);

    }

  }

  async function handleBuy() {
    console.log("Buy is clicked");
    setHiddenProp(true);
    const tokenActor = await Actor.createActor(tokenidleFactory,{
      agent,
      canisterId: Principal.fromText("wqmuk-5qaaa-aaaaa-aaaqq-cai"),
    });

    const sellerId = await opend.getOriginalOwner(props.ID);
    const itemPrice = await opend.getNFTPrice(props.ID);
    const result = await tokenActor.transfer(sellerId, itemPrice);
    setHiddenProp(false);
    if(result == "success"){
      const transferResult = await opend.completePurchase(props.ID, sellerId, CURRENT_USER_ID);
      console.log(transferResult);
      updateshouldDisplay(false);
    }
  }

  function byteArrayToImageUrl(byteArray) {
    const blob = new Blob([new Uint8Array(byteArray)], { type: 'image/png' });
    return URL.createObjectURL(blob);
  }

  let price;

  function HandleSell() {
    console.log("Handle Sell chlicked");
    setPriceInput((<input
      placeholder="Price in DANG"
      type="number"
      className="price-input"
      value={price}
      onChange={(e) => price = e.target.value}
    />));
    setButton(<Button HandleClick={sellItem} text="Confirm" />)
  }

  async function sellItem() {
    if (props.role == 'Collection') { setBlurElement({ filter: "blur(4px)" }) }
    setHiddenProp(false);
    console.log(price);
    const listingResult = await opend.listItem(props.ID, Number(price));
    console.log(listingResult);
    if (listingResult == "Success") {
      const openIDfetch = await opend.fetchCanisterId();
      const transferedResult = await nftActor.transferOwnership(openIDfetch);
      console.log(transferedResult);
      if (transferedResult == "Success") {
        setHiddenProp(true);
        setPriceInput();
        setButton();
        updateSellStatus("Listed");
      }
    }
  }

  useEffect(() => {
    loadNFT();
  }, []);

  return (
    <div style={{display: shouldDisplay? 'inline': 'none'}} className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={byteArrayToImageUrl(imgbytes)}
          style={isblur}
        />
        <div className="lds-ellipsis" hidden={hiddenProp}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="disCardContent-root">
          {priceLabel}
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}<span className="purple-text">{sellStatus}</span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {owner}
          </p>
          {PriceInput}
          {button}
        </div>
      </div>
    </div>
  );
}

export default Item;
