<template>
  <v-container fill-height>
    <v-layout wrap justify-center align-center>
      <v-flex xs12 md6>
        <p class="pl-2" style="user-select:none">
          <span class="pink--text">{{docLength}}</span> 개의 상품이 남아있습니다!
        </p>
        <p class="pl-2" style="user-select:none">
          <span class="blue--text">{{remainGacha}}</span> 개의 뽑기권이 남아있습니다!
        </p>
        <figure
          v-show="imgReady"
          id="bridgeContainer"
          class="grey darken-3 py-2 px-2"
          style="border-radius: 10px"
        >
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

        <v-flex xs12 class="text-xs-center my-3">
          <v-btn @click="retryGacha()" color="pink" block>재도전!</v-btn>
        </v-flex>
        <v-flex>
          <v-btn @click.stop="dialog=true" color="blue" block>공유하고 추가 뽑기권 받기</v-btn>
          <v-dialog v-model="dialog" width="500">
            <v-card>
              <v-card-title class="headline" primary-title>공유하는 방법</v-card-title>

              <v-card-text>
                <div>아래에 본인만의 아이디를 씁니다.</div>
                <v-flex class="xs12 md4">
                  <v-text-field hide-details label="아이디" v-model="share_id"></v-text-field>
                  <div v-if="feedback" class="text-xs-center red--text my-2">{{feedback}}</div>
                </v-flex>
                <v-flex>
                  <v-btn :loading="loading" block color="blue" @click="checkDup">중복확인</v-btn>
                </v-flex>
                <div>중복확인까지 완료했다면 아래 생성된 주소를 복사해서 공유해주세요!</div>
                <div
                  v-if="slug"
                  class="my-3 pink--text subheading"
                  v-text="shareAddress"
                  style="word-wrap:break-word;"
                ></div>

                <div>이후 공유받은 친구가 해당 주소로 접속할 경우, 뽑기권이 추가됩니다. 해당 뽑기권은 현재 주소 뒤에
                  <span class="mx-3 pink--text title">/{{slug}}</span>(위에서 생성한 아이디) 가 붙은 페이지에서 확인할 수 있습니다!
                </div>
              </v-card-text>

              <v-divider></v-divider>

              <v-card-actions>
                <v-btn color="primary" block @click="dialog = false">알겠어요!</v-btn>
              </v-card-actions>
              <v-card-actions>
                <v-btn :disabled="!slug" color="pink" block :to="{name:'GachaShare', params: {id:id, share_id:slug}}">내 페이지 가보기</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-flex>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import db from '@/firebase/init.js'
import firebaseApp from 'firebase/app'
import appStorage from 'firebase/storage'
import slugify from 'slugify'
import nextTime from '@/assets/nextTime.png'

export default {
  props: ['id'],
  data () {
    return {
      imgUrl: null,
      coverImg: null,
      docLength: 0,
      nextTime: nextTime,
      imgReady: false,
      remainGacha: 0,
      dialog: false,
      share_id: null,
      slug: null,
      feedback: null,
      loading: false
    }
  },
  computed: {
    shareAddress () {
      return  `surveygacha.firebaseapp.com/share/${this.id}/${this.slug}`
    }
  },
  methods: {
    checkDup() {
      if (this.share_id) {
        this.loading = true
        this.slug = slugify(this.share_id, {
          replacement: '-',
          remove: /[$*_+~.()'"!:@]/g,
          lower: true
        })
        let ref = db.collection('shareUsers').doc(this.slug)
        ref.get()
        .then(doc => {
          if (doc.exists) {
            this.feedback = "중복된 아이디가 있네요ㅠ"
            this.loading = false
          } else {
            ref.set({
              shared: 0
            }).then(()=>{
              this.feedback = "좋아요!"
              this.loading = false
            })
          }
        })
        .catch(err=>{
          console.log(err)
          this.loading=false
        })
      } else {
        this.feedback = "아이디를 입력하세요!"
      }
    },
    prepareGacha () {

      let ref = db.collection('surveys').doc(this.id)
      ref.get()
      .then((doc) => {
        if (!doc.exists) {
          this.$router.push({name:'ErrorPage'})
        } else {
          this.docLength = doc.data().gifts.unused.length
          if (this.remainGacha <= 0) {
            this.imgUrl = this.nextTime
            this.setBackground()
            this.imgReady=true
            alert('뽑기권이 없네요ㅠ')
          } else {
            if (this.docLength >= 1) {
              let rand = Math.random() <= 0.03
              if (rand) {
                this.imgUrl = doc.data().gifts.unused[0]
                let gifts = doc.data().gifts
                gifts.used.push(gifts.unused[0])
                ref.update({
                  "gifts.unused" : gifts.unused.slice(1,),
                  "gifts.used" : gifts.used
                })
                this.drawImage()
              } else {
                this.imgUrl = this.nextTime
                this.drawImage()
              }
            } else {
              this.imgUrl = this.nextTime
              this.setBackground()
              this.imgReady = true
            }
          }
        }
      })

    },
    retryGacha() {
      if (this.remainGacha <= 0) {
        alert('뽑기권이 없네요! ㅠㅠ')
        this.setBackground()
        this.imgReady = true
      } else {
        this.imgReady = false
        this.imgUrl = null
        this.remainGacha--
        localStorage.setItem('remainGacha', this.remainGacha)
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
    const gacha = localStorage.getItem('remainGacha')
    if (!gacha) {
      localStorage.setItem('remainGacha', 3)
      this.remainGacha = 3
    } else {
      this.remainGacha = localStorage.getItem('remainGacha')
    }
  },

  mounted () {
    this.prepareGacha()
  },
}
</script>

<style scoped>
body {
  margin: 0;
}

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
  cursor: crosshair;
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


