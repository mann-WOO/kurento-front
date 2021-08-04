// import { Participant } from './js/participant.js'
// import kurentoUtils from 'kurento-utils'

function Participant(name) {
  this.name = name
  let rtcPeer
  Object.defineProperty(this, 'rtcPeer', {writable: true})
}

export default {
  namespaced: true,
  state: () => ({
    ws: null,
    participants: null,
    serverMessage: null,
    myName: null,
  }),
  mutations: {
    WS_INIT(state, url){
      state.ws = new WebSocket(url)
    },
    WS_ONMESSAGE(state, parsedMessage) {
      state.serverMessage = parsedMessage
    },
    SET_MY_NAME(state, myName) {
      state.myName = myName
      state.participants = {}
    },
    ADD_PARTICIPANT(state, participantKey, participantObject) {
      state.participants[participantKey] = participantObject
      console.log('participant added', state.participants)
    }
  },
  actions: {
    wsInit(context, url) {
      context.commit('WS_INIT', url)
      context.state.ws.onmessage = function(message) {
        let parsedMessage = JSON.parse(message.data)
        console.info('Received message: ' + message.data)
        context.commit('WS_ONMESSAGE', parsedMessage)
      }
    },
    sendMessage(context, message) {
      var jsonMessage = JSON.stringify(message)
      console.log('Sending message: ' + jsonMessage)
      context.state.ws.send(jsonMessage)
    },
    setMyName(context, myName) {
      context.commit('SET_MY_NAME', myName)
    },
    onExistingParticipants(context, message) {
      console.log('onExistingParticipants start')
      let participant = new Participant(context.state.myName)
      context.commit('ADD_PARTICIPANT', context.state.myName, participant)
      message.data.forEach(function(sender) {
        context.dispatch('receiveVideo', sender)
        })
      console.log('onExistingParticipants end')
    },
    receiveVideo(context, sender) {
      let participant = new Participant(sender)
      context.commit('ADD_PARTICIPANT', sender, participant)
    }
  },
  getters: {
    
  },
};
