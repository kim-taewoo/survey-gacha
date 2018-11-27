<template>
  <v-container fill-height>
    <v-layout wrap justify-center align-center>
      <v-flex xs12>
        <p style="user-select:none">아직 <span class="pink--text">{{docLength}}</span> 개의 상품이 남아있습니다.</p>
        <figure id="bridgeContainer" class="grey darken-3 py-2 px-2">
            <canvas id="bridge" width="750" height="550"></canvas>
        </figure>
        <figcaption style="user-select:none" class="text-xs-center mt-2">↑ 긁어보세요!</figcaption>
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
  data () {
    return {
      changed: false,
      imgUrl: null,
      gacha: false,
      docLength: 0,
      nextTime: nextTime
    }
  },
  methods: {
    changeState () {
      this.changed = !this.changed
    },
    drawImage() {
      var bridge = document.getElementById("bridge"),
      bridgeCanvas = bridge.getContext('2d'),
      brushRadius = (bridge.width / 100) * 5,
      img = new Image();

      if (brushRadius < 50) { brushRadius = 50 }

      
      img.loc = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/4273/';
      img.filename = 'calgary-bridge-2013.jpg';
      if (window.devicePixelRatio >= 2) {
        var nameParts = img.filename.split('.');
        img.src = img.loc + nameParts[0]+"-2x"+"."+nameParts[1];
      } else {
        img.src = img.loc + img.filename;
      }
      // img.src = this.imgUrl
      // this.$nextTick(function () {
      //   this.setBackground()
      // })
      // if (img.getAttribute('src')) {
      //   this.$nextTick(function () {
      //     this.setBackground()
      //   })
      // }
      var vm = this
      img.onload = function(){  
        bridgeCanvas.drawImage(img, 0, 0, bridge.width, bridge.height);
        vm.setBackground()
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
    let ref = db.collection('surveys').doc('4EVtv9nkqdLM2LjbByJs')
    ref.get()
    .then((doc) => {
      this.docLength = doc.data().gifts.unused.length
      if (this.docLength >= 1) {
        const rand = Math.random() <= 0.7
        if (rand) {
          this.imgUrl = doc.data().gifts.unused[0]
          let gifts = doc.data().gifts
          gifts.used.push(gifts.unused[0])
          ref.update({
            "gifts.unused" : gifts.unused.slice(1,),
            "gifts.used" : gifts.used
          })
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
    

      // ref.update({
      //   "gifts.unused" : gifts.unused.slice(1,),
      //   "gifts.used" : gifts.used.slice().push(gifts.unused[0])
      // })

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


