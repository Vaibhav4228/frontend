import React, { useState, useEffect } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import VideocamIcon from '@mui/icons-material/Videocam'; // Import the Video Call Icon from MUI

const IncomingCall = ({ peerName, onCallAccepted, onCallRejected }) => {
  return (
    <div>
      <p>{peerName} is calling you!</p>
      <button onClick={() => onCallAccepted()}>Accept</button>
      <button onClick={() => onCallRejected()}>Reject</button>
    </div>
  );
};

const VideoCall = () => {
  const [stompClient, setStompClient] = useState(null);
  const [incomingCall, setIncomingCall] = useState(false);
  const [peerName, setPeerName] = useState('');
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [callingUser, setCallingUser] = useState('');

  useEffect(() => {
    // Connect to WebSocket server
    const socket = new SockJS('http://https://vsocial-backend-v2.onrender.com:8080/ws');
    const stomp = Stomp.over(socket);
    setStompClient(stomp);

    stomp.connect({}, (frame) => {
      console.log('Connected: ' + frame);

      // Subscribe to the call response channel
      stomp.subscribe('/topic/call/response', (message) => {
        const response = JSON.parse(message.body);
        if (response.accepted) {
          // Set up the peer connection if the call is accepted
          setPeerName(response.toUser);
        } else {
          alert('Call Rejected');
        }
      });
    });

    // Access user's camera and microphone
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream);
        document.getElementById('localVideo').srcObject = stream;
      })
      .catch((err) => console.log('Error getting media:', err));
  }, []);

  const handleCallInvite = (toUser) => {
    const invite = {
      fromUser: 'User1', // Replace with actual user
      toUser: toUser,
    };

    // Send the call invite to the backend
    stompClient.send('/app/call/invite', {}, JSON.stringify(invite));
    setCallingUser(toUser);
  };

  const onCallAccepted = () => {
    console.log('Call Accepted');
    const pc = new RTCPeerConnection();
    setPeerConnection(pc);

    // Create offer or handle the connection logic for WebRTC here
    const response = {
      toUser: 'User1',
      accepted: true,
    };
    stompClient.send('/app/call/response', {}, JSON.stringify(response));
  };

  const onCallRejected = () => {
    console.log('Call Rejected');
    const response = {
      toUser: 'User1',
      accepted: false,
    };
    stompClient.send('/app/call/response', {}, JSON.stringify(response));
  };

  return (
    <div>
      {/* Video Call Icon */}
      <div>
        <VideocamIcon
          onClick={() => handleCallInvite('User2')} // Call User2 when the icon is clicked
          style={{ fontSize: 40, cursor: 'pointer', color: 'blue' }}
        />
      </div>

      {/* Display the incoming call */}
      {incomingCall && (
        <IncomingCall
          peerName={peerName}
          onCallAccepted={onCallAccepted}
          onCallRejected={onCallRejected}
        />
      )}

      {/* Local and remote video elements */}
      <div>
        <video id="localVideo" autoPlay muted width="400" />
        <video id="remoteVideo" autoPlay width="400" />
      </div>
    </div>
  );
};

export default VideoCall;
