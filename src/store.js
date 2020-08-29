import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default () => {
  let store = new Vuex.Store({
    state: {
      username: 'song',
    },
    mutations: {
      changeName(state) {
        state.username = 'hello';
      },
    },
    actions: {
      changeName({ commit }) {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            commit('changeName');
            resolve();
          }, 1000);
        });
      },
    },
  });
  return store;
};
