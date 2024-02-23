<template>
  <div class="home">
    <h1>가상 도박 게임</h1>
    <div v-if="user">
      <p>환영합니다, {{ user.email }}!</p>
      <p>잔액: {{ balance }}원</p>
      <input type="number" v-model.number="betAmount" placeholder="베팅 금액" />
      <button @click="placeBet" :disabled="betting">도박하기</button>
      <button @click="signOut">로그아웃</button>
      <p v-if="betting">도박 중입니다...</p>
      <p v-if="betResult">{{ betResult }}</p>
      <div v-if="betHistory.length > 0">
        <h2>베팅 기록</h2>
        <table>
          <thead>
            <tr>
              <th>결과</th>
              <th>베팅 금액</th>
              <th>변경 후 잔액</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in betHistory" :key="index">
              <td>{{ item.result }}</td>
              <td>{{ item.amount }}</td>
              <td>{{ item.balanceAfter }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else>
      <input type="email" v-model="email" placeholder="이메일" />
      <input type="password" v-model="password" placeholder="비밀번호" />
      <button @click="signIn">로그인</button>
    </div>
  </div>
</template>

<script>
import { auth, db } from '@/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';

export default {
  name: 'HomeView',
  data() {
    return {
      user: null,
      email: '',
      password: '',
      betAmount: 0,
      balance: 0,
      betting: false,
      betResult: '',
      betHistory: [],
    };
  },
  methods: {
    async signIn() {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
        this.user = userCredential.user;
        this.loadBalance();
      } catch (error) {
        alert(error.message);
      }
    },
    async signOut() {
      await signOut(auth);
      this.user = null;
      this.balance = 0;
      this.betting = false;
      this.betResult = '';
      this.betHistory = [];
    },
    async loadBalance() {
      if (!this.user) return;
      const userDocRef = doc(db, "users", this.user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        this.balance = userDoc.data().balance;
        this.betHistory = userDoc.data().betHistory || [];
      } else {
        await setDoc(userDocRef, { balance: 10000, betHistory: [] });
        this.balance = 10000;
      }
    },
    async placeBet() {
      if (this.betAmount <= 0 || this.betAmount > this.balance) {
        alert('유효하지 않은 베팅 금액입니다.');
        return;
      }

      this.betting = true;
      this.betResult = '';

      setTimeout(async () => {
        const win = Math.random() < 0.5;
        let resultMessage;
        if (win) {
          this.balance += this.betAmount;
          resultMessage = '성공했습니다! 잔액이 증가했습니다.';
        } else {
          this.balance -= this.betAmount;
          resultMessage = '실패했습니다. 잔액이 줄었습니다.';
        }

        this.betResult = resultMessage;
        this.betHistory.push({
          result: win ? '성공' : '실패',
          amount: this.betAmount,
          balanceAfter: this.balance
        });

        const userDocRef = doc(db, "users", this.user.uid);
        await updateDoc(userDocRef, {
          balance: this.balance,
          betHistory: this.betHistory
        });

        this.betting = false;
      }, 2000);
    },
  },
  created() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.user = user;
        await this.loadBalance();
      } else {
        this.user = null;
        this.balance = 0;
        this.betHistory = [];
      }
    });
  },
};
</script>

<style scoped>
.home {
  text-align: center;
  margin-top: 50px;
}

input,
button {
  margin: 10px;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

button {
  cursor: pointer;
  background-color: #42b983;
  color: white;
}

button:hover {
  background-color: #333;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

table {
  margin-top: 20px;
  width: 60%;
  margin-left: auto;
  margin-right: auto;
  border-collapse: collapse;
}

th,
td {
  padding: 8px;
  text-align: center;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f2f2f2;
}

tr:hover {
  background-color: #f5f5f5;
}
</style>
