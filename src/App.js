import React from 'react'
import { NotificationItem, chainNameType } from "@epnsproject/sdk-uiweb";
import * as EpnsAPI from "@epnsproject/sdk-restapi";
import { useState } from "react";
import { ethers } from 'ethers'
import { useWeb3React } from "@web3-react/core";






function App() {


  const [data, setData] = useState([]);
  const [channelData, setChannelData] = useState([]);

  var useraddress = "";



  //channel details

  const fetchChannel = async () => {

    const channelData = await EpnsAPI.channels.getChannel({
      channel: 'eip155:42:0xa9A15cf9769fA4b05c20B48CE65b796C3bb4e3cf', // channel address in CAIP
      env: 'staging'
    });
    console.log(channelData);
    setChannelData(channelData);

  }





  //signer object for optin & optout
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signerobject = provider.getSigner();



  //check if susbcribed or not
  const checkSusbcription = async () => {

    await getuseraddress();
    const subscriptions = await EpnsAPI.user.getSubscriptions({
      user: 'eip155:42:' + useraddress, // user address in CAIP
      env: 'staging'
    });


    var flag = false;
    console.log(subscriptions)
    console.log(subscriptions[0].channel);
    console.log(subscriptions[1].channel);
    console.log(subscriptions[2].channel);


    for (let i = 0; i < subscriptions.length; i++) {
      if (subscriptions[i].channel == "0xa9A15cf9769fA4b05c20B48CE65b796C3bb4e3cf") {
        flag = true;
      }
    }
    return flag;
  }



  const fetchNotifications = async () => {
    await getuseraddress()
    console.log(useraddress);
    const notifications = await EpnsAPI.user.getFeeds({
      user: 'eip155:42:' + useraddress, // user address in CAIP
      env: 'staging'
    });
    setData(notifications)
    // console.log(notifications)
  }





  //getting user address

  const getuseraddress = async () => {
    await window.ethereum.request({ method: 'eth_requestAccounts' })
      .then(res => {
        // Return the address of the wallet
        // console.log(res)
        useraddress = res;
      })
  }



  //opting in to the channel

  const optIn = async () => {



    if (await checkSusbcription() == true) {
      alert("you are already opted in");
      return;
    }


    await getuseraddress();

    await EpnsAPI.channels.subscribe({
      signer: signerobject,
      channelAddress: 'eip155:42:0xa9A15cf9769fA4b05c20B48CE65b796C3bb4e3cf', // channel address in CAIP
      userAddress: 'eip155:42:' + useraddress, // user address in CAIP
      onSuccess: () => {
        alert('opt in success');
      },
      onError: () => {
        alert('opt in error');
      },
      env: 'staging'
    })
  }





  //opting out from the channel

  const optOut = async () => {

    if (await checkSusbcription() == false) {
      alert("you are not opted, first opt-in to opt-out");
      return;
    }

    await getuseraddress();

    await EpnsAPI.channels.unsubscribe({
      signer: signerobject,
      channelAddress: 'eip155:42:0xa9A15cf9769fA4b05c20B48CE65b796C3bb4e3cf', // channel address in CAIP
      userAddress: 'eip155:42:' + useraddress, // user address in CAIP
      onSuccess: () => {
        alert('opt out success');
      },
      onError: () => {
        alert('opt out error');
      },
      env: 'staging'
    })

  }


  return (
    <>
      <div>
        <button onClick={() => fetchNotifications()}>Fetch Notifications</button>

        <button onClick={() => fetchChannel()}>Fetch-Channel</button>



      </div>


      <div>
        <ul>
          <li><img src={channelData.icon} /></li>
          <li>{channelData.channel}</li>
          <li>{channelData.name}</li>
          <li>{channelData.info}</li>
          <button onClick={() => optIn()}>Opt-In</button>
          <button onClick={() => optOut()}>Opt-Out</button>

        </ul>
      </div>
      <div>



        {data.map((oneNotification, i) => {
          const {
            cta,
            title,
            message,
            app,
            icon,
            image,
            url,
            blockchain,
            secret,
            notification
          } = oneNotification;

          return (
            <NotificationItem
              key={`notif-${i}`}
              notificationTitle={notification.title}
              notificationBody={notification.body}
              cta={cta}
              app={app}
              icon={icon}
              image={image}
              url={cta}


            />
          );
        })}




        {/* {data.map(item=>(
<div>
  <ul>
    <li>cta: {item.cta}</li>
    <li>title : {item.title}</li>
    <li>message : {item.message}</li>
    <li> body: {item.notification.body}</li>

    </ul>
    </div>
   ))

   } */}
      </div>
    </>
  )
}

export default App