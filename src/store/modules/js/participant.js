import store from "@/store/index.js"

export default function Participant(name) {
  this.name = name
  
  var rtcPeer
  Object.defineProperty(this, 'rtcPeer', {writable: true})

  var container = document.createElement('div');
  var video = document.createElement('video');

  container.appendChild(video);

  video.id = 'video-' + name;
  video.autoplay = true;
  video.controls = false;

  this.getElement = function() {
		return container;
	}

  this.getVideoElement = function() {
		return video;
	}

  this.offerToReceiveVideo = function(error, offerSdp, wp){
    if (error) return console.error("sdp offer error")
    console.log('Invoking participant.offerToReceiveVideo method')
    let message = {
      id: "receiveVideoFrom",
      sender : name,
      sdpOffer : offerSdp
    }
    store.dispatch('meetingRoom/sendMessage', message)
  }

  this.onIceCandidate = function(candidate, wp) {
    console.log("Local Participant candidate" + JSON.stringify(candidate))

    let message = {
      id: 'onIceCandidate',
      cnadidate: candidate,
      name: name
    }
    // vuex store의 sendmessage 이용
    store.dispatch('meetingRoom/sendMessage', message)
  }
}