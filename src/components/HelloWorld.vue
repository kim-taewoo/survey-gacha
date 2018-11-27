<template>
  <v-container fluid>
    <v-slide-y-transition mode="out-in">
      <v-layout column align-center>
        <v-flex class="my-3" v-for="(survey,index) in surveys" :key= index>
          <div @click.stop="deleteSurvey(survey.id)">
            {{survey.title}}
          </div>
          <div>
            {{survey.content}}
          </div>
        </v-flex>
      </v-layout>
    </v-slide-y-transition>
    <v-layout wrap justify-center align-center>
      <v-flex xs12 sm6 md3>
        <v-text-field
          label="Regular"
          v-model="title"
          placeholder="Placeholder"
        ></v-text-field>
      </v-flex>
      <v-flex xs12 sm6 md3>
        <v-text-field
          label="Regular"
          v-model="slug"
          placeholder="Placeholder"
        ></v-text-field>
      </v-flex>
      <v-flex xs12 sm6 md3>
        <v-text-field
          label="content"
          v-model="content"
          placeholder="Placeholder"
        ></v-text-field>
      </v-flex>
      <v-flex>
        <v-btn @click="addSurvey">전송</v-btn>
        <v-btn @click="deleteSurvey">삭제</v-btn>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import db from '@/firebase/init.js'
export default {
  data () {
    return {
      surveys: [],
      title: '',
      content: '',
      slug: ''
    }
  },
  methods: {
    deleteSurvey (id) {
      console.log(id)
      db.collection('surveys').doc(id).delete()
      .then(() => {
        this.surveys = this.surveys.filter(survey => {
          return survey.id != id
        })
      })
    },
    addSurvey () {
      db.collection('surveys').add({
        title: this.title,
        content: this.content,
        slug: this.slug
      })
      .then( () => {
        alert('성공!')
      })
    },
    deleteSurvey () {

    }
  },
  created() {
    

    db.collection('surveys').get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        console.log(doc)
        let survey = doc.data() 
        survey.id = doc.id
        this.surveys.unshift(survey)
        // window.location.replace("http://stackoverflow.com");
      })
    })
  }
}
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
