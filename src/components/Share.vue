<template>
  <v-container fill-height>
    <v-layout wrap justify-center align-center>
      <v-flex xs12 class="d-flex justify-center align-center" style="flex-direction:column">
        <v-progress-circular
              justify-center
              :size="50"
              color="amber"
              indeterminate
              
          ></v-progress-circular>
        <div class="mt-3">
          설문으로 이동중...
        </div>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import db from '@/firebase/init.js'
export default {
  props: ['share_id', 'id'],
  created () {
    const isSame = localStorage.getItem(this.id)
    if (isSame) {
      alert('한 기종에서 여러번 공유할 수 없습니다.')
      window.location.replace('https://www.naver.com/')
    } else {
      localStorage.setItem(this.id, 'done')
    }
  },
  mounted () {
    // console.log(this.share_id, this.id)
    // 설문 아이디도 반영할 수 있도록 수정해야 함.
    let ref = db.collection('shareUsers').doc(this.share_id)
    ref.get()
    .then(doc => {
      let shared = doc.data().shared
      // console.log(shared)
      shared++
      return shared
    })
    .then((shared)=>{
      console.log(shared)
      ref.update({
        shared: shared
      })
      .then (() => {
        window.location.replace('https://www.naver.com/')
      })
    })
    .catch((err)=> {
      window.location.replace('https://www.naver.com/')
    })
  }
}
</script>

