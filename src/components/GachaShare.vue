<template>
  <v-container fill-height>
    <v-layout wrap justify-center align-center>
      <v-flex xs12>
        <h3 class="pl-2 mb-3" >공유해주셔서 감사합니다 {{share_id}} 님!!</h3>
        <p class="pl-2" style="user-select:none"> <span class="pink--text">{{docLength}}</span> 개의 상품이 남아있습니다!</p>
        <p class="pl-2" style="user-select:none"> 공유로 인한 추가 뽑기권이 <span class="blue--text">{{remainGachaShare}}</span> 장 남았습니다!</p>
        <figure v-show="imgReady" id="bridgeContainer" class="grey darken-3 py-2 px-2" style="border-radius: 10px">
            <canvas id="bridge" width="750" height="550"></canvas>
        </figure>
        <figure v-show="!imgReady" class="grey darken-3 py-3 px-2 pa-5" style="border-radius: 10px">
          <v-flex xs12 class="d-flex justify-center">
            <v-progress-circular
              justify-center
              :size="50"
              color="amber"
              indeterminate
              class="d-flex justify-center"
            ></v-progress-circular>
          </v-flex>
        </figure>
        <figcaption style="user-select:none" class="text-xs-center mt-2 title">↑ 긁어보세요!</figcaption>

        <v-flex xs12 class="text-xs-center mt-3">
          <v-btn @click="retryGacha()" color="pink" block>재도전!</v-btn>
        </v-flex>


      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import db from '@/firebase/init.js'
import firebaseApp from 'firebase/app'
import appStorage from 'firebase/storage'

import nextTime from '@/assets/nextTime.png'

export default {
  props: ['share_id', 'id'],
  data () {
    return {
      imgUrl: null,
      coverImg: null,
      docLength: 0,
      nextTime: nextTime,
      imgReady: false,
      remainGachaShare: 0
    }
  },
  methods: {
    prepareGacha () {
      let ref = db.collection('surveys').doc('XDZuvUGl6e7HxyrFlK8v')
      ref.get()
      .then((doc) => {
        this.docLength = doc.data().gifts.unused.length
        if (this.docLength >= 1) {
          let rand = Math.random() <= 0.08
          if (rand) {
            this.imgUrl = doc.data().gifts.unused[0]
            let gifts = doc.data().gifts
            gifts.used.push(gifts.unused[0])
            // ref.update({
            //   "gifts.unused" : gifts.unused.slice(1,),
            //   "gifts.used" : gifts.used
            // })
          } else {
            this.imgUrl = this.nextTime
          }
        } else {
          this.imgUrl = this.nextTime
        }
      })
      .then(() => {
        this.drawImage()
      })
    },
    retryGacha() {
      if (this.remainGachaShare <= 0) {
        alert('뽑기권을 다 쓰셨네요! ㅠㅠ')
      } else {
        this.imgReady = false
        this.imgUrl = null
        this.remainGachaShare--
        db.collection('shareUsers').doc(this.share_id).update({
          shared: this.remainGachaShare
        })
        var bridge = document.getElementById("bridge")
        var bridgeCanvas = bridge.getContext('2d')
        bridgeCanvas.clearRect(0, 0, bridge.width, bridge.height);
  
        // clear path
        bridgeCanvas.beginPath();
  
        // use default comp. mode
        bridgeCanvas.globalCompositeOperation = "source-over";
  
        // reset alpha
        bridgeCanvas.globalAlpha = 1;
  
        this.prepareGacha()
      }
    },
    drawImage() {
      var bridge = document.getElementById("bridge")
      var bridgeCanvas = bridge.getContext('2d')
      
      var brushRadius = (bridge.width / 100) * 5
      var img = new Image()

      if (brushRadius < 40) { brushRadius = 40 }
      // console.log('다시')

      // var coverImg = `https://picsum.photos/${bridge.width}/${bridge.height}/?random`
      // img.src= coverImg
      img.src= require('@/assets/boxImage.jpeg')
      // img.loc = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/4273/';
      // img.filename = 'calgary-bridge-2013.jpg';
      // if (window.devicePixelRatio >= 2) {
      //   var nameParts = img.filename.split('.');
      //   img.src = img.loc + nameParts[0]+"-2x"+"."+nameParts[1];
      // } else {
      //   img.src = img.loc + img.filename;
      // }
  
      var vm = this
      img.onload = function(){  
        bridgeCanvas.drawImage(img, 0, 0, bridge.width, bridge.height);
        vm.setBackground()
        vm.imgReady = true
      } 

      function detectLeftButton(event) {
          if ('buttons' in event) {
              return event.buttons === 1;
          } else if ('which' in event) {
              return event.which === 1;
          } else {
              return event.button === 1;
          }
      }

      function getBrushPos(xRef, yRef) {
        var bridgeRect = bridge.getBoundingClientRect();
          return {
          x: Math.floor((xRef-bridgeRect.left)/(bridgeRect.right-bridgeRect.left)*bridge.width),
          y: Math.floor((yRef-bridgeRect.top)/(bridgeRect.bottom-bridgeRect.top)*bridge.height)
          };
      }
            
      function drawDot(mouseX,mouseY){
        bridgeCanvas.beginPath();
          bridgeCanvas.arc(mouseX, mouseY, brushRadius, 0, 2*Math.PI, true);
          bridgeCanvas.fillStyle = '#000';
          bridgeCanvas.globalCompositeOperation = "destination-out";
          bridgeCanvas.fill();
      }

      bridge.addEventListener("mousemove", function(e) {
        var brushPos = getBrushPos(e.clientX, e.clientY);
        var leftBut = detectLeftButton(e);
        if (leftBut == 1) {
          drawDot(brushPos.x, brushPos.y);
        }
      }, false);

      bridge.addEventListener("touchmove", function(e) {
          e.preventDefault();
          var touch = e.targetTouches[0];
          if (touch) {
          var brushPos = getBrushPos(touch.pageX, touch.pageY);
              drawDot(brushPos.x, brushPos.y);
          }
      }, false);
    },

    setBackground() {
      var bridge = document.getElementById("bridge")
      bridge.style.backgroundImage = `url(${this.imgUrl}`
      // bridge.style.backgroundImage = -webkit-image-set(url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/4273/calgary-bridge-1943.jpg') 1x, url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/4273/calgary-bridge-1943-2x.jpg') 2x );
    }
  },

  created () {
    // 라우터가드로 변경해야함.
    db.collection('shareUsers').doc(this.share_id).get()
    .then(doc => {
      if (!doc.exists) {
        this.$router.push({name:'ErrorPage'})
      } else {
        this.remainGachaShare = doc.data().shared
      }
    })
    // const gacha = localStorage.getItem('remainGachaShare')
    // if (!gacha) {
    //   localStorage.setItem('remainGachaShare', 1)
    //   this.remainGachaShare = 1
    // } else {
    //   this.remainGachaShare = localStorage.getItem('remainGachaShare')
    // }
    console.log(this.share_id)
  },

  mounted () {
    this.prepareGacha()
  },
}
</script>

<style scoped>
body { margin: 0; }

#bridge {
	display: block;
	margin: 0 auto;
  /* background-image: url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/4273/calgary-bridge-1943.jpg');
	background-image: -webkit-image-set(url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/4273/calgary-bridge-1943.jpg') 1x, url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/4273/calgary-bridge-1943-2x.jpg') 2x ); */
	background-size: contain;
  background-position: center center;
	width: 100%;
	max-width: 650px;
	height: auto;
  cursor:  crosshair;
  /* cursor: url(https://s3-us-west-2.amazonaws.com/s.cdpn.io/4273/circular-cursor.png) 53 53, crosshair; */
}
#bridgeContainer { 
  text-align: center;
  font-family: Avenir, sans-serif;
}
#bridgeContainer figcaption {   
  margin-top: 2rem; 
}
</style>


