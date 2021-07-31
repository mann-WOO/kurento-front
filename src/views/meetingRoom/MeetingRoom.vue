<template>
	<div id="container">
		<div id="wrapper">
			<div id="join" class="animate join">
				<h1>Join a Room</h1>
				<form @submit="register" accept-charset="UTF-8">
					<p>
						<input type="text" name="name" value="" id="name"
							placeholder="Username" required>
					</p>
					<p>
						<input type="text" name="room" value="" id="roomName"
							placeholder="Room" required>
					</p>
					<p class="submit">
						<input type="submit" name="commit" value="Join!">
					</p>
				</form>
			</div>
			<div id="room" style="display: none;">
				<h2 id="room-header"></h2>
				<div id="participants"></div>
				<input type="button" id="button-leave" onmouseup="leaveRoom();"
					value="Leave room">
			</div>
		</div>
	</div>
</template>

<script>
// import "./template.scss";
import { Participant } from "./js/participant.js"
import kurentoUtils from 'kurento-utils'

export default {
  name: 'MeetingRoom',
  components: {
  },
  // : props
  props: {
  },
  // : data
  data() {
    return {
      ws: null,
      participants: null,
      name: null,
      room: null,
    }
  },
  // : computed
  computed: {
  },
  // :lifecycle hook
  created() {
    this.ws = new WebSocket('wss://' + location.host + '/groupcall')
    window.onbeforeunload = function() {
      this.ws.close()
    }
    this.ws.onmessage = function(message) {
      var parsedMessage = JSON.parse(message.data);
      console.info('Received message: ' + message.data);

      switch (parsedMessage.id) {
      case 'existingParticipants':
        this.onExistingParticipants(parsedMessage);
        break;
      case 'newParticipantArrived':
        this.onNewParticipant(parsedMessage);
        break;
      case 'participantLeft':
        this.onParticipantLeft(parsedMessage);
        break;
      case 'receiveVideoAnswer':
        this.receiveVideoResponse(parsedMessage);
        break;
      case 'iceCandidate':
        this.participants[parsedMessage.name].rtcPeer.addIceCandidate(parsedMessage.candidate, function (error) {
              if (error) {
              console.error("Error adding candidate: " + error);
              return;
              }
          });
          break;
      default:
        console.error('Unrecognized message', parsedMessage);
      }
    }
  },
  // : lifecycle hook
  mounted() {
  },
  // : methods
  methods: {
    sendMessage: function(message) {
      var jsonMessage = JSON.stringify(message);
      console.log('Sending message: ' + jsonMessage);
      this.ws.send(jsonMessage);
    },
    onParticipantLeft: function(request) {
      console.log('Participant ' + request.name + ' left');
      var participant = this.participants[request.name];
      participant.dispose();
      delete this.participants[request.name];
    },
    receiveVideo: function(sender) {
      var participant = new Participant(sender);
      this.participants[sender] = participant;
      var video = participant.getVideoElement();

      var options = {
          remoteVideo: video,
          onicecandidate: participant.onIceCandidate.bind(participant)
        }

      participant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options,
          function (error) {
            if(error) {
              return console.error(error);
            }
            this.generateOffer (participant.offerToReceiveVideo.bind(participant));
      });;
    },
    leaveRoom: function() {
      this.sendMessage({
        id : 'leaveRoom'
      });

      for ( var key in this.participants) {
        this.participants[key].dispose();
      }

      document.getElementById('join').style.display = 'block';
      document.getElementById('room').style.display = 'none';

      this.ws.close();
    },
    onExistingParticipants: function(msg) {
      var constraints = {
        audio : true,
        video : {
          mandatory : {
            maxWidth : 320,
            maxFrameRate : 15,
            minFrameRate : 15
          }
        }
      };
      console.log(this.name + " registered in room " + this.room);
      var participant = new Participant(this.name);
      this.participants[this.name] = participant;
      var video = participant.getVideoElement();

      var options = {
            localVideo: video,
            mediaConstraints: constraints,
            onicecandidate: participant.onIceCandidate.bind(participant)
          }
      participant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options,
        function (error) {
          if(error) {
            return console.error(error);
          }
          this.generateOffer (participant.offerToReceiveVideo.bind(participant));
      });

      msg.data.forEach(this.receiveVideo);
    },
    callResponse: function(message) {
      if (message.response != 'accepted') {
        console.info('Call not accepted by peer. Closing call');
        stop();
      } else {
        webRtcPeer.processAnswer(message.sdpAnswer, function (error) {
          if (error) return console.error (error);
        });
      }
    },
    receiveVideoResponse: function(result) {
      this.participants[result.name].rtcPeer.processAnswer (result.sdpAnswer, function (error) {
        if (error) return console.error (error);
      });
    },
    onNewParticipant: function(request) {
      this.receiveVideo(request.name);
    },
    register: function(event) {
      event.preventDefault()
      this.name = document.getElementById('name').value;
      this.room = document.getElementById('roomName').value;

      document.getElementById('room-header').innerText = 'ROOM ' + this.room;
      document.getElementById('join').style.display = 'none';
      document.getElementById('room').style.display = 'block';

      var message = {
        id : 'joinRoom',
        name : this.name,
        room : this.room,
      }
      this.sendMessage(message);
    },
  }
}
</script>